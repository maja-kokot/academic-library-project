// In frontend/src/components/CustomNode.js

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

// We wrap the component in memo for a performance boost.
// It prevents re-rendering if the node's data hasn't changed.
const CustomNode = memo(({ data }) => {
  return (
    <div className="custom-node">
      {/* These Handle components are the connection points for edges */}
      <Handle type="target" position={Position.Top} />
      
      <div className="custom-node-label">{data.label}</div>
      
      {/* This is our delete button. It calls the onDelete function
          that we passed into the node's data payload in WorkspaceView.js */}
      <button className="custom-node-btn" onClick={() => data.onDelete(data.canvasItemId)}>
        ×
      </button>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export default CustomNode;