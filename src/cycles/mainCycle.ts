import xs, { Stream } from 'xstream';
import { Sources, Sinks } from '../drivers';
import { MainViewIntent } from '../intents/MainViewIntent';
import { MainViewModel } from '../models/MainViewModel';
import { MainView } from '../views/MainView';
import { MainViewState, createInitialState } from '../types/state';
import { StateSource } from '@cycle/state';

export type MainSources = Sources & {
  state: StateSource<MainViewState>;
};

export type MainSinks = Sinks;

export function mainCycle(sources: MainSources): MainSinks {
  // Create initial state
  const initialState$ = xs.of(createInitialState());
  
  // Setup intent (user interactions -> actions)
  const actions$ = MainViewIntent(sources);
  
  // Setup model (actions -> state updates)
  const state$ = MainViewModel(actions$, sources.workflow, sources.storage, initialState$);
  
  // Setup view (state -> DOM)
  const view$ = MainView(state$);
  
  // Handle workflow operations
  const workflow$ = state$.map(state => ({
    loadPresets$: xs.of(void 0),
    saveWorkflow$: xs.empty(),
    updateWorkflow$: xs.empty(),
    deleteWorkflow$: xs.empty()
  }));
  
  // Handle storage operations
  const storage$ = state$.map(state => ({
    setItem: xs.empty(),
    removeItem: xs.empty(),
    saveProject: xs.empty(),
    removeProject: xs.empty()
  }));
  
  return {
    DOM: view$,
    react: view$,
    workflow: workflow$,
    storage: storage$,
    state: state$
  };
} 