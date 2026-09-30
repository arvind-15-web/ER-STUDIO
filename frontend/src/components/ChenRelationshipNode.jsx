import React from 'react';
import { Handle, Position } from '@xyflow/react';

function ChenRelationshipNode({ data }) {
  // A 60x60 square rotated 45 degrees has a bounding box of exactly ~85x85 pixels.
  // By matching the container size to the rotated math, the lines will perfectly touch the diamond points!
  return (
    <div style={{
      position: 'relative',
      width: '85px',
      height: '85px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Background Square rotated into a Diamond */}
      <div style={{
        position: 'absolute',
        width: '60px',
        height: '60px',
        background: 'var(--bg-dark)',
        border: '2px solid var(--magenta)',
        transform: 'rotate(45deg)',
        zIndex: 0
      }}></div>
      
      <span style={{ 
        position: 'relative', 
        zIndex: 1, 
        color: 'var(--text-main)', 
        fontSize: '11px',
        fontWeight: 'bold',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        {data.label}
      </span>

      {/* Target/Source handles allow any connection */}
      <Handle type="target" position={Position.Top} id="t" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="l-target" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="l-source" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="r-target" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="r-source" style={{ opacity: 0 }} />
    </div>
  );
}

export default ChenRelationshipNode;
