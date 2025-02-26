import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, scan, startWith, withLatestFrom } from 'rxjs/operators';
import { WorkflowPreset } from '../types/workflow';
import { Project } from '../types/project';
import { workflowPresetService } from '../services/workflowPresets';
import { WorkflowStorageService } from '../services/workflowStorage';

// State interface
export interface MainViewState {
  currentTab: number;
  systemPresets: WorkflowPreset[];
  userPresets: WorkflowPreset[];
  filteredSystemPresets: WorkflowPreset[];
  filteredUserPresets: WorkflowPreset[];
  selectedCategories: string[];
  selectedTypes: string[];
  selectedTags: string[];
  tagSearchQuery: string;
  currentProject: Project | null;
  projects: Project[];
  selectedProjectId: string | null;
  newProjectDialogOpen: boolean;
  loadProjectDialogOpen: boolean;
  tagManagementDialogOpen: boolean;
  editingPresetId: string | null;
  snackbarState: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  };
}

// Intent/Actions
export type MainViewIntent =
  | { type: 'SET_CURRENT_TAB'; tab: number }
  | { type: 'TOGGLE_CATEGORY'; category: string }
  | { type: 'TOGGLE_TYPE'; typeValue: string }
  | { type: 'TOGGLE_TAG'; tag: string }
  | { type: 'SET_TAG_SEARCH'; query: string }
  | { type: 'LOAD_PRESETS'; systemPresets: WorkflowPreset[]; userPresets: WorkflowPreset[] }
  | { type: 'CREATE_PROJECT'; project: Project }
  | { type: 'DELETE_PROJECT'; projectId: string }
  | { type: 'SELECT_PROJECT'; projectId: string }
  | { type: 'TOGGLE_NEW_PROJECT_DIALOG' }
  | { type: 'TOGGLE_LOAD_PROJECT_DIALOG' }
  | { type: 'TOGGLE_TAG_MANAGEMENT_DIALOG'; presetId?: string }
  | { type: 'ADD_TAG'; presetId: string; tag: string }
  | { type: 'REMOVE_TAG'; presetId: string; tag: string }
  | { type: 'SHOW_NOTIFICATION'; message: string; severity: 'success' | 'error' | 'info' | 'warning' };

export class MainViewStore {
  private state$ = new BehaviorSubject<MainViewState>({
    currentTab: 0,
    systemPresets: [],
    userPresets: [],
    filteredSystemPresets: [],
    filteredUserPresets: [],
    selectedCategories: [],
    selectedTypes: [],
    selectedTags: [],
    tagSearchQuery: '',
    currentProject: null,
    projects: [],
    selectedProjectId: null,
    newProjectDialogOpen: false,
    loadProjectDialogOpen: false,
    tagManagementDialogOpen: false,
    editingPresetId: null,
    snackbarState: {
      open: false,
      message: '',
      severity: 'info'
    }
  });

  private intent$ = new Subject<MainViewIntent>();
  private workflowStorage: WorkflowStorageService;

  constructor() {
    this.workflowStorage = new WorkflowStorageService();
    this.setupIntentHandling();
    this.loadInitialData();
  }

  private setupIntentHandling() {
    this.intent$.pipe(
      withLatestFrom(this.state$),
      map(([intent, state]) => this.reduce(state, intent)),
      startWith(this.state$.getValue())
    ).subscribe(newState => this.state$.next(newState));
  }

  private loadInitialData() {
    // Load presets
    workflowPresetService.getAllPresets().subscribe(presets => {
      const systemPresets = presets.filter(preset => 
        preset.tags?.includes('default')
      );
      
      const userWorkflows = this.workflowStorage.getAllWorkflows();
      const userPresets = userWorkflows.map((workflow: WorkflowPreset) => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || 'User-defined workflow',
        tags: workflow.tags || ['user'],
        nodes: workflow.nodes || [],
        connections: workflow.connections || []
      }));

      this.dispatch({ type: 'LOAD_PRESETS', systemPresets, userPresets });
    });
  }

  private reduce(state: MainViewState, intent: MainViewIntent): MainViewState {
    switch (intent.type) {
      case 'SET_CURRENT_TAB':
        return { ...state, currentTab: intent.tab };

      case 'TOGGLE_CATEGORY': {
        const selectedCategories = state.selectedCategories.includes(intent.category)
          ? state.selectedCategories.filter(c => c !== intent.category)
          : [...state.selectedCategories, intent.category];
        
        return {
          ...state,
          selectedCategories,
          filteredSystemPresets: this.filterPresets(state.systemPresets, selectedCategories, state.selectedTypes, state.selectedTags, state.tagSearchQuery),
          filteredUserPresets: this.filterPresets(state.userPresets, selectedCategories, state.selectedTypes, state.selectedTags, state.tagSearchQuery)
        };
      }

      case 'LOAD_PRESETS':
        return {
          ...state,
          systemPresets: intent.systemPresets,
          userPresets: intent.userPresets,
          filteredSystemPresets: this.filterPresets(intent.systemPresets, state.selectedCategories, state.selectedTypes, state.selectedTags, state.tagSearchQuery),
          filteredUserPresets: this.filterPresets(intent.userPresets, state.selectedCategories, state.selectedTypes, state.selectedTags, state.tagSearchQuery)
        };

      case 'TOGGLE_TAG': {
        const selectedTags = state.selectedTags.includes(intent.tag)
          ? state.selectedTags.filter(t => t !== intent.tag)
          : [...state.selectedTags, intent.tag];
        
        return {
          ...state,
          selectedTags,
          filteredSystemPresets: this.filterPresets(state.systemPresets, state.selectedCategories, state.selectedTypes, selectedTags, state.tagSearchQuery),
          filteredUserPresets: this.filterPresets(state.userPresets, state.selectedCategories, state.selectedTypes, selectedTags, state.tagSearchQuery)
        };
      }

      // Add other cases for intent handling...

      default:
        return state;
    }
  }

  private filterPresets(
    presets: WorkflowPreset[],
    categories: string[],
    types: string[],
    tags: string[],
    searchQuery: string
  ): WorkflowPreset[] {
    return presets.filter(preset => {
      const matchesCategories = categories.length === 0 || 
        (preset.category && categories.includes(preset.category));
      const matchesTypes = types.length === 0 || 
        (preset.type && types.includes(preset.type));
      const matchesTags = tags.length === 0 || 
        tags.every((tag: string) => preset.tags?.includes(tag));
      const matchesSearch = !searchQuery || 
        preset.tags?.some((tag: string) => 
          tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategories && matchesTypes && matchesTags && matchesSearch;
    });
  }

  // Public methods to observe state
  public getState$(): Observable<MainViewState> {
    return this.state$.asObservable();
  }

  public dispatch(intent: MainViewIntent) {
    this.intent$.next(intent);
  }
}

export const mainViewStore = new MainViewStore(); 