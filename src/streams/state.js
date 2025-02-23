import { makeSubject } from 'callbag-subject';
import { pipe } from 'callbag-pipe';
import { scan } from 'callbag-scan';
import { share } from 'callbag-share';
import { map } from 'callbag-map';

// Action Types
export const StateActionTypes = {
  UPDATE_STATE: 'UPDATE_STATE',
  RESET_STATE: 'RESET_STATE',
  UNDO: 'UNDO',
  REDO: 'REDO'
};

// Initial state structure
const initialState = {
  current: {},
  history: [],
  future: [],
  maxHistoryLength: 50
};

// Create action helper
export const createStateAction = (type, payload) => ({ type, payload });

// State reducer
const stateReducer = (state, action) => {
  switch (action.type) {
    case StateActionTypes.UPDATE_STATE: {
      const newState = {
        current: { ...state.current, ...action.payload },
        history: [
          state.current,
          ...state.history.slice(0, state.maxHistoryLength - 1)
        ],
        future: [],
        maxHistoryLength: state.maxHistoryLength
      };
      return newState;
    }
    case StateActionTypes.RESET_STATE:
      return {
        ...initialState,
        maxHistoryLength: state.maxHistoryLength
      };
    case StateActionTypes.UNDO: {
      if (state.history.length === 0) return state;
      return {
        current: state.history[0],
        history: state.history.slice(1),
        future: [state.current, ...state.future],
        maxHistoryLength: state.maxHistoryLength
      };
    }
    case StateActionTypes.REDO: {
      if (state.future.length === 0) return state;
      return {
        current: state.future[0],
        history: [state.current, ...state.history],
        future: state.future.slice(1),
        maxHistoryLength: state.maxHistoryLength
      };
    }
    default:
      return state;
  }
};

// Create state store
export const createStateStore = (initialData = {}) => {
  const subject = makeSubject();
  
  // Initialize state with provided data
  const initial = {
    ...initialState,
    current: initialData
  };

  // Create state stream with reducer and share it
  const state$ = pipe(
    subject,
    scan(stateReducer, initial),
    share
  );

  // Create selectors for different state slices
  const current$ = pipe(
    state$,
    map(state => state.current)
  );

  const canUndo$ = pipe(
    state$,
    map(state => state.history.length > 0)
  );

  const canRedo$ = pipe(
    state$,
    map(state => state.future.length > 0)
  );

  return {
    // Streams
    state$,
    current$,
    canUndo$,
    canRedo$,
    
    // Actions
    dispatch: (action) => subject(1)(action),
    
    // Helper methods
    updateState: (updates) => 
      subject(1)(createStateAction(StateActionTypes.UPDATE_STATE, updates)),
    resetState: () => 
      subject(1)(createStateAction(StateActionTypes.RESET_STATE)),
    undo: () => 
      subject(1)(createStateAction(StateActionTypes.UNDO)),
    redo: () => 
      subject(1)(createStateAction(StateActionTypes.REDO))
  };
};