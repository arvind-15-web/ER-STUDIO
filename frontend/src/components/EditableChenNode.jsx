import React from 'react';
import EditableTableNode from './EditableTableNode';

// For simplicity in the visual builder, we edit everything as a standard table 
// (which updates the SQL, which perfectly updates both views!).
export default function EditableChenNode(props) {
  return <EditableTableNode {...props} />;
}
