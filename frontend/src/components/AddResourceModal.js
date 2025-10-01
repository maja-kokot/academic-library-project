// In frontend/src/components/AddResourceModal.js

import React, { useState } from 'react';
import axios from 'axios';

function AddResourceModal({ areaId, onClose, onResourceAdded }) {
  // State for each field in the form
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState('LINK');
  const [authors, setAuthors] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission which reloads the page
    if (!title) {
      setError('Title is required.');
      return;
    }

    const payload = {
      title,
      resource_type: resourceType,
      authors,
      url,
      area: areaId, // Link the new resource to the current academic area
    };

    axios.post('http://127.0.0.1:8000/api/resources/', payload)
      .then(response => {
        onResourceAdded(response.data); // Pass the new resource back to the parent
        onClose(); // Close the modal
      })
      .catch(err => {
        console.error("Failed to add resource:", err);
        setError("Failed to save resource. Please try again.");
      });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Add New Resource</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
              <option value="LINK">Link</option>
              <option value="BOOK">Book</option>
              <option value="PAPER">Paper</option>
              <option value="PDF">PDF</option>
              <option value="NOTE">Note</option>
            </select>
          </div>
          <div className="form-group">
            <label>Authors</label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g., Smith, J., Doe, A."
            />
          </div>
          <div className="form-group">
            <label>URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="form-actions">
            <button type="submit">Add Resource</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddResourceModal;