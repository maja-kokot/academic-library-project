// In frontend/src/components/WorkspaceView.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Import React Flow and its components
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
// Import the CSS for React Flow
import 'reactflow/dist/style.css';

function WorkspaceView() {
  const { areaSlug } = useParams();
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for React Flow nodes and edges
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/areas/${areaSlug}/`);
        const data = response.data;
        setArea(data);

        // --- Data Transformation ---
        // Convert our 'CanvasItem' data into React Flow 'nodes'
        const initialNodes = data.canvas_items.map(item => ({
          id: String(item.resource.id), // Node ID must be a string
          position: { x: item.pos_x, y: item.pos_y },
          data: { label: item.resource.title }, // The label that appears on the node
        }));
        setNodes(initialNodes);

        // Convert our 'ResourceConnection' data into React Flow 'edges'
        const initialEdges = data.connections.map(conn => ({
          id: `e-${conn.source}-${conn.target}`, // Edge ID
          source: String(conn.source), // ID of the source node
          target: String(conn.target), // ID of the target node
          label: conn.label, // The label that appears on the edge
        }));
        setEdges(initialEdges);
        
      } catch (err) {
        setError('Failed to fetch workspace data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaceData();
  }, [areaSlug]);

  if (loading) return <p>Loading workspace...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!area) return <p>Area not found.</p>;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* We need a container with a defined height for React Flow to work */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {/* We can add a simple overlay for the title and navigation */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 4, background: 'white', padding: '10px', border: '1px solid black' }}>
        <h1>{area.name}</h1>
        <Link to="/">Back to Library</Link>
      </div>
    </div>
  );
}

export default WorkspaceView;