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
    // === CLEAN ACADEMIC (CHEN'S) NOTATION (GRID LAYOUT) ===
    
    // We will place Entities in a Grid to support massive schemas without infinite scrolling
    const MAX_COLS = 3; // 3 Entities per row
    
    parsedTables.forEach((table, i) => {
      const col = i % MAX_COLS;
      const row = Math.floor(i / MAX_COLS);
      
      // 1. Position the main Entity (Rectangle)
      // Space them out 700px horizontally, 500px vertically
      const ex = col * 700 + 100;
      const ey = row * 500 + 100;
      
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
      // We limit the width of the attribute row to prevent overlapping with neighbor columns
      let currentSpacing = spacing;
      if (totalCols * spacing > 600) {
          currentSpacing = 600 / totalCols; // squish them if there are too many!
      }
      
      const startAttrX = ex + 60 - ((totalCols - 1) * currentSpacing) / 2;

      table.columns.forEach((c, j) => {
        const ax = startAttrX + (j * currentSpacing);
        const ay = ey + 180; // 180px directly below
        const attrId = `attr-${table.name}-${c.name}`;

        nodes.push({
          id: attrId,
          type: 'chenAttribute',
          position: { x: ax, y: ay },
          data: { label: c.name, isPrimary: c.isPrimary }
        });

        // Edge from Entity (Bottom) to Attribute (Top)
        edges.push({
          id: `e-${table.name}-${c.name}`,
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
        // Place Diamond exactly between the two Entities in both X and Y
        const dx = (sourceNode.position.x + targetNode.position.x) / 2;
        const dy = (sourceNode.position.y + targetNode.position.y) / 2;
        
        const relId = `rel-${fk.table}-${fk.foreignTable}-${i}`;
        
        nodes.push({
          id: relId,
          type: 'chenRelationship',
          position: { x: dx, y: dy - 20 }, // slight vertical offset to align diamond center
          data: { label: `Links to` }
        });

        // Smart Edge Routing
        // We figure out the physical relationship between source and target to choose handles
        const isLeftToRight = sourceNode.position.x < targetNode.position.x;
        const isTopToBottom = sourceNode.position.y < targetNode.position.y;
        
        // Default to Left/Right if they are on the same row, else Top/Bottom
        const sameRow = Math.abs(sourceNode.position.y - targetNode.position.y) < 100;
        
        let sourceToDiamondHandle = 'r-source';
        let diamondToTargetHandle = 'r-source';
        let diamondTargetH = 'l-target';
        let entityTargetH = 'l-target';

        if (sameRow) {
            sourceToDiamondHandle = isLeftToRight ? 'r-source' : 'l-source';
            diamondTargetH = isLeftToRight ? 'l-target' : 'r-target';
            diamondToTargetHandle = isLeftToRight ? 'r-source' : 'l-source';
            entityTargetH = isLeftToRight ? 'l-target' : 'r-target';
        } else {
            sourceToDiamondHandle = isTopToBottom ? 'b-source' : 't-source';
            diamondTargetH = isTopToBottom ? 't-target' : 'b-target';
            diamondToTargetHandle = isTopToBottom ? 'b-source' : 't-source';
            entityTargetH = isTopToBottom ? 't-target' : 'b-target';
        }

        edges.push({
          id: `e1-${relId}`,
          source: sourceNode.id,
          target: relId,
          sourceHandle: sourceToDiamondHandle,
          targetHandle: diamondTargetH,
          type: 'smoothstep',
          style: { stroke: 'var(--magenta)', strokeWidth: 2 }
        });
        edges.push({
          id: `e2-${relId}`,
          source: relId,
          target: targetNode.id,
          sourceHandle: diamondToTargetHandle,
          targetHandle: entityTargetH,
          type: 'smoothstep',
          style: { stroke: 'var(--cyan)', strokeWidth: 2 }
        });
      }
    });
  }

  return { nodes, edges, parsedTables, parsedForeignKeys };
}
