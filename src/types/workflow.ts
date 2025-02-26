export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  params?: Record<string, any>;
}

export interface WorkflowConnection {
  id: string;
  from: { nodeId: string; outputId: string };
  to: { nodeId: string; inputId: string };
}

export interface WorkflowPreset {
  id: string;
  name: string;
  description: string;
  tags: string[];
  category?: string;
  type?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
} 