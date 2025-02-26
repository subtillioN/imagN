import xs, { Stream } from 'xstream';
import { ReactSource } from '@cycle/react';
import { MainViewActions } from '../types/actions';
import { ChangeEvent, MouseEvent } from 'react';
import { Project } from '../types/project';

export function MainViewIntent(sources: { react: ReactSource }): Stream<MainViewActions> {
  const tabChange$ = sources.react.select('tabs').events('change')
    .map((event: ChangeEvent<HTMLSelectElement>) => ({
      type: 'SET_CURRENT_TAB',
      tab: event.target.value
    } as MainViewActions));

  const categoryToggle$ = sources.react.select('category').events('click')
    .map((event: MouseEvent<HTMLElement>) => ({
      type: 'TOGGLE_CATEGORY',
      category: event.currentTarget.dataset.category || ''
    } as MainViewActions));

  const tagToggle$ = sources.react.select('tag').events('click')
    .map((event: MouseEvent<HTMLElement>) => ({
      type: 'TOGGLE_TAG',
      tag: event.currentTarget.dataset.tag || ''
    } as MainViewActions));

  const tagSearch$ = sources.react.select('tagSearch').events('change')
    .map((event: ChangeEvent<HTMLInputElement>) => ({
      type: 'SET_TAG_SEARCH',
      query: event.target.value
    } as MainViewActions));

  const newProjectDialog$ = sources.react.select('newProject').events('click')
    .map(() => ({
      type: 'TOGGLE_NEW_PROJECT_DIALOG'
    } as MainViewActions));

  const loadProjectDialog$ = sources.react.select('loadProject').events('click')
    .map(() => ({
      type: 'TOGGLE_LOAD_PROJECT_DIALOG'
    } as MainViewActions));

  const createProject$ = sources.react.select('createProject').events('click')
    .map((event: MouseEvent<HTMLElement>) => {
      const projectData = event.currentTarget.dataset.project;
      if (!projectData) return null;
      
      try {
        const project: Project = JSON.parse(projectData);
        return {
          type: 'CREATE_PROJECT',
          project
        } as MainViewActions;
      } catch (e) {
        console.error('Failed to parse project data:', e);
        return null;
      }
    })
    .filter((action: MainViewActions | null): action is MainViewActions => action !== null);

  const deleteProject$ = sources.react.select('deleteProject').events('click')
    .map((event: MouseEvent<HTMLElement>) => ({
      type: 'DELETE_PROJECT',
      projectId: event.currentTarget.dataset.projectId || ''
    } as MainViewActions));

  return xs.merge(
    tabChange$,
    categoryToggle$,
    tagToggle$,
    tagSearch$,
    newProjectDialog$,
    loadProjectDialog$,
    createProject$,
    deleteProject$
  );
} 