export function parseSQL(sqlString, notation = 'professional') {
  const nodes = [];
  const edges = [];
  const parsedTables = [];
  const parsedForeignKeys = [];

  // Normalize newlines and basic spaces
  const text = sqlString.replace(/\r\n/g, '\n');
  
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)(?:;|(?=\s*CREATE\s+TABLE|$))/gi;
  
  let match;
  while ((match = tableRegex.exec(text)) !== null) {
    const tableName = match[1];
    const columnsText = match[2];
    
    let level = 0;
    let safeText = "";
    for (let i = 0; i < columnsText.length; i++) {
      if (columnsText[i] === '(') level++;
      else if (columnsText[i] === ')') level--;
      
      if (columnsText[i] === ',' && level === 0) {
        safeText += '|||';
      } else {
        safeText += columnsText[i];
      }
    }
    
    const rawColumns = safeText.split('|||').map(c => c.trim()).filter(c => c.length > 0);
    const columns = [];
    
    rawColumns.forEach(colString => {
      if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|CONSTRAINT|UNIQUE)\b/i.test(colString)) {
        const fkMatch = colString.match(/FOREIGN\s+KEY\s*\(([a-zA-Z0-9_]+)\)\s*REFERENCES\s+([a-zA-Z0-9_]+)\s*\(([a-zA-Z0-9_]+)\)/i);
        if (fkMatch) {
          parsedForeignKeys.push({
            table: tableName,
            column: fkMatch[1],
            foreignTable: fkMatch[2],
            foreignColumn: fkMatch[3]
          });
        }
        return;
      }
      
      const parts = colString.split(/\s+/);
      const colName = parts[0];
      const colType = parts[1] ? parts[1].toUpperCase() : 'UNKNOWN';
      const isPrimary = /PRIMARY\s+KEY/i.test(colString);
      
      const refMatch = colString.match(/REFERENCES\s+([a-zA-Z0-9_]+)(?:\(([a-zA-Z0-9_]+)\))?/i);
      if (refMatch) {
        parsedForeignKeys.push({
          table: tableName,
          column: colName,
          foreignTable: refMatch[1],
          foreignColumn: refMatch[2] || 'id'
        });
      }
      
      columns.push({ name: colName, type: colType, isPrimary });
    });

    parsedTables.push({ name: tableName, columns });
  }

  if (notation === 'professional') {
    let x = 100;
    let y = 100;
    
    parsedTables.forEach((table) => {
      nodes.push({
        id: table.name,
        type: 'tableNode',
        position: { x, y },
        data: { name: table.name, columns: table.columns }
      });
      x += 350;
      if (x > 1000) { x = 100; y += 300; }
    });

    parsedForeignKeys.forEach((fk, i) => {
      edges.push({
        id: `e-${fk.table}-${fk.column}-${fk.foreignTable}-${fk.foreignColumn}-${i}`,
        source: fk.table,
        target: fk.foreignTable,
        label: 'FOREIGN KEY',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5,5' }, // Using explicit hex for html-to-image
        labelStyle: { fill: '#ffffff', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: '#8b5cf6', stroke: '#8b5cf6', strokeWidth: 1, rx: 4, ry: 4 }, // Purple pill shape
        labelBgPadding: [6, 4],
      });
    });
  } else if (notation === 'academic') {
    // === CLEAN ACADEMIC (CHEN'S) NOTATION ===
    
    // We will place Entities in a horizontal row, with their attributes directly below them.
    parsedTables.forEach((table, i) => {
      // 1. Position the main Entity (Rectangle)
      const ex = i * 600 + 100;
      const ey = 200;
      
      nodes.push({
        id: `entity-${table.name}`,
        type: 'chenEntity',
        position: { x: ex, y: ey },
        data: { label: table.name }
      });

      // 2. Position Attributes (Ovals) in a neat row below the Entity
      const totalCols = table.columns.length;
      const spacing = 150;
      // Calculate starting X so the row of attributes is perfectly centered under the Entity
      const startAttrX = ex + 60 - ((totalCols - 1) * spacing) / 2; // +60 to account for Entity width

      table.columns.forEach((col, j) => {
        const ax = startAttrX + (j * spacing);
        const ay = ey + 180; // 180px directly below
        const attrId = `attr-${table.name}-${col.name}`;

        nodes.push({
          id: attrId,
          type: 'chenAttribute',
          position: { x: ax, y: ay },
          data: { label: col.name, isPrimary: col.isPrimary }
        });

        // Edge from Entity (Bottom) to Attribute (Top)
        edges.push({
          id: `e-${table.name}-${col.name}`,
          source: `entity-${table.name}`,
          target: attrId,
          sourceHandle: 'b-source',
          targetHandle: 't',
          type: 'smoothstep',
          style: { stroke: 'var(--text-muted)', strokeWidth: 1.5 }
        });
      });
    });

    // 3. Relationships (Diamonds) connecting Entities
    parsedForeignKeys.forEach((fk, i) => {
      const sourceNode = nodes.find(n => n.id === `entity-${fk.table}`);
      const targetNode = nodes.find(n => n.id === `entity-${fk.foreignTable}`);
      
      if (sourceNode && targetNode) {
        // Place Diamond exactly between the two Entities horizontally
        // Ensure dx calculation uses the entity centers (offset by ~60px width)
        const dx = (sourceNode.position.x + targetNode.position.x) / 2;
        const dy = sourceNode.position.y; // Keep them on the same Y axis!
        
        const relId = `rel-${fk.table}-${fk.foreignTable}-${i}`;
        
        nodes.push({
          id: relId,
          type: 'chenRelationship',
          position: { x: dx, y: dy - 20 }, // slight vertical offset to align diamond center
          data: { label: `Links to` }
        });

        // Edges from Source -> Diamond -> Target
        const isLeftToRight = sourceNode.position.x < targetNode.position.x;

        edges.push({
          id: `e1-${relId}`,
          source: sourceNode.id,
          target: relId,
          sourceHandle: isLeftToRight ? 'r-source' : 'l-source',
          targetHandle: isLeftToRight ? 'l-target' : 'r-target',
          type: 'smoothstep',
          style: { stroke: 'var(--magenta)', strokeWidth: 2 }
        });
        edges.push({
          id: `e2-${relId}`,
          source: relId,
          target: targetNode.id,
          sourceHandle: isLeftToRight ? 'r-source' : 'l-source',
          targetHandle: isLeftToRight ? 'l-target' : 'r-target',
          type: 'smoothstep',
          style: { stroke: 'var(--cyan)', strokeWidth: 2 }
        });
      }
    });
  }

  return { nodes, edges };
}
