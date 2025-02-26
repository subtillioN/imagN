import { WorkflowNode, WorkflowConnection } from './workflow';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  tags?: string[];
} 