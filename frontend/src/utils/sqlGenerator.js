export const generateSQL = (tables, fks) => {
  let sql = '';
  tables.forEach(table => {
    sql += `CREATE TABLE ${table.name} (\n`;
    
    const colStrings = table.columns.map(c => {
      let line = `  ${c.name} ${c.type || 'VARCHAR'}`;
      if (c.isPrimary) line += ' PRIMARY KEY';
      
      // Look for a foreign key linked to this specific column
      const fk = fks.find(f => f.table === table.name && f.column === c.name);
      if (fk) {
        line += ` REFERENCES ${fk.foreignTable}(${fk.foreignColumn})`;
      }
      return line;
    });
    
    sql += colStrings.join(',\n');
    sql += `\n);\n\n`;
  });
  return sql.trim();
};
