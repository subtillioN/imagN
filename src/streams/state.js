import { createSource } from './core';

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

// Simple state stream creation
export function createState(initialValue) {
  let currentState = initialValue;
  const stream = createSource((sink) => {
    sink.next(currentState);
    return () => {};
  });

  stream.update = (newState) => {
    currentState = typeof newState === 'function' ? newState(currentState) : newState;
    stream.source(1, currentState);
  };

  return stream;
}

// Update state helper
export function updateState(state$, update$) {
  let currentState;
  const combined$ = createSource((sink) => {
    const stateSub = state$.source(0, (type, data) => {
      if (type === 1) {
        currentState = data;
        sink.next(currentState);
      }
    });

    const updateSub = update$.source(0, (type, data) => {
      if (type === 1 && typeof data === 'function') {
        currentState = data(currentState);
        sink.next(currentState);
      }
    });

    return () => {
      stateSub(2);
      updateSub(2);
    };
  });

  return combined$;
}

// Select state helper
export function selectState(state$, selector) {
  return createSource((sink) => {
    const sub = state$.source(0, (type, data) => {
      if (type === 1) {
        sink.next(selector(data));
      }
    });
    return () => sub(2);
  });
}

// Create state store
export function createStateStore(initialValue) {
  const store = {
    state: initialValue,
    history: [],
    future: [],
    maxHistoryLength: 50
  };

  const stream = createSource((sink) => {
    sink.next(store.state);
    return () => {};
  });

  stream.dispatch = (action) => {
    switch (action.type) {
      case StateActionTypes.UPDATE_STATE:
        store.history.push(store.state);
        if (store.history.length > store.maxHistoryLength) {
          store.history.shift();
        }
        store.future = [];
        store.state = action.payload;
        stream.source(1, store.state);
        break;

      case StateActionTypes.UNDO:
        if (store.history.length > 0) {
          store.future.push(store.state);
          store.state = store.history.pop();
          stream.source(1, store.state);
        }
        break;

      case StateActionTypes.REDO:
        if (store.future.length > 0) {
          store.history.push(store.state);
          store.state = store.future.pop();
          stream.source(1, store.state);
        }
        break;

      default:
        break;
    }
  };

  return stream;
}