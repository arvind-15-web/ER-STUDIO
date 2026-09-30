import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key, Type, Hash } from 'lucide-react';

function TableNode({ data }) {
  const isMagenta = data.name.length % 2 === 0;
  const accentColor = isMagenta ? 'var(--magenta)' : 'var(--cyan)';

  return (
    <div className="table-node" style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      minWidth: '220px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      color: 'var(--text-main)',
      overflow: 'hidden'
    }}>
      {/* Node Header */}
      <div style={{
        background: 'var(--panel-bg)',
        padding: '12px 16px',
        borderBottom: `2px solid ${accentColor}`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ 
          fontWeight: '700', 
          fontSize: '14px',
          letterSpacing: '-0.01em',
          color: 'var(--text-main)'
        }}>
          {data.name}
        </span>
      </div>
      
      {/* Columns */}
      <div style={{ padding: '4px 0' }}>
        {data.columns && data.columns.map((col, index) => {
          const isLast = index === data.columns.length - 1;
          const isNum = col.type.includes('INT') || col.type.includes('SERIAL');
          
          return (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              borderBottom: isLast ? 'none' : '1px solid var(--border)',
              position: 'relative'
            }}>
              {col.isPrimary && (
                <Handle 
                  type="target" 
                  position={Position.Left} 
                  id={col.name} 
                  style={{ background: accentColor, width: '8px', height: '12px', borderRadius: '4px', border: 'none', left: '-4px' }}
                />
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {col.isPrimary ? (
                  <Key size={14} color="var(--yellow)" />
                ) : (
                  isNum ? <Hash size={14} color="var(--text-muted)" /> : <Type size={14} color="var(--text-muted)" />
                )}
                <span style={{ 
                  fontWeight: col.isPrimary ? '600' : '400',
                  fontSize: '13px',
                  color: col.isPrimary ? accentColor : 'var(--text-main)'
                }}>
                  {col.name}
                </span>
              </div>
              
              <span style={{ 
                color: 'var(--text-muted)', 
                fontSize: '11px',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {col.type}
              </span>

              <Handle 
                type="source" 
                position={Position.Right} 
                id={col.name} 
                style={{ background: 'var(--border)', width: '6px', height: '6px', border: 'none', right: '-3px' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TableNode;
