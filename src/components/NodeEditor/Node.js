import React from 'react';

export const Node = ({ type, position, 'data-testid': testId }) => {
  return (
    <g data-testid={testId}>
      <rect
        x={position.x}
        y={position.y}
        width="50"
        height="50"
        fill="#ffffff"
        stroke="black"
        strokeWidth="1"
      />
      <text
        x={position.x + 25}
        y={position.y + 30}
        textAnchor="middle"
      >
        {type}
      </text>
    </g>
  );
}; 