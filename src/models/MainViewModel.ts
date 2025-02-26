import xs, { Stream } from 'xstream';
import { MainViewActions } from '../types/actions';
import { MainViewState, createInitialState } from '../types/state';
import { WorkflowSource } from '../drivers/workflowDriver';
import { StorageSource } from '../drivers/storageDriver';

export function MainViewModel(
  actions$: Stream<MainViewActions>,
  workflow: WorkflowSource,
  storage: StorageSource,
  initialState$: Stream<MainViewState>
): Stream<MainViewState> {
  // Helper to create state updates
  const update = (state: MainViewState, updateFn: (s: MainViewState) => Partial<MainViewState>): MainViewState => ({
    ...state,
    ...updateFn(state)
  });

  // Handle tab changes
  const tabChange$ = actions$
    .filter(action => action.type === 'SET_CURRENT_TAB')
    .map(action => (state: MainViewState) => ({
      currentTab: action.tab
    }));

  // Handle category toggles
  const categoryToggle$ = actions$
    .filter(action => action.type === 'TOGGLE_CATEGORY')
    .map(action => (state: MainViewState) => {
      const newCategories = new Set(state.filters.selectedCategories);
      if (newCategories.has(action.category)) {
        newCategories.delete(action.category);
      } else {
        newCategories.add(action.category);
      }
      return {
        filters: {
          ...state.filters,
          selectedCategories: newCategories
        }
      };
    });

  // Handle tag toggles
  const tagToggle$ = actions$
    .filter(action => action.type === 'TOGGLE_TAG')
    .map(action => (state: MainViewState) => {
      const newTags = new Set(state.filters.selectedTags);
      if (newTags.has(action.tag)) {
        newTags.delete(action.tag);
      } else {
        newTags.add(action.tag);
      }
      return {
        filters: {
          ...state.filters,
          selectedTags: newTags
        }
      };
    });

  // Handle tag search
  const tagSearch$ = actions$
    .filter(action => action.type === 'SET_TAG_SEARCH')
    .map(action => (state: MainViewState) => ({
      filters: {
        ...state.filters,
        tagSearchQuery: action.query
      }
    }));

  // Handle preset loading
  const presetsLoad$ = actions$
    .filter(action => action.type === 'LOAD_PRESETS')
    .map(action => (state: MainViewState) => ({
      systemPresets: action.systemPresets,
      userPresets: action.userPresets,
      filteredSystemPresets: action.systemPresets,
      filteredUserPresets: action.userPresets
    }));

  // Handle project creation
  const projectCreate$ = actions$
    .filter(action => action.type === 'CREATE_PROJECT')
    .map(action => (state: MainViewState) => ({
      projects: [...state.projects, action.project],
      currentProject: action.project,
      selectedProjectId: action.project.id,
      newProjectDialog: { isOpen: false }
    }));

  // Handle project deletion
  const projectDelete$ = actions$
    .filter(action => action.type === 'DELETE_PROJECT')
    .map(action => (state: MainViewState) => ({
      projects: state.projects.filter(p => p.id !== action.projectId),
      currentProject: state.currentProject?.id === action.projectId ? null : state.currentProject,
      selectedProjectId: state.selectedProjectId === action.projectId ? null : state.selectedProjectId
    }));

  // Handle dialog toggles
  const dialogToggles$ = actions$
    .filter(action => 
      action.type === 'TOGGLE_NEW_PROJECT_DIALOG' ||
      action.type === 'TOGGLE_LOAD_PROJECT_DIALOG' ||
      action.type === 'TOGGLE_TAG_MANAGEMENT_DIALOG'
    )
    .map(action => (state: MainViewState) => {
      switch (action.type) {
        case 'TOGGLE_NEW_PROJECT_DIALOG':
          return {
            newProjectDialog: { isOpen: !state.newProjectDialog.isOpen }
          };
        case 'TOGGLE_LOAD_PROJECT_DIALOG':
          return {
            loadProjectDialog: { isOpen: !state.loadProjectDialog.isOpen }
          };
        case 'TOGGLE_TAG_MANAGEMENT_DIALOG':
          return {
            tagManagementDialog: {
              isOpen: !state.tagManagementDialog.isOpen,
              presetId: action.presetId
            }
          };
      }
    });

  // Combine all state updates
  const updates$ = xs.merge(
    tabChange$,
    categoryToggle$,
    tagToggle$,
    tagSearch$,
    presetsLoad$,
    projectCreate$,
    projectDelete$,
    dialogToggles$
  );

  // Return state stream
  return xs.merge(initialState$, updates$)
    .fold((state, updateFn) => update(state, updateFn as any), createInitialState());
} 