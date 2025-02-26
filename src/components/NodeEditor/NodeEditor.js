import React from 'react';
import { Node } from './Node';
import { NodeConnection } from './NodeConnection';

export const NodeEditor = ({ nodes = [], connections = [] }) => {
  return (
    <div data-testid="node-editor">
      <svg xmlns="http://www.w3.org/2000/svg">
        <g>
          {connections.map(connection => (
            <NodeConnection
              key={connection.id}
              data-testid={`connection-${connection.id}`}
              source={nodes.find(n => n.id === connection.source)}
              target={nodes.find(n => n.id === connection.target)}
            />
          ))}
        </g>
        <g>
          {nodes.map(node => (
            <Node
              key={node.id}
              data-testid={`node-${node.id}`}
              type={node.type}
              position={node.position}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};