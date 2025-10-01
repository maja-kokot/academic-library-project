// In frontend/src/components/PlannerNode.js

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

function PlannerNode({ data }) {
  // 'data' contains the props we pass from WorkspaceView:
  // tasks, onTaskToggle, onAddTask
  const [newTask, setNewTask] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim() === '') return;
    data.onAddTask(newTask);
    setNewTask(''); // Clear the input after adding
  };

  return (
    <div className="planner-node">
      {/* We add handles so we can connect tasks to resources later */}
      <Handle type="source" position={Position.Right} />
      <div className="planner-header">
        <h3>Planner</h3>
      </div>

      <div className="task-list nodrag">
        {data.tasks && data.tasks.length > 0 ? (
          data.tasks.map(task => (
            <div key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={task.is_completed}
                onChange={() => data.onTaskToggle(task.id, !task.is_completed)}
              />
              <span className={task.is_completed ? 'completed' : ''}>
                {task.description}
              </span>
            </div>
          ))
        ) : (
          <p className="no-tasks-message">No tasks yet.</p>
        )}
      </div>

      <form className="add-task-form nodrag" onSubmit={handleAddTask}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
        />
        <button type="submit">+</button>
      </form>
    </div>
  );
}

export default PlannerNode;