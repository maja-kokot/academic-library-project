// In frontend/src/components/Sidebar.js

import React from 'react';
import DraggableResource from './DraggableResource';


// The Sidebar component receives the list of resources as a 'prop'
function Sidebar({ resources,  onAddResourceClick }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Resources</h3>
        {/* This button will trigger the modal */}
        <button className="add-resource-btn" onClick={onAddResourceClick}>+</button>
      </div>
      <ul className="sidebar-resource-list">
        {/* We check if the resources array exists before trying to map it */}
        {resources && resources.map(resource => (
          <DraggableResource key={resource.id} resource={resource} />
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;