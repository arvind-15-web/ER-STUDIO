import React, { useState, useEffect } from 'react';
import { ReactFlow, Background, Controls, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { parseSQL } from '../utils/sqlParser';
import { generateSQL } from '../utils/sqlGenerator';
import EditableTableNode from './EditableTableNode';
import EditableChenNode from './EditableChenNode';

const nodeTypes = {
  tableNode: EditableTableNode,
  chenEntity: EditableChenNode
};

function VisualBuilderContent({ sql, setSql }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [parsedData, setParsedData] = useState({ tables: [], fks: [] });
  
  const { fitView } = useReactFlow();

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
    // We re-parse to get the layout and structure for the visual builder
    const { nodes: newNodes, edges: newEdges, parsedTables, parsedForeignKeys } = parseSQL(sql, 'professional');
    
    // Inject our custom callbacks into the node data
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
    
    // Safety check in case it's undefined
    const safeTables = parsedData.tables || [];
    const safeFks = parsedData.fks || [];
    
    const newSql = generateSQL([...safeTables, newTable], safeFks);
    setSql(newSql);
    
    setTimeout(() => {
        fitView({ duration: 800, padding: 0.2 });
    }, 100);
  };

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', borderTop: '2px solid var(--border)' }}>
      <header className="dash-header" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-dark)' }}>
        <div className="header-left">
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            Visual Builder <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 'normal' }}>(Diagram-to-Code)</span>
          </h2>
        </div>
        <div className="header-actions">
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
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="var(--border)" gap={20} />
            <Controls />
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
