import { Stream } from 'xstream';
import { h } from '@cycle/react';
import { MainViewState } from '../types/state';
import React from 'react';
import { PresetList } from './PresetList';
import { ProjectList } from './ProjectList';
import { Tabs, Tab } from '@mui/material';
import { TagFilter } from './TagFilter';
import { NewProjectDialog } from './dialogs/NewProjectDialog';
import { LoadProjectDialog } from './dialogs/LoadProjectDialog';
import { TagManagementDialog } from './dialogs/TagManagementDialog';
import { Snackbar } from './Snackbar';

export function MainView(state$: Stream<MainViewState>): Stream<JSX.Element> {
  return state$.map(state => 
    h('div', { className: 'main-view' }, [
      // Tabs
      h(Tabs, {
        sel: 'tabs',
        value: state.currentTab,
        onChange: (_, value) => value,
      }, [
        h(Tab, { label: 'Presets', value: 'presets' }),
        h(Tab, { label: 'Projects', value: 'projects' })
      ]),

      // Filters
      h(TagFilter, {
        selectedCategories: Array.from(state.filters.selectedCategories),
        selectedTypes: Array.from(state.filters.selectedTypes),
        selectedTags: Array.from(state.filters.selectedTags),
        tagSearchQuery: state.filters.tagSearchQuery,
        availableCategories: Array.from(state.availableCategories),
        availableTypes: Array.from(state.availableTypes),
        availableTags: Array.from(state.availableTags)
      }),

      // Content
      state.currentTab === 'presets' ?
        h(PresetList, {
          systemPresets: state.filteredSystemPresets,
          userPresets: state.filteredUserPresets,
          selectedPresetId: state.selectedProjectId,
          isLoading: state.isLoadingPresets
        }) :
        h(ProjectList, {
          projects: state.projects,
          selectedProjectId: state.selectedProjectId,
          isLoading: state.isLoadingProjects
        }),

      // Dialogs
      h(NewProjectDialog, {
        open: state.newProjectDialog.isOpen,
        systemPresets: state.systemPresets,
        userPresets: state.userPresets
      }),

      h(LoadProjectDialog, {
        open: state.loadProjectDialog.isOpen,
        projects: state.projects
      }),

      h(TagManagementDialog, {
        open: state.tagManagementDialog.isOpen,
        presetId: state.tagManagementDialog.presetId,
        availableTags: Array.from(state.availableTags)
      }),

      // Notifications
      h(Snackbar, {
        open: state.snackbar.isOpen,
        message: state.snackbar.message,
        severity: state.snackbar.severity,
        autoHideDuration: state.snackbar.autoHideDuration
      })
    ])
  );
} 