import React, { useState, useEffect } from 'react';
import { ReactFlow, Background, Controls, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { Plus, ImagePlus, Loader2, Copy, Check, Download, FolderOpen, Save, Trash2 } from 'lucide-react';
import { parseSQL } from '../utils/sqlParser';
import { generateSQL } from '../utils/sqlGenerator';
import EditableTableNode from './EditableTableNode';
import EditableChenNode from './EditableChenNode';

const nodeTypes = {
  tableNode: EditableTableNode,
  chenEntity: EditableChenNode
};

function VisualBuilderContent() {
  const [sql, setSql] = useState(`-- Visual Builder Sandbox
-- This area is completely independent from the top page!
-- Click "Add New Table", or upload an ER Diagram image to generate code.

CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100)
);`);
  const [title, setTitle] = useState('Untitled Visual Schema');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [parsedData, setParsedData] = useState({ tables: [], fks: [] });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedBlueprints, setSavedBlueprints] = useState([]);
  
  const { fitView } = useReactFlow();

  const token = localStorage.getItem('token');

  const fetchBlueprints = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/blueprints`, {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedBlueprints(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchBlueprints();
  }, [token]);

  const saveBlueprint = async () => {
    try {
      const newTitle = prompt("Enter a name for this Visual Schema:", title);
      if (!newTitle) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/blueprints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ title: newTitle, sql_content: sql })
      });
      if (response.ok) {
        alert('Schema saved successfully!');
        setTitle(newTitle);
        fetchBlueprints();
      }
    } catch (err) {
      alert('Failed to save schema.');
    }
  };

  const loadBlueprint = (blueprint) => {
    setTitle(blueprint.title);
    setSql(blueprint.sql_content);
    setIsSidebarOpen(false);
  };

  const deleteBlueprint = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this schema?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/blueprints/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        setSavedBlueprints(prev => prev.filter(bp => bp._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTableName = (oldName, newName, tables, fks) => {
    if (!newName || newName.trim() === '') return;
    const updatedTables = tables.map(t => {
      if (t.name === oldName) return { ...t, name: newName };
      return t;
    });
    const updatedFks = fks.map(fk => {
      let newFk = { ...fk };
      if (fk.table === oldName) newFk.table = newName;
      if (fk.foreignTable === oldName) newFk.foreignTable = newName;
      return newFk;
    });
    setSql(generateSQL(updatedTables, updatedFks));
  };

  const updateColumn = (tableName, oldColName, newColName, newType, tables, fks) => {
    if (!newColName || newColName.trim() === '') return;
    const updatedTables = tables.map(t => {
      if (t.name === tableName) {
        return {
          ...t,
          columns: t.columns.map(c => c.name === oldColName ? { ...c, name: newColName, type: newType || c.type } : c)
        };
      }
      return t;
    });
    const updatedFks = fks.map(fk => {
      let newFk = { ...fk };
      if (fk.table === tableName && fk.column === oldColName) newFk.column = newColName;
      return newFk;
    });
    setSql(generateSQL(updatedTables, updatedFks));
  };

  useEffect(() => {
    try {
        const { nodes: newNodes, edges: newEdges, parsedTables, parsedForeignKeys } = parseSQL(sql, 'professional');
        
        const editableNodes = newNodes.map(n => ({
        ...n,
        data: {
            ...n.data,
            onAddColumn: () => addColumn(n.data.name, parsedTables, parsedForeignKeys),
            onDeleteColumn: (colName) => deleteColumn(n.data.name, colName, parsedTables, parsedForeignKeys),
            onDeleteTable: () => deleteTable(n.data.name, parsedTables, parsedForeignKeys),
            onUpdateTableName: (oldName, newName) => updateTableName(oldName, newName, parsedTables, parsedForeignKeys),
            onUpdateColumn: (oldColName, newColName, newType) => updateColumn(n.data.name, oldColName, newColName, newType, parsedTables, parsedForeignKeys)
        }
        }));

        setNodes(editableNodes);
        setEdges(newEdges);
        setParsedData({ tables: parsedTables, fks: parsedForeignKeys });
    } catch(err) {
        console.error(err);
    }
  }, [sql]);

  const deleteTable = (tableName, tables, fks) => {
    const updatedTables = tables.filter(t => t.name !== tableName);
    const updatedFks = fks.filter(fk => fk.table !== tableName && fk.foreignTable !== tableName);
    const newSql = generateSQL(updatedTables, updatedFks);
    setSql(newSql);
  };

  const addColumn = (tableName, tables, fks) => {
    const updatedTables = tables.map(t => {
      if (t.name === tableName) {
        return {
          ...t,
          columns: [...t.columns, { name: 'new_column', type: 'VARCHAR' }]
        };
      }
      return t;
    });
    const newSql = generateSQL(updatedTables, fks);
    setSql(newSql);
  };

  const deleteColumn = (tableName, colName, tables, fks) => {
    const updatedTables = tables.map(t => {
      if (t.name === tableName) {
        return {
          ...t,
          columns: t.columns.filter(c => c.name !== colName)
        };
      }
      return t;
    });
    const updatedFks = fks.filter(fk => !(fk.table === tableName && fk.column === colName));
    const newSql = generateSQL(updatedTables, updatedFks);
    setSql(newSql);
  };

  const addNewTable = () => {
    const newTableName = `NewTable_${Math.floor(Math.random() * 1000)}`;
    const newTable = {
      name: newTableName,
      columns: [{ name: 'id', type: 'INT', isPrimary: true }]
    };
    
    const safeTables = parsedData.tables || [];
    const safeFks = parsedData.fks || [];
    
    const newSql = generateSQL([...safeTables, newTable], safeFks);
    setSql(newSql);
    
    setTimeout(() => {
        fitView({ duration: 800, padding: 0.2 });
    }, 100);
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = React.useRef(null);

  const copySQL = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSQL = () => {
    const blob = new Blob([sql], { type: 'text/sql' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `schema_${Math.floor(Math.random() * 1000)}.sql`;
    a.click();
  };

  const handleImageFile = async (file) => {
    if (!file) return;
    setIsGenerating(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/generate`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token 
          },
          body: JSON.stringify({ imageBase64: base64String })
        });
        
        const data = await response.json();
        if (response.ok) {
          setSql(data.sql);
          setTimeout(() => fitView({ duration: 800 }), 200);
        } else {
          alert(data.error || "Generation failed");
        }
      } catch (err) {
        alert("Failed to connect to AI server.");
      }
      setIsGenerating(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    handleImageFile(e.target.files[0]);
  };

  const [contextMenu, setContextMenu] = useState(null);

  const handleCustomPaste = async () => {
    setContextMenu(null);
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
        for (const imageType of imageTypes) {
          const blob = await clipboardItem.getType(imageType);
          handleImageFile(blob);
          return;
        }
      }
      alert("No image found in clipboard!");
    } catch (err) {
      console.error(err);
      alert("Clipboard access denied. Please allow clipboard permissions in your browser.");
    }
  };

  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const items = (e.clipboardData || window.event?.clipboardData)?.items;
      if (!items) return;
      for (let item of items) {
        if (item.type.indexOf("image") === 0) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleImageFile(file);
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', borderTop: '2px solid var(--border)' }}>
      <header className="dash-header" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-dark)' }}>
        <div className="header-left">
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            Visual Builder <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 'normal' }}>- {title}</span>
          </h2>
        </div>
        <div className="header-actions">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImageUpload}
          />
          
          <button className="cyber-btn ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FolderOpen size={16} /> Load
          </button>
          
          <button className="cyber-btn save" onClick={saveBlueprint}>
            <Save size={16} /> Save
          </button>

          <button 
            className="cyber-btn" 
            onClick={() => fileInputRef.current.click()}
            disabled={isGenerating}
            style={{ 
              background: 'transparent', 
              color: 'var(--cyan)', 
              border: '1px solid var(--cyan)',
              padding: '8px 16px',
              fontWeight: 'bold',
              marginRight: '10px',
              marginLeft: '10px'
            }}
          >
            {isGenerating ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />} 
            {isGenerating ? ' Scanning Image...' : ' Upload / Paste Image'}
          </button>

          <button 
            className="cyber-btn" 
            onClick={addNewTable}
            style={{ 
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', 
              color: 'white', 
              border: 'none',
              padding: '8px 16px',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
            }}
          >
            <Plus size={16} /> Add New Table
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        
        {isSidebarOpen && (
          <div className="sidebar cyber-panel" style={{ width: '300px', borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
            <h3>Saved Blueprints</h3>
            {savedBlueprints.length === 0 ? (
              <p className="no-data">No schemas saved yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {savedBlueprints.map((bp) => (
                  <li key={bp._id} onClick={() => loadBlueprint(bp)} className="cyber-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', margin: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong>{bp.title}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(bp.createdAt).toLocaleDateString()}</span>
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

        <div 
          style={{ flex: 1, position: 'relative' }} 
          onClick={() => setContextMenu(null)}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            onPaneContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY });
            }}
          >
            <Background color="var(--border)" gap={20} />
            <Controls />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'rgba(255, 255, 255, 0.1)',
              fontSize: '24px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              textAlign: 'center',
              zIndex: 0
            }}>
              Right-Click or Ctrl+V to Paste Image
            </div>
            
            {contextMenu && (
              <div style={{
                position: 'fixed',
                top: contextMenu.y,
                left: contextMenu.x,
                background: 'var(--panel-bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '4px',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                minWidth: '150px'
              }}>
                <button
                  onClick={handleCustomPaste}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ImagePlus size={16} /> Paste Image Here
                </button>
              </div>
            )}
          </ReactFlow>
        </div>
        
        {/* Live Generated SQL Panel */}
        <div style={{ 
          width: '400px', 
          background: 'var(--panel-bg)', 
          borderLeft: '1px solid var(--border)', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <div style={{ 
            padding: '12px 20px', 
            borderBottom: '1px solid var(--border)', 
            fontWeight: 'bold', 
            color: 'var(--text-main)',
            background: 'var(--bg-dark)',
            fontSize: '14px'
          }}>
            Live Generated SQL
          </div>
          <textarea
            className="sql-editor"
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            spellCheck="false"
            style={{ 
              flex: 1, 
              background: 'transparent', 
              border: 'none', 
              padding: '20px', 
              color: 'var(--cyan)', 
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              resize: 'none',
              outline: 'none'
            }}
          />
          <div className="editor-footer">
            <button className="editor-tool-btn" onClick={copySQL} title="Copy SQL">
              {copied ? <Check size={14} color="#10b981"/> : <Copy size={14} />}
            </button>
            <button className="editor-tool-btn" onClick={downloadSQL} title="Download .sql">
              <Download size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VisualBuilder(props) {
  return (
    <ReactFlowProvider>
      <VisualBuilderContent {...props} />
    </ReactFlowProvider>
  );
}
