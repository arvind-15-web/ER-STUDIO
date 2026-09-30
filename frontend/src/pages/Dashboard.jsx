import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, FolderOpen, Play, LogOut, Database, Share2, Sparkles, Moon, Sun, Wand2, LayoutGrid, X, Copy, Download, Check, Trash2 } from 'lucide-react';
import { toPng } from 'html-to-image';

import TableNode from '../components/TableNode';
import ChenEntityNode from '../components/ChenEntityNode';
import ChenAttributeNode from '../components/ChenAttributeNode';
import ChenRelationshipNode from '../components/ChenRelationshipNode';
import VisualBuilder from '../components/VisualBuilder';
import { parseSQL } from '../utils/sqlParser';
import '../App.css';

const nodeTypes = {
  tableNode: TableNode,
  chenEntity: ChenEntityNode,
  chenAttribute: ChenAttributeNode,
  chenRelationship: ChenRelationshipNode
};

const defaultSQL = `CREATE TABLE heroes (
  id UUID PRIMARY KEY,
  codename VARCHAR(50) NOT NULL
);

CREATE TABLE powers (
  id SERIAL PRIMARY KEY,
  hero_id UUID REFERENCES heroes(id),
  power_name VARCHAR(100)
);`;

function FlowDashboard() {
  const [sql, setSql] = useState(defaultSQL);
  const [title, setTitle] = useState('My Creative Schema');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [error, setError] = useState(null);
  const [savedBlueprints, setSavedBlueprints] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Theme and UI State
  const [theme, setTheme] = useState('dark');
  const [notationMode, setNotationMode] = useState('professional');
  const [isAIPanel, setIsAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Polish UI State
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  // Built-in Templates
  const templates = [
    { title: "E-Commerce Store", sql: `CREATE TABLE users ( id UUID PRIMARY KEY, email VARCHAR(100) );\nCREATE TABLE products ( id SERIAL PRIMARY KEY, name VARCHAR(100), price DECIMAL );\nCREATE TABLE orders ( id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), total DECIMAL );\nCREATE TABLE order_items ( id SERIAL PRIMARY KEY, order_id UUID REFERENCES orders(id), product_id INT REFERENCES products(id), qty INT );` },
    { title: "Social Media Platform", sql: `CREATE TABLE users ( id UUID PRIMARY KEY, handle VARCHAR(50) );\nCREATE TABLE posts ( id SERIAL PRIMARY KEY, user_id UUID REFERENCES users(id), content TEXT );\nCREATE TABLE comments ( id SERIAL PRIMARY KEY, post_id INT REFERENCES posts(id), user_id UUID REFERENCES users(id), text TEXT );\nCREATE TABLE follows ( follower_id UUID REFERENCES users(id), following_id UUID REFERENCES users(id), PRIMARY KEY(follower_id, following_id) );` },
    { title: "SaaS Subscription", sql: `CREATE TABLE organizations ( id UUID PRIMARY KEY, name VARCHAR );\nCREATE TABLE users ( id UUID PRIMARY KEY, org_id UUID REFERENCES organizations(id), email VARCHAR );\nCREATE TABLE subscriptions ( id SERIAL PRIMARY KEY, org_id UUID REFERENCES organizations(id), plan VARCHAR, status VARCHAR );\nCREATE TABLE invoices ( id SERIAL PRIMARY KEY, sub_id INT REFERENCES subscriptions(id), amount DECIMAL, paid BOOLEAN );` },
    { title: "Hospital Management", sql: `CREATE TABLE Doctors (\n  id INT PRIMARY KEY,\n  name VARCHAR(100),\n  specialty VARCHAR(100)\n);\nCREATE TABLE Patients (\n  id INT PRIMARY KEY,\n  name VARCHAR(100),\n  is_admitted BOOLEAN\n);\nCREATE TABLE Appointments (\n  id INT PRIMARY KEY,\n  patient_id INT REFERENCES Patients(id),\n  doctor_id INT REFERENCES Doctors(id),\n  date TIMESTAMP\n);` },
    { title: "Video Game RPG", sql: `CREATE TABLE Players (\n  id UUID PRIMARY KEY,\n  username VARCHAR(50),\n  level INT,\n  is_banned BOOLEAN\n);\nCREATE TABLE Inventory (\n  id SERIAL PRIMARY KEY,\n  player_id UUID REFERENCES Players(id),\n  gold_coins INT\n);\nCREATE TABLE Items (\n  id INT PRIMARY KEY,\n  inv_id INT REFERENCES Inventory(id),\n  item_name VARCHAR(50),\n  is_equipped BOOLEAN\n);` },
    { title: "Logistics Delivery", sql: `CREATE TABLE Warehouses (\n  id INT PRIMARY KEY,\n  location VARCHAR(200)\n);\nCREATE TABLE Drivers (\n  id INT PRIMARY KEY,\n  name VARCHAR(100),\n  is_available BOOLEAN\n);\nCREATE TABLE Shipments (\n  id UUID PRIMARY KEY,\n  warehouse_id INT REFERENCES Warehouses(id),\n  driver_id INT REFERENCES Drivers(id),\n  status VARCHAR(50),\n  requires_signature BOOLEAN\n);` },
    { title: "Banking System", sql: `CREATE TABLE Customers ( id UUID PRIMARY KEY, name VARCHAR );\nCREATE TABLE Accounts ( id INT PRIMARY KEY, customer_id UUID REFERENCES Customers(id), balance DECIMAL );\nCREATE TABLE Transactions ( id UUID PRIMARY KEY, account_id INT REFERENCES Accounts(id), amount DECIMAL, type VARCHAR );\nCREATE TABLE Loans ( id INT PRIMARY KEY, customer_id UUID REFERENCES Customers(id), amount DECIMAL, interest_rate DECIMAL );` },
    { title: "University Management", sql: `CREATE TABLE Departments ( id INT PRIMARY KEY, name VARCHAR );\nCREATE TABLE Professors ( id INT PRIMARY KEY, dept_id INT REFERENCES Departments(id), name VARCHAR );\nCREATE TABLE Courses ( id INT PRIMARY KEY, prof_id INT REFERENCES Professors(id), title VARCHAR );\nCREATE TABLE Students ( id UUID PRIMARY KEY, major_id INT REFERENCES Departments(id), name VARCHAR );\nCREATE TABLE Enrollments ( student_id UUID REFERENCES Students(id), course_id INT REFERENCES Courses(id), PRIMARY KEY(student_id, course_id) );` },
    { title: "Airline Reservation", sql: `CREATE TABLE Airports ( code VARCHAR(3) PRIMARY KEY, city VARCHAR );\nCREATE TABLE Flights ( id INT PRIMARY KEY, origin VARCHAR(3) REFERENCES Airports(code), destination VARCHAR(3) REFERENCES Airports(code) );\nCREATE TABLE Passengers ( id UUID PRIMARY KEY, name VARCHAR, passport VARCHAR );\nCREATE TABLE Bookings ( id UUID PRIMARY KEY, flight_id INT REFERENCES Flights(id), passenger_id UUID REFERENCES Passengers(id), seat VARCHAR );` },
    { title: "Music Streaming App", sql: `CREATE TABLE Artists ( id INT PRIMARY KEY, name VARCHAR );\nCREATE TABLE Albums ( id INT PRIMARY KEY, artist_id INT REFERENCES Artists(id), title VARCHAR, release_year INT );\nCREATE TABLE Songs ( id UUID PRIMARY KEY, album_id INT REFERENCES Albums(id), title VARCHAR, duration INT );\nCREATE TABLE Playlists ( id UUID PRIMARY KEY, name VARCHAR );\nCREATE TABLE Playlist_Tracks ( playlist_id UUID REFERENCES Playlists(id), song_id UUID REFERENCES Songs(id), PRIMARY KEY(playlist_id, song_id) );` },
    { title: "Real Estate Platform", sql: `CREATE TABLE Agencies ( id INT PRIMARY KEY, name VARCHAR );\nCREATE TABLE Agents ( id INT PRIMARY KEY, agency_id INT REFERENCES Agencies(id), name VARCHAR );\nCREATE TABLE Properties ( id UUID PRIMARY KEY, agent_id INT REFERENCES Agents(id), address VARCHAR, price DECIMAL, status VARCHAR );\nCREATE TABLE Clients ( id UUID PRIMARY KEY, name VARCHAR, budget DECIMAL );\nCREATE TABLE Showings ( id INT PRIMARY KEY, property_id UUID REFERENCES Properties(id), client_id UUID REFERENCES Clients(id), date TIMESTAMP );` },
    { title: "Restaurant POS System", sql: `CREATE TABLE Tables ( id INT PRIMARY KEY, capacity INT );\nCREATE TABLE WaitStaff ( id INT PRIMARY KEY, name VARCHAR );\nCREATE TABLE MenuItems ( id INT PRIMARY KEY, name VARCHAR, price DECIMAL );\nCREATE TABLE Orders ( id UUID PRIMARY KEY, table_id INT REFERENCES Tables(id), waiter_id INT REFERENCES WaitStaff(id), total DECIMAL );\nCREATE TABLE OrderItems ( id SERIAL PRIMARY KEY, order_id UUID REFERENCES Orders(id), item_id INT REFERENCES MenuItems(id), quantity INT );` }
  ];

  useEffect(() => {
    if (!token) navigate('/');
  }, [token, navigate]);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Add dependency on notationMode
  const processSQL = useCallback((sqlToParse = sql, mode = notationMode) => {
    try {
      setError(null);
      const { nodes: newNodes, edges: newEdges } = parseSQL(sqlToParse, mode);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      console.error(err);
      setError("Failed to parse SQL. Check your syntax.");
    }
  }, [sql, setNodes, setEdges, notationMode]);

  // Initial load
  useEffect(() => {
    processSQL();
    if (token) fetchBlueprints();
  }, [token, notationMode]);

  // Auto-render when SQL changes (with a small delay so it doesn't crash while typing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      processSQL(sql);
    }, 600); // 600ms delay
    return () => clearTimeout(timeoutId);
  }, [sql, processSQL]);

  const fetchBlueprints = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/blueprints`, {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedBlueprints(data);
      }
    } catch (error) {
      console.error('Error fetching blueprints:', error);
    }
  };

  const saveBlueprint = async () => {
    if (!title.trim() || !sql.trim()) return showToast('Title and SQL required!', 'error');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/blueprints`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ title, sql_content: sql })
      });
      if (response.ok) {
        showToast('Schema saved successfully!');
        fetchBlueprints();
      } else {
        showToast('Server returned an error', 'error');
      }
    } catch (error) {
      showToast('Failed to connect to database.', 'error');
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    showToast('SQL Copied to Clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSQL = () => {
    const blob = new Blob([sql], { type: 'text/sql' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s+/g, '_')}.sql`;
    a.click();
    showToast('SQL File Downloaded!');
  };

  const loadBlueprint = (blueprint) => {
    setTitle(blueprint.title);
    setSql(blueprint.sql_content);
    setIsSidebarOpen(false);
    processSQL(blueprint.sql_content);
  };

  const deleteBlueprint = async (e, id) => {
    e.stopPropagation(); // prevent triggering the loadBlueprint onClick
    if (!window.confirm("Are you sure you want to delete this schema?")) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/blueprints/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        showToast('Schema deleted successfully!');
        setSavedBlueprints(prev => prev.filter(bp => bp._id !== id));
      } else {
        setError('Failed to delete blueprint');
      }
    } catch (err) {
      setError('Network error. Is backend running?');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const exportDiagram = () => {
    const flowElement = document.querySelector('.react-flow__viewport');
    if (!flowElement) return;

    toPng(document.querySelector('.react-flow'), {
      filter: (node) => {
        if (node?.classList?.contains('react-flow__panel') || node?.classList?.contains('react-flow__controls')) {
          return false;
        }
        return true;
      },
      backgroundColor: theme === 'dark' ? '#0b1121' : '#f8fafc',
    }).then((dataUrl) => {
      const a = document.createElement('a');
      a.setAttribute('download', `${title.replace(/\s+/g, '_')}_diagram.png`);
      a.setAttribute('href', dataUrl);
      a.click();
    });
  };

  const generateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await response.json();
      
      if (response.ok) {
        setSql(data.sql);
        setIsAIPanel(false);
        processSQL(data.sql);
      } else {
        setError(data.error || "Generation failed.");
      }
    } catch (err) {
      setError("Failed to connect to AI server. Did you set GEMINI_API_KEY in the backend?");
    }
    setIsGenerating(false);
  };

  const totalTables = nodes.filter(n => n.type === 'tableNode' || n.type === 'chenEntity').length;
  
  // In Academic mode, edges include attribute lines. We only want to count actual relationships (Foreign Keys/Diamonds).
  const totalRelationships = notationMode === 'professional' 
    ? edges.length 
    : nodes.filter(n => n.type === 'chenRelationship').length;

  const totalColumns = notationMode === 'professional' 
    ? nodes.reduce((acc, node) => acc + (node.data.columns ? node.data.columns.length : 0), 0)
    : nodes.filter(n => n.type === 'chenAttribute').length;

  return (
    <div style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', backgroundColor: 'var(--bg-dark)' }}>
      <div className="dashboard-container" style={{ minHeight: '100vh', height: 'auto', flex: 'none' }}>
        <header className="dash-header">
        <div className="header-left">
          <Database className="logo-icon" />
          <h1>ER Studio</h1>
          <input 
            type="text" 
            className="title-input neon-border"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Schema Title..."
          />
        </div>
        
        <div className="header-actions">
          {/* Notation Toggle */}
          <button 
            className="cyber-btn ghost" 
            onClick={() => setNotationMode(prev => prev === 'professional' ? 'academic' : 'professional')}
            style={{ border: '1px solid var(--border)' }}
          >
            {notationMode === 'professional' ? 'View: Professional' : 'View: Academic'}
          </button>

          <button className="cyber-btn ghost theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <span className="user-greeting">Hi, {username}</span>
          
          <button className="cyber-btn ghost" onClick={() => setShowTemplates(true)}>
            <LayoutGrid size={16} /> Templates
          </button>
          
          <button className="cyber-btn ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FolderOpen size={16} /> Load
          </button>
          <button className="cyber-btn save" onClick={saveBlueprint}>
            <Save size={16} /> Save
          </button>
          <button className="cyber-btn share" onClick={exportDiagram}>
            <Share2 size={16} /> Export
          </button>
          <button className="cyber-btn run" onClick={() => processSQL(sql)}>
            <Play size={14} /> Render
          </button>
          <button className="cyber-btn logout" onClick={handleLogout}>
            <LogOut size={14} />
          </button>
        </div>
      </header>
      
      <div className="main-content">
        {isSidebarOpen && (
          <div className="sidebar cyber-panel">
            <h3>Your Schemas</h3>
            {savedBlueprints.length === 0 ? (
              <p className="no-data">No schemas found.</p>
            ) : (
              <ul>
                {savedBlueprints.map((bp) => (
                  <li key={bp._id} onClick={() => loadBlueprint(bp)} className="cyber-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong>{bp.title}</strong>
                      <span>{new Date(bp.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button 
                      onClick={(e) => deleteBlueprint(e, bp._id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--magenta)', cursor: 'pointer', padding: '4px' }}
                      title="Delete Schema"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="editor-panel cyber-panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{isAIPanel ? 'AI Generation' : 'Raw SQL Definition'}</h3>
            <button 
              className="ai-toggle-btn" 
              onClick={() => setIsAIPanel(!isAIPanel)}
              style={{ background: isAIPanel ? 'transparent' : 'var(--magenta)', color: isAIPanel ? 'var(--text-muted)' : '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}
            >
              {isAIPanel ? 'Back to Code' : <><Sparkles size={12}/> Use AI Magic</>}
            </button>
          </div>
          
          {isAIPanel ? (
            <div className="ai-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Describe your application, and our AI will instantly write the optimal database schema for it.
              </p>
              <textarea
                className="sql-editor ai-input"
                style={{ height: '150px', flex: 'none', border: '1px solid var(--border)', borderRadius: '8px' }}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., A food delivery app with users, restaurants, menu items, and orders..."
              />
              <button 
                className="cyber-btn ai-generate-btn" 
                onClick={generateAI} 
                disabled={isGenerating}
                style={{ background: 'linear-gradient(90deg, #3b82f6, #9333ea)', color: 'white', padding: '1rem', border: 'none', width: '100%', justifyContent: 'center', fontSize: '1rem' }}
              >
                <Wand2 size={18} /> {isGenerating ? 'Generating Schema...' : 'Generate Database Diagram'}
              </button>
            </div>
          ) : (
            <>
              <textarea
                className="sql-editor"
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                spellCheck="false"
                placeholder="CREATE TABLE..."
              />
              <div className="editor-footer">
                <button className="editor-tool-btn" onClick={copySQL} title="Copy SQL">
                  {copied ? <Check size={14} color="#10b981"/> : <Copy size={14} />}
                </button>
                <button className="editor-tool-btn" onClick={downloadSQL} title="Download .sql">
                  <Download size={14} />
                </button>
              </div>
            </>
          )}

          {error && <div className="error-message" style={{ padding: '1rem', background: '#fef2f2', color: '#dc2626' }}>{error}</div>}
        </div>

        <div className="diagram-panel-wrapper">
          <div className="schema-analytics">
            <div className="stat-card">
              <span className="stat-label">Total Tables</span>
              <div className="stat-value cyan-text">{totalTables}</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Columns</span>
              <div className="stat-value magenta-text">{totalColumns}</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Relationships</span>
              <div className="stat-value yellow-text">{totalRelationships}</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Schema Health</span>
              <div className="stat-value green-text">{error ? 'Errors' : 'Optimal'}</div>
            </div>
          </div>

          <div className="diagram-panel">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Controls />
              <Background color="var(--border)" gap={20} size={1} />
              <MiniMap 
                nodeStrokeColor={(n) => theme === 'dark' ? '#334155' : '#e2e8f0'}
                nodeColor={(n) => theme === 'dark' ? '#0f172a' : '#f1f5f9'}
                maskColor={theme === 'dark' ? 'rgba(11, 17, 33, 0.7)' : 'rgba(248, 250, 252, 0.7)'}
                style={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-bg)' }}
              />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Polish UI Toast */}
      {toast && (
        <div className={`cyber-toast ${toast.type}`}>
          {toast.type === 'success' ? <Check size={16} /> : null}
          {toast.msg}
        </div>
      )}

      {/* Templates Modal Overlay */}
      {showTemplates && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Schema Templates</h2>
              <button className="close-btn" onClick={() => setShowTemplates(false)}><X size={20}/></button>
            </div>
            <p className="modal-subtitle">Kickstart your architecture by loading a pre-built industry standard schema.</p>
            <div className="templates-grid">
              {templates.map((tpl, i) => (
                <div key={i} className="template-card" onClick={() => {
                  setSql(tpl.sql);
                  setTitle(tpl.title);
                  processSQL(tpl.sql);
                  setShowTemplates(false);
                }}>
                  <h3>{tpl.title}</h3>
                  <div className="template-preview">
                    {tpl.sql.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Scroll Down Indicator */}
      <div style={{
        width: '100%',
        padding: '1rem',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))',
        color: 'var(--text-muted)',
        fontSize: '12px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        borderTop: '1px solid var(--border)',
        zIndex: 10
      }}>
        ▼ Scroll Down for Visual Diagram-to-Code Builder ▼
      </div>

      {/* SECTION 2: Visual Diagram-to-Code Builder */}
      <VisualBuilder sql={sql} setSql={setSql} />
    </div>
  );
}

function Dashboard() {
  return (
    <ReactFlowProvider>
      <FlowDashboard />
    </ReactFlowProvider>
  );
}

export default Dashboard;
