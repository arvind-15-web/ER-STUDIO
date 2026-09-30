import React, { useState, useEffect } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { parseSQL } from '../utils/sqlParser';
import { generateSQL } from '../utils/sqlGenerator';
import EditableTableNode from './EditableTableNode';
import EditableChenNode from './EditableChenNode';

const nodeTypes = {
  tableNode: EditableTableNode,
  chenEntity: EditableChenNode
};

function VisualBuilder({ sql, setSql }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [parsedData, setParsedData] = useState({ tables: [], fks: [] });

  useEffect(() => {
    // We re-parse to get the layout and structure for the visual builder
    const { nodes: newNodes, edges: newEdges, parsedTables, parsedForeignKeys } = parseSQL(sql, 'professional');
    
    // Inject our custom callbacks into the node data
    const editableNodes = newNodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        onAddColumn: () => addColumn(n.data.label, parsedTables, parsedForeignKeys),
        onDeleteColumn: (colName) => deleteColumn(n.data.label, colName, parsedTables, parsedForeignKeys),
        onDeleteTable: () => deleteTable(n.data.label, parsedTables, parsedForeignKeys)
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
    // Also remove any FKs associated with this column
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
    const newSql = generateSQL([...parsedData.tables, newTable], parsedData.fks);
    setSql(newSql);
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', borderTop: '2px solid var(--border)' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Visual Builder (Diagram-to-Code)</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Edit nodes directly to magically generate SQL code.</p>
        <button className="cyber-btn primary" onClick={addNewTable}>
          <Plus size={16} style={{ marginRight: '8px' }} /> Add Table
        </button>
      </div>
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
  );
}

export default VisualBuilder;
