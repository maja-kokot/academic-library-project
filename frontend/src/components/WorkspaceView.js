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
import PlannerNode from './PlannerNode';

const nodeTypes = {
  custom: CustomNode,
  planner: PlannerNode,
};

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

  const handleTaskToggle = useCallback((taskId, isCompleted) => {
    axios.patch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, { is_completed: isCompleted })
      .then(response => {
        setArea(currentArea => ({
          ...currentArea,
          tasks: currentArea.tasks.map(task => task.id === taskId ? response.data : task),
        }));
      }).catch(err => console.error("Failed to update task:", err));
  }, []);

  const handleAddTask = useCallback((description) => {
    if (!area) return;
    axios.post('http://127.0.0.1:8000/api/tasks/', { area: area.id, description, is_completed: false })
      .then(response => {
        setArea(currentArea => ({
          ...currentArea,
          tasks: [...currentArea.tasks, response.data],
        }));
      }).catch(err => console.error("Failed to add task:", err));
  }, [area]);

  const onDeleteNode = useCallback((canvasItemIdToDelete) => {
    if (!window.confirm("Are you sure you want to remove this item from the canvas?")) return;
    axios.delete(`http://127.0.0.1:8000/api/canvas-items/${canvasItemIdToDelete}/`)
      .then(() => {
        setArea(currentArea => ({
          ...currentArea,
          canvas_items: currentArea.canvas_items.filter(item => item.id !== canvasItemIdToDelete),
        }));
      }).catch(err => console.error("Failed to delete canvas item:", err));
  }, []);

  const handleNodeDragStop = useCallback((event, node) => {
    if (node.id === 'planner-node') {
      // For now, we don't save the planner's position.
      // The local drag will feel smooth because of onNodesChange.
      return;
    }
    const { canvasItemId } = node.data;
    if (!canvasItemId) return;

    axios.patch(`http://127.0.0.1:8000/api/canvas-items/${canvasItemId}/`, {
      pos_x: Math.round(node.position.x),
      pos_y: Math.round(node.position.y),
    }).catch(err => console.error('Failed to update node position:', err));
  }, []);

  const onResourceDropped = useCallback((droppedItem, position) => {
    setNodes(currentNodes => {
      if (currentNodes.some(node => node.id === String(droppedItem.id))) {
        alert("This resource is already on the canvas.");
        return currentNodes;
      }
      
      const payload = {
        area: area.id,
        resource: droppedItem.id,
        pos_x: Math.round(position.x),
        pos_y: Math.round(position.y),
      };
      
      axios.post('http://127.0.0.1:8000/api/canvas-items/', payload)
      .then(response => {
          setArea(currentArea => ({
              ...currentArea,
              canvas_items: [...currentArea.canvas_items, response.data]
          }));
        })
        .catch(err => console.error("Failed to create canvas item:", err));

        return currentNodes;
    });
  }, [area, setNodes]);


useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/areas/${areaSlug}/`);
        setArea(response.data); // Set the master data state
      } catch (err) { setError('Failed to fetch workspace data.'); } 
      finally { setLoading(false); }
    };
    fetchWorkspaceData();
  }, [areaSlug]);

  // --- UPDATE PLANNER NODE WHEN TASKS CHANGE ---
  // NEW: This second useEffect watches for changes in `area.tasks`
  // and updates the planner node's data to ensure it never has stale data.
  useEffect(() => {
    if (!area) return; // Don't run if data hasn't been loaded yet

    const resourceNodes = area.canvas_items.map(item => ({
      id: String(item.resource.id),
      position: { x: item.pos_x, y: item.pos_y },
      data: { label: item.resource.title, canvasItemId: item.id, onDelete: onDeleteNode },
      type: 'custom',
    }));

    const plannerNode = {
      id: 'planner-node',
      type: 'planner',
      position: { x: 50, y: 50 }, // Always starts here on load
      draggable: true,
      data: {
        tasks: area.tasks,
        onTaskToggle: handleTaskToggle,
        onAddTask: handleAddTask,
      },
    };

    setNodes([...resourceNodes, plannerNode]);

    const initialEdges = area.connections.map(conn => ({
      id: `e-${conn.source}-${conn.target}`,
      source: String(conn.source),
      target: String(conn.target),
      label: conn.label,
    }));
    setEdges(initialEdges);

  }, [area, onDeleteNode, handleAddTask, handleTaskToggle, setNodes, setEdges]); // It re-runs ONLY when the master 'area' state changes.

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
        <div style={{ display: viewMode === 'canvas' ? 'block' : 'none', height: '100%' }}>
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
        </div>

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