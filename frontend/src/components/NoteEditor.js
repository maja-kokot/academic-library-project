// In frontend/src/components/NoteEditor.js

import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

function NoteEditor({ resource, areaId, onNoteAdded }) {
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleAddNote = () => {
    // Prepare the data to be sent to the API
    const payload = {
      content: newNoteContent,
      area: areaId,
      resource: resource.id, // Link this note to the specific resource
    };

    // Send a POST request to our 'notes' API endpoint
    axios.post('http://127.0.0.1:8000/api/notes/', payload)
      .then(response => {
        // Call the function passed down from the parent to update the UI
        onNoteAdded(response.data);
        // Reset the editor
        setNewNoteContent("");
        setIsEditing(false);
      })
      .catch(err => {
        console.error("Failed to add note:", err);
        alert("Error: Could not save the note.");
      });
  };

  return (
    <div className="resource-notes">
      <h4>Notes for this Resource:</h4>
      
      {/* Display existing notes using ReactMarkdown */}
      {resource.notes && resource.notes.length > 0 ? (
        <div className="notes-list">
          {resource.notes.map(note => (
            <div key={note.id} className="note-item">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          ))}
        </div>
      ) : (
        <p>No notes for this resource yet.</p>
      )}

      {/* The "Add Note" button and the editor */}
      <div className="add-note-section">
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)}>+ Add Note</button>
        ) : (
          <div>
            <SimpleMDE value={newNoteContent} onChange={setNewNoteContent} />
            <button onClick={handleAddNote}>Save Note</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteEditor;