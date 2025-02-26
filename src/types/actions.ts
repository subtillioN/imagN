import { Source } from 'callbag';
import { WorkflowPreset } from './workflow';
import React from 'react';

export interface MainViewActions {
  // Stream actions
  loadPreset$: Source<WorkflowPreset>;
  savePreset$: Source<WorkflowPreset>;
  deletePreset$: Source<string>;
  updatePreset$: Source<WorkflowPreset>;
  addTag$: Source<{ presetId: string; tag: string }>;
  removeTag$: Source<{ presetId: string; tag: string }>;
  
  // Function actions
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  handleNewProjectClick: () => void;
  handleLoadProjectClick: () => void;
  handleCreateProject: () => void;
  handleLoadProject: (projectId: string) => void;
  handleProjectNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleProjectDescriptionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePresetSelect: (presetId: string) => void;
  handleTagSelect: (tag: string) => void;
  handleTagRemove: (tag: string) => void;
  handleTagSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleTagManagementOpen: () => void;
  handleTagManagementClose: () => void;
  handleAddTag: () => void;
  removeTag: (tag: string) => void;
  updateNewTag: (tag: string) => void;
}

export type MainViewActionType =
  | { type: 'SET_TAB'; tab: number }
  | { type: 'TOGGLE_TAG'; tag: string }
  | { type: 'SET_TAG_SEARCH'; query: string }
  | { type: 'LOAD_PRESETS'; systemPresets: WorkflowPreset[]; userPresets: WorkflowPreset[] }
  | { type: 'CREATE_PROJECT'; project: { id: string; name: string; description: string; presetId: string } }
  | { type: 'DELETE_PROJECT'; projectId: string }
  | { type: 'UPDATE_PROJECT'; project: { id: string; name: string; description: string; presetId: string } }
  | { type: 'ADD_TAG'; presetId: string; tag: string }
  | { type: 'REMOVE_TAG'; presetId: string; tag: string }
  | { type: 'SHOW_NOTIFICATION'; message: string; severity: 'success' | 'error' | 'info' | 'warning' }
  | { type: 'SAVE_WORKFLOW'; workflow: WorkflowPreset }
  | { type: 'UPDATE_WORKFLOW'; workflow: WorkflowPreset }
  | { type: 'DELETE_WORKFLOW'; id: string }; 