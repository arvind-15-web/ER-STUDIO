const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const connectDB = require('./db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Mongoose Models ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

const BlueprintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sql_content: { type: String, required: true },
  type: { type: String, default: 'code' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Associate blueprint with user
}, { timestamps: true });
const Blueprint = mongoose.model('Blueprint', BlueprintSchema);

// --- JWT Middleware ---
const authMiddleware = (req, res, next) => {
  let token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
  
  // Handle 'Bearer <token>' format
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  }

  // Allow prototype testing without full Google Verification backend
  if (token === 'google_dummy_token' || token.startsWith('google_') || token.startsWith('guest_')) {
    // Must be a valid 24-character hex string so Mongoose doesn't throw a CastError on ObjectId
    req.user = '507f1f77bcf86cd799439011';
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// --- AUTH API ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1d' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid Credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1d' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// --- BLUEPRINT API ---
app.post('/api/blueprints', authMiddleware, async (req, res) => {
  try {
    const { title, sql_content } = req.body;
    if (!title || !sql_content) return res.status(400).json({ error: 'Title and SQL required' });

    const newBlueprint = new Blueprint({ title, sql_content, type: req.body.type || 'code', user_id: req.user });
    const savedBlueprint = await newBlueprint.save();
    res.status(201).json(savedBlueprint);
  } catch (err) {
    res.status(500).json({ error: 'Server error saving blueprint' });
  }
});

app.get('/api/blueprints', authMiddleware, async (req, res) => {
  try {
    const filter = { user_id: req.user };
    if (req.query.type) filter.type = req.query.type;
    const blueprints = await Blueprint.find(filter).sort({ createdAt: -1 });
    res.json(blueprints);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching blueprints' });
  }
});

app.delete('/api/blueprints/:id', authMiddleware, async (req, res) => {
  try {
    const blueprintId = req.params.id;
    const deletedBlueprint = await Blueprint.findOneAndDelete({ _id: blueprintId, user_id: req.user });
    
    if (!deletedBlueprint) {
      return res.status(404).json({ error: 'Blueprint not found or unauthorized' });
    }
    
    res.json({ message: 'Blueprint deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting blueprint' });
  }
});

// --- AI GENERATION API (Gemini) ---
const { GoogleGenerativeAI } = require('@google/generative-ai');

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;
    if (!prompt && !imageBase64) return res.status(400).json({ error: 'Prompt or image is required' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not set in backend .env' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const systemInstruction = `You are an expert SQL database architect. 
The user will describe a software application or provide a picture of an Entity Relationship Diagram (ERD).
Your job is to design a perfectly normalized database schema for it.
RULES:
1. Return ONLY pure, raw PostgreSQL 'CREATE TABLE' statements. 
2. Absolutely NO markdown formatting, NO backticks (\`\`\`sql), NO explanations. 
3. Include PRIMARY KEY and FOREIGN KEY relationships.
4. Keep it concise but complete.`;

    const contentArray = [];
    contentArray.push(`${systemInstruction}\n\nUser Request: ${prompt || 'Analyze this diagram and generate the exact raw SQL CREATE TABLE statements for it.'}`);
    
    if (imageBase64) {
      // Strip the prefix if the frontend sends data:image/png;base64,...
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      // Guess mime type from prefix or default to png
      let mimeType = "image/png";
      if (imageBase64.includes("image/jpeg")) mimeType = "image/jpeg";
      if (imageBase64.includes("image/webp")) mimeType = "image/webp";

      contentArray.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    const result = await model.generateContent(contentArray);
    let sqlOutput = result.response.text();
    
    // Clean up any stray markdown if the AI disobeys
    sqlOutput = sqlOutput.replace(/```sql\n?/gi, '').replace(/```\n?/gi, '').trim();

    res.json({ sql: sqlOutput });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate schema from AI' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});// Force nodemon restart
