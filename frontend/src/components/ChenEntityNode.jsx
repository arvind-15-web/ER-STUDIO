import React from 'react';
import { Handle, Position } from '@xyflow/react';

function ChenEntityNode({ data }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '2px solid var(--text-main)',
      padding: '10px 30px',
      color: 'var(--text-main)',
      fontWeight: 'bold',
      fontSize: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '120px'
    }}>
      {/* Handles for flexible edge routing */}
      <Handle type="target" position={Position.Top} id="t-target" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="t-source" style={{ opacity: 0 }} />
      
      <Handle type="target" position={Position.Bottom} id="b-target" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="b-source" style={{ opacity: 0 }} />
      
      <Handle type="target" position={Position.Left} id="l-target" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="l-source" style={{ opacity: 0 }} />
      
      <Handle type="target" position={Position.Right} id="r-target" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="r-source" style={{ opacity: 0 }} />
      
      {data.label}
    </div>
  );
}

export default ChenEntityNode;
