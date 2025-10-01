// In frontend/src/components/WorkspaceView.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Import React Flow and its components
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState, // <-- NEW: The hook that manages node state
  useEdgesState, // <-- NEW: The hook that manages edge state
  useReactFlow, 
  addEdge,
} from 'reactflow';
// Import the CSS for React Flow
import 'reactflow/dist/style.css';

import { useDrop } from 'react-dnd';
import { ItemTypes } from './DraggableResource'; // The type we defined for our draggable items

import Sidebar from './Sidebar';
import TabView from './TabView';
import AddResourceModal from './AddResourceModal';
import CustomNode from './CustomNode';
import AddConnectionModal from './AddConnectionModal';

const nodeTypes = { custom: CustomNode };

// --- Canvas Component ---
// The Canvas component's job is to render React Flow and handle drop events.
const Canvas = ({ nodes, edges, onNodesChange, onEdgesChange, handleNodeDragStop, onResourceDropped, onConnect }) => {
  const { project } = useReactFlow();
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.RESOURCE,
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset) {
        const position = project({ x: clientOffset.x, y: clientOffset.y });
        onResourceDropped(item, position);
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  return (
    <div ref={drop} style={{ height: '100%', width: '100%', backgroundColor: isOver ? '#f0f0f0' : 'transparent' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes} // Tell React Flow to use our custom node
        onConnect={onConnect}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

function WorkspaceView() {
  const { areaSlug } = useParams();
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // It returns the nodes, a setter, and a special onChange handler.
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [viewMode, setViewMode] = useState('canvas');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [newConnectionData, setNewConnectionData] = useState(null);

  // --- HANDLER: Called when React Flow tries to create a connection ---
  const onConnect = useCallback((params) => {
    // Store the connection data (source and target node IDs)
    setNewConnectionData(params);
    // Open the modal
    setIsConnectModalOpen(true);
  }, []);

  // --- HANDLER: Called when the user saves the connection from the modal ---
  const handleSaveConnection = useCallback((label) => {
    if (!newConnectionData || !area) return;

    const payload = {
      area: area.id,
      source: newConnectionData.source,
      target: newConnectionData.target,
      label: label,
    };

    axios.post('http://127.0.0.1:8000/api/connections/', payload)
      .then(response => {
        const newDbConnection = response.data;
        
        // Use the addEdge helper to create the new edge for the UI
        const newEdge = {
          id: `e-${newDbConnection.source}-${newDbConnection.target}`,
          source: String(newDbConnection.source),
          target: String(newDbConnection.target),
          label: newDbConnection.label,
        };

        // Instantly update the UI by adding the new edge
        setEdges((eds) => addEdge(newEdge, eds));
      })
      .catch(err => {
        console.error("Failed to save connection:", err);
        alert("Could not save the connection.");
      })
      .finally(() => {
        // Clean up and close the modal regardless of success or failure
        setIsConnectModalOpen(false);
        setNewConnectionData(null);
      });
  }, [area, newConnectionData, setEdges]);

  // --- HANDLER: For deleting a node from the canvas ---
  const onDeleteNode = useCallback((canvasItemIdToDelete) => {
    if (!window.confirm("Are you sure you want to remove this item from the canvas?")) {
      return;
    }
    axios.delete(`http://127.0.0.1:8000/api/canvas-items/${canvasItemIdToDelete}/`)
      .then(() => {
        setNodes((nds) => nds.filter(node => node.data.canvasItemId !== canvasItemIdToDelete));
      })
      .catch(err => {
        console.error("Failed to delete canvas item:", err);
        alert("Could not remove the item.");
      });
  }, [setNodes]);

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
          data: { 
            label: item.resource.title,
            // We need the ID of the CanvasItem itself to update it.
            canvasItemId: item.id 
          },
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
  },[areaSlug, setNodes, setEdges]);

  // the function that will be called when a node drag stops.
  const handleNodeDragStop = useCallback((event, node) => {
    // Get the required data from the node object.
    const canvasItemId = node.data.canvasItemId;
    const newPosition = node.position;

    // The URL for the specific CanvasItem we want to update.
    const url = `http://127.0.0.1:8000/api/canvas-items/${canvasItemId}/`;

    // The data we want to send. We only need to send the fields we are changing.
    const payload = {
      pos_x: Math.round(newPosition.x),
      pos_y: Math.round(newPosition.y),
    };

    // Send a PATCH request. 'patch' is used for partial updates.
    axios.patch(url, payload)
      .then(response => {
        // You could add a success message here if you wanted.
        console.log('Position updated successfully:', response.data);
      })
      .catch(err => {
        // It's good practice to log errors so you can debug them.
        console.error('Failed to update node position:', err);
        // Here you might want to show an error message to the user.
      });
  }, []); // The empty dependency array means this function is created once.

  const handleNoteAdded = (newNote) => {
    // Create a new, updated version of the area object
    setArea(currentArea => {
      // Find the resource to which the note was added
      const updatedResources = currentArea.resources.map(res => {
        if (res.id === newNote.resource) {
          // Add the new note to this resource's notes array
          return { ...res, notes: [...res.notes, newNote] };
        }
        return res;
      });

      return { 
        ...currentArea, 
        resources: updatedResources, // Use the updated resources list
        notes: [...currentArea.notes, newNote] // Also add to the main notes list
      };
    });
  };

  const handleResourceAdded = (newResource) => {
    // Add the new resource to the main 'area' object to instantly update the UI
    setArea(currentArea => ({
      ...currentArea,
      resources: [...currentArea.resources, newResource]
    }));
  };

  const onResourceDropped = useCallback((droppedItem, position) => {
    // Check if a node for this resource already exists on the canvas
    const nodeExists = nodes.some(node => node.id === String(droppedItem.id));
    if (nodeExists) {
      alert("This resource is already on the canvas.");
      return;
    }

    // 1. Prepare the data for the API call to create a new CanvasItem
    const payload = {
      area: area.id,
      resource: droppedItem.id,
      pos_x: Math.round(position.x),
      pos_y: Math.round(position.y),
    };

    // 2. Make the API call
    axios.post('http://127.0.0.1:8000/api/canvas-items/', payload)
      .then(response => {
        const newCanvasItem = response.data;

        // 3. Create a new node for the React Flow canvas
        const newNode = {
          id: String(newCanvasItem.resource), // In our manual API, the resource ID is just a number
          position: { x: newCanvasItem.pos_x, y: newCanvasItem.pos_y },
          data: {
            label: droppedItem.title, // We get the title from the item we dropped
            canvasItemId: newCanvasItem.id,
            onDelete: onDeleteNode,
          },
          type: 'custom',
        };

        // 4. Update the frontend state to instantly show the new node
        setNodes((nds) => nds.concat(newNode));
      })
      .catch(err => {
        console.error("Failed to create canvas item:", err);
        alert("Could not add the resource to the canvas.");
      });
  }, [area, nodes, setNodes]); // Dependencies for the function


  if (loading) return <p>Loading workspace...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!area) return <p>Area not found.</p>;

  // return (
  //   <div style={{ width: '100vw', height: '100vh' }}>
  //     {/* We need a container with a defined height for React Flow to work */}
  //     <ReactFlow
  //       nodes={nodes}
  //       edges={edges}

  //       onNodesChange={onNodesChange}
  //       onEdgesChange={onEdgesChange}
  //       onNodeDragStop={handleNodeDragStop}
  //     >
  //       <Controls />
  //       <MiniMap />
  //       <Background variant="dots" gap={12} size={1} />
  //     </ReactFlow>

  //     {/* We can add a simple overlay for the title and navigation */}
  //     <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 4, background: 'white', padding: '10px', border: '1px solid black' }}>
  //       <h1>{area.name}</h1>
  //       <Link to="/">Back to Library</Link>
  //     </div>
  //   </div>
  // );

  return (
    <div className="workspace-container">
      <Sidebar 
        resources={area.resources} 
        onAddResourceClick={() => setIsModalOpen(true)}
      />

      {isModalOpen && (
        <AddResourceModal
          areaId={area.id}
          onClose={() => setIsModalOpen(false)}
          onResourceAdded={handleResourceAdded}
        />
      )}

      {isConnectModalOpen && (
        <AddConnectionModal 
          onSave={handleSaveConnection}
          onClose={() => setIsConnectModalOpen(false)}
        />
      )}

      <main className="main-content">
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: 'white', padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
          <h1>{area.name}</h1>
          <Link to="/">Back to Library</Link>
          
          {/* This is the view switcher, restored and fully functional */}
          <div className="view-switcher">
            <button 
              onClick={() => setViewMode('canvas')}
              className={viewMode === 'canvas' ? 'active' : ''}
            >
              Canvas View
            </button>
            <button 
              onClick={() => setViewMode('tabs')}
              className={viewMode === 'tabs' ? 'active' : ''}
            >
              Tab View
            </button>
          </div>
        </div>

      {/* This is the conditional rendering, restored and fully functional */}
        {viewMode === 'canvas' && (
          <ReactFlowProvider>
            <Canvas 
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              handleNodeDragStop={handleNodeDragStop}
              onResourceDropped={onResourceDropped}
              onConnect={onConnect}
            />
          </ReactFlowProvider>
        )}

        {viewMode === 'tabs' && (
          <TabView 
            nodes={nodes} 
            area={area} 
            onNoteAdded={handleNoteAdded}
          />
        )}
      </main>
    </div>
  );
}

export default WorkspaceView;