import React from 'react';
import { Handle, Position } from '@xyflow/react';

function ChenAttributeNode({ data }) {
  return (
    <div style={{
      background: 'var(--panel-bg)',
      border: '1.5px solid var(--text-muted)',
      borderRadius: '50%',
      padding: '10px 20px',
      color: 'var(--text-main)',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '90px',
      textDecoration: data.isPrimary ? 'underline' : 'none',
      fontWeight: data.isPrimary ? 'bold' : 'normal'
    }}>
      <Handle type="target" position={Position.Top} id="t" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="l" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="r" style={{ opacity: 0 }} />
      
      {data.label}
    </div>
  );
}

export default ChenAttributeNode;
