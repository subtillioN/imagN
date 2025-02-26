import { createState, updateState, selectState, createStateStore } from '../state';

describe('State', () => {
  describe('createState', () => {
    it('should create a state stream with initial value', () => {
      const initialState = { count: 0 };
      const state$ = createState(initialState);
      let value;

      state$.source(0, (type, data) => {
        if (type === 1) {
          value = data;
        }
      });

      expect(value).toEqual(initialState);
    });

    it('should update state when calling update', () => {
      const state$ = createState({ count: 0 });
      const newState = { count: 1 };
      let value;

      state$.source(0, (type, data) => {
        if (type === 1) {
          value = data;
        }
      });

      state$.update(newState);
      expect(value).toEqual(newState);
    });
  });

  describe('updateState', () => {
    it('should update state when update$ emits', () => {
      const state$ = createState({ count: 0 });
      const update$ = createState((state) => ({ count: state.count + 1 }));
      const combined$ = updateState(state$, update$);
      let value;

      combined$.source(0, (type, data) => {
        if (type === 1) {
          value = data;
        }
      });

      update$.update((state) => ({ count: state.count + 1 }));
      expect(value).toEqual({ count: 1 });
    });
  });

  describe('selectState', () => {
    it('should select state using selector', () => {
      const state$ = createState({ user: { name: 'John' } });
      const selected$ = selectState(state$, state => state.user.name);
      let value;

      selected$.source(0, (type, data) => {
        if (type === 1) {
          value = data;
        }
      });

      expect(value).toBe('John');
    });
  });

  describe('StateStore', () => {
    it('should create store with initial state', () => {
      const store = createStateStore({ count: 0 });
      let value;

      store.source(0, (type, data) => {
        if (type === 1) {
          value = data;
        }
      });

      expect(value).toEqual({ count: 0 });
    });

    it('should handle UPDATE_STATE action', () => {
      const store = createStateStore({ count: 0 });
      let value;

      store.source(0, (type, data) => {
        if (type === 1) {
          value = data;
        }
      });

      store.dispatch({ type: 'UPDATE_STATE', payload: { count: 1 } });
      expect(value).toEqual({ count: 1 });
    });

    it('should handle UNDO action', () => {
      const store = createStateStore({ count: 0 });
      let value;

      store.source(0, (type, data) => {
        if (type === 1) {
          value = data;
        }
      });

      store.dispatch({ type: 'UPDATE_STATE', payload: { count: 1 } });
      store.dispatch({ type: 'UPDATE_STATE', payload: { count: 2 } });
      store.dispatch({ type: 'UNDO' });
      expect(value).toEqual({ count: 1 });
    });

    it('should handle REDO action', () => {
      const store = createStateStore({ count: 0 });
      let value;

      store.source(0, (type, data) => {
        if (type === 1) {
          value = data;
        }
      });

      store.dispatch({ type: 'UPDATE_STATE', payload: { count: 1 } });
      store.dispatch({ type: 'UPDATE_STATE', payload: { count: 2 } });
      store.dispatch({ type: 'UNDO' });
      store.dispatch({ type: 'REDO' });
      expect(value).toEqual({ count: 2 });
    });
  });
});