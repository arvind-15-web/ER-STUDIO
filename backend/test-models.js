const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There's no direct listModels in the simple SDK, we can just try a few model names
    const modelsToTry = ["gemini-pro", "gemini-1.5-pro", "gemini-3-flash-preview", "gemini-2.5-flash"];
    
    for (const m of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(m + " WORKED!");
        return;
      } catch(e) {
        console.log(m + " FAILED: " + e.message);
      }
    }
  } catch(e) {
    console.error("FATAL ERROR:", e);
  }
}
test();
