import React from 'react';

export const NodeConnection = ({ source, target, 'data-testid': testId }) => {
  if (!source || !target) return null;

  const startX = source.position.x + 50; // Right side of source node
  const startY = source.position.y + 25; // Middle of source node
  const endX = target.position.x; // Left side of target node
  const endY = target.position.y + 25; // Middle of target node

  return (
    <g data-testid={testId}>
      <path
        d={`M${startX},${startY} L${endX},${endY}`}
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
    </g>
  );
};