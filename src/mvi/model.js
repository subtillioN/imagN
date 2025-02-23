import { makeSubject } from 'callbag-subject';
import { pipe } from 'callbag-pipe';
import { scan } from 'callbag-scan';

// Initial state structure
const initialState = {
  data: null,
  loading: false,
  error: null
};

// Action types
export const ActionTypes = {
  SET_DATA: 'SET_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Reducer function for state updates
const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_DATA:
      return { ...state, data: action.payload, loading: false, error: null };
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

// Create model stream
export const createModel = () => {
  const subject = makeSubject();
  
  // Create state stream with reducer
  const state$ = pipe(
    subject,
    scan(reducer, initialState)
  );

  return {
    state$,
    dispatch: (action) => subject(1)(action)
  };
};