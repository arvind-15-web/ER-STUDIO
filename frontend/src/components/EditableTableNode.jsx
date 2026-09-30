import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key, Type, Hash, Plus, Trash2 } from 'lucide-react';

function EditableTableNode({ data }) {
  const isMagenta = data.name.length % 2 === 0;
  const accentColor = isMagenta ? 'var(--magenta)' : 'var(--cyan)';

  return (
    <div className="table-node" style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      minWidth: '240px',
      boxShadow: '0 4px 12px -1px rgba(0, 0, 0, 0.4)',
      color: 'var(--text-main)',
      overflow: 'hidden'
    }}>
      {/* Node Header */}
      <div style={{
        background: 'var(--panel-bg)',
        padding: '12px 16px',
        borderBottom: `2px solid ${accentColor}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ 
          fontWeight: '700', 
          fontSize: '14px',
          color: 'var(--text-main)'
        }}>
          {data.name}
        </span>
        <Trash2 
          size={16} 
          color="var(--red, #ef4444)" 
          style={{ cursor: 'pointer', opacity: 0.6 }} 
          onClick={data.onDeleteTable}
          title="Delete Table"
        />
      </div>
      
      {/* Columns */}
      <div style={{ padding: '4px 0' }}>
        {data.columns && data.columns.map((col, index) => {
          const isNum = col.type.includes('INT') || col.type.includes('SERIAL');
          
          return (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              borderBottom: '1px solid var(--border)',
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
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '11px',
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  {col.type}
                </span>
                <Trash2 
                  size={14} 
                  color="var(--red, #ef4444)" 
                  style={{ cursor: 'pointer', opacity: 0.7 }} 
                  onClick={() => data.onDeleteColumn(col.name)}
                />
              </div>

              <Handle 
                type="source" 
                position={Position.Right} 
                id={col.name} 
                style={{ background: 'var(--border)', width: '6px', height: '6px', border: 'none', right: '-3px' }}
              />
            </div>
          );
        })}
        
        {/* Add Column Button */}
        <div 
          onClick={data.onAddColumn}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '13px',
            background: 'rgba(255, 255, 255, 0.02)',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
        >
          <Plus size={14} /> Add Column
        </div>
      </div>
    </div>
  );
}

export default EditableTableNode;
