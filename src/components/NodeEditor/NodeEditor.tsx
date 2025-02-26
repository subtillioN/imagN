import React from 'react';
import { WorkflowNode } from '../../types/workflow';

export interface NodeEditorProps {
  nodes: WorkflowNode[];
  onNodesChange: () => void;
  onConnectionsChange: () => void;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ nodes, onNodesChange, onConnectionsChange }) => {
  return (
    <div>
      {/* Node editor implementation */}
      <div>Node Editor</div>
    </div>
  );
}; 