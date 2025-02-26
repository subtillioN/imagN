import { Stream } from 'xstream';
import { WorkflowPreset } from './workflow';
import { Project } from './project';
import { Subject } from 'rxjs';
import { WorkflowNode, WorkflowConnection } from '../components/MainView';

export interface DialogState {
  isOpen: boolean;
  presetId?: string;
}

export interface SnackbarState {
  isOpen: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  autoHideDuration?: number;
}

export interface FilterState {
  selectedCategories: Set<string>;
  selectedTypes: Set<string>;
  selectedTags: Set<string>;
  tagSearchQuery: string;
}

export interface MainViewState {
  imageConfig: any;
  progress: any;
  results: any;
  workflow: any;
  currentTab: number;
  slideDirection: 'left' | 'right';
  previousTab: number;
  isTransitioning: boolean;
  showPrevious: boolean;
  newProjectDialogOpen: boolean;
  newProjectName: string;
  newProjectPreset: string;
  newProjectDescription: string;
  loadProjectDialogOpen: boolean;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    createdAt: string;
    lastModified: string;
    presetId: string;
  }>;
  selectedProjectId: string | null;
  currentProject: {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    lastModified: string;
    presetId: string;
  } | null;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error' | 'info' | 'warning';
  errors: {
    projectName?: string;
    projectPreset?: string;
  };
  formTouched: Record<string, boolean>;
  systemPresets: WorkflowPreset[];
  userPresets: WorkflowPreset[];
  availableCategories: string[];
  availableTypes: string[];
  availableTags: string[];
  selectedCategories: string[];
  selectedTypes: string[];
  selectedTags: string[];
  tagSearchQuery: string;
  tagManagementDialogOpen: boolean;
  editingPresetId: string | null;
  newTag: string;
  selectedPresetId: string | null;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  filters: {
    selectedCategories: Set<string>;
    selectedTypes: Set<string>;
    selectedTags: Set<string>;
    tagSearchQuery: string;
  };
}

export interface MainViewStateUpdate {
  (state: MainViewState): Partial<MainViewState>;
}

// Helper type for state streams
export type StateStream = Stream<MainViewState>;

// Helper type for state update streams
export type StateUpdateStream = Stream<MainViewStateUpdate>;

// Initial state factory
export function createInitialState(): MainViewState {
  return {
    currentTab: 0,
    selectedProjectId: null,
    
    systemPresets: [],
    userPresets: [],
    projects: [],
    currentProject: null,
    
    filters: {
      selectedCategories: new Set(),
      selectedTypes: new Set(),
      selectedTags: new Set(),
      tagSearchQuery: ''
    },
    
    availableCategories: [],
    availableTypes: [],
    availableTags: [],
    
    newProjectDialog: {
      isOpen: false
    },
    loadProjectDialog: {
      isOpen: false
    },
    tagManagementDialog: {
      isOpen: false
    },
    
    snackbar: {
      isOpen: false,
      message: '',
      severity: 'info',
      autoHideDuration: 6000
    },
    
    imageConfig: {},
    progress: {},
    results: {},
    workflow: {},
    slideDirection: 'left',
    previousTab: 0,
    isTransitioning: false,
    showPrevious: false,
    newProjectDialogOpen: false,
    newProjectName: '',
    newProjectPreset: '',
    newProjectDescription: '',
    loadProjectDialogOpen: false,
    snackbarOpen: false,
    errors: {},
    formTouched: {},
    selectedPresetId: null,
    nodes: [],
    connections: [],
    filters: {
      selectedCategories: new Set(),
      selectedTypes: new Set(),
      selectedTags: new Set(),
      tagSearchQuery: ''
    }
  };
}

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

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  presetId: string;
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