// In frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LibraryView from './components/LibraryView';
import WorkspaceView from './components/WorkspaceView'; // This will now act as a layout
import GlobalGraphView from './components/GlobalGraphView';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            {/* The homepage route is unchanged */}
            <Route path="/" element={<LibraryView />} />
            
            {/* 
              This is the new parent route for a workspace.
              It will match URLs like '/quantum-mechanics' or '/general-relativity'.
              The '/*' at the end is crucial: it means "match any further nested routes".
            */}
            <Route path="/:areaSlug/*" element={<WorkspaceView />} />

            {/* This route is no longer needed, as it's now nested. */}
            {/* We'll keep the global graph view for now. */}
            <Route path="/graph" element={<GlobalGraphView />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;