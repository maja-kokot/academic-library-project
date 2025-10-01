// In frontend/src/components/TabView.js

import React, { useState, useEffect } from 'react';
import ResourceDetail from './ResourceDetail';

// It receives props: 'nodes' (from the canvas) and the full 'area' object
function TabView({ nodes, area, onNoteAdded }) {
  // State to track the ID of the currently active resource tab
  const [activeTabId, setActiveTabId] = useState(null);

  // When the component loads or the nodes change, set the first node as the active tab
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      setActiveTabId(nodes[0].id); // nodes[0].id is the resource ID
    } else {
      setActiveTabId(null); // No nodes on canvas, so no active tab
    }
  }, [nodes]);

  // Find the full resource object for the active tab
  const activeResource = area.resources.find(res => res.id === parseInt(activeTabId));

  // Create a filtered list of resources that are actually on the canvas (in nodes)
  const resourcesOnCanvas = area.resources.filter(resource => 
    nodes.some(node => parseInt(node.id) === resource.id)
  );

  return (
    <div className="tab-view-container">
      <div className="tab-bar">
        {resourcesOnCanvas.map(resource => (
          <button
            key={resource.id}
            className={`tab ${resource.id === parseInt(activeTabId) ? 'active' : ''}`}
            onClick={() => setActiveTabId(String(resource.id))}
          >
            {resource.title}
          </button>
        ))}
      </div>
      <div className="tab-content">
        <ResourceDetail 
          resource={activeResource} 
          areaId={area.id} // Pass the area ID
          onNoteAdded={onNoteAdded} // Pass the function down
        />
      </div>
    </div>
  );
}

export default TabView;