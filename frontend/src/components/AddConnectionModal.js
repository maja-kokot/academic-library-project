// In frontend/src/components/AddConnectionModal.js

import React, { useState } from 'react';

function AddConnectionModal({ onSave, onClose }) {
  const [label, setLabel] = useState('');

  const handleSave = () => {
    // We pass the label up to the parent component to handle the API call.
    onSave(label);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Define Connection</h2>
        <div className="form-group">
          <label>Relationship Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., 'references', 'explains', 'is based on'"
            autoFocus // Automatically focus the input field
          />
        </div>
        <div className="form-actions">
          <button onClick={handleSave}>Save Connection</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default AddConnectionModal;