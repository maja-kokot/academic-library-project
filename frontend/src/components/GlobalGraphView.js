import React from 'react';
import { Link } from 'react-router-dom';

function GlobalGraphView() {
  return (
    <div>
      <h1>Global Connections Graph</h1>
      <p>(This is where the graph of all areas will go)</p>
      <br />
      <Link to="/">Back to Library</Link>
    </div>
  );
}

export default GlobalGraphView;