// In frontend/src/components/DraggableResource.js

import React from 'react';
import { useDrag } from 'react-dnd';

// Define a "drag type" to identify what's being dragged
export const ItemTypes = {
  RESOURCE: 'resource',
};

function DraggableResource({ resource }) {
  // useDrag is a hook from react-dnd
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.RESOURCE,
    // 'item' is the data payload that will be available on drop
    item: { id: resource.id, title: resource.title },
    // collect is a function that collects monitoring state
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    // The 'ref={drag}' part is what makes this element draggable
    <li
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1, // Make it semi-transparent while dragging
      }}
    >
      {resource.title}
    </li>
  );
}

export default DraggableResource;