import { WorkflowPreset } from '../types/workflow';

export class WorkflowStorageService {
  getAllWorkflows(): WorkflowPreset[];
  getWorkflow(id: string): WorkflowPreset | null;
  saveWorkflow(workflow: WorkflowPreset): void;
  updateWorkflow(workflow: WorkflowPreset): void;
  deleteWorkflow(id: string): void;
} 