import { Observable } from 'rxjs';
import { WorkflowPreset } from '../components/MainView';

export interface WorkflowPresetService {
  getAllPresets(): Observable<WorkflowPreset[]>;
  getDefaultPresets(): Observable<WorkflowPreset[]>;
  getUserPresets(): Observable<WorkflowPreset[]>;
  getPresetsByCategory(category: string): Observable<WorkflowPreset[]>;
  getPresetsByType(type: string): Observable<WorkflowPreset[]>;
  getPresetsByTag(tag: string): Observable<WorkflowPreset[]>;
  getAllCategories(): Observable<string[]>;
  getAllTypes(): Observable<string[]>;
  getAllTags(): Observable<string[]>;
}

export const workflowPresetService: WorkflowPresetService; 