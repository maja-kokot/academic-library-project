// In frontend/src/components/ResourceDetail.js

import React from 'react';
import NoteEditor from './NoteEditor';

function ResourceDetail({ resource, areaId, onNoteAdded }) {
  // If no resource is selected (e.g., on initial load), show a message
  if (!resource) {
    return <div>Select a resource to view its details.</div>;
  }

  return (
    <div className="resource-detail">
      <h3>{resource.title}</h3>
      <p><strong>Type:</strong> {resource.resource_type}</p>
      {resource.authors && <p><strong>Authors:</strong> {resource.authors}</p>}
      {resource.publication_year && <p><strong>Year:</strong> {resource.publication_year}</p>}
      {resource.url && <p><strong>URL:</strong> <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a></p>}

      <NoteEditor 
        resource={resource} 
        areaId={areaId}
        onNoteAdded={onNoteAdded} 
      />
    </div>
  );
}

export default ResourceDetail;