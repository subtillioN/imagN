import xs from 'xstream';
import { createState, updateState, selectState } from '../state';

describe('State Management', () => {
  describe('createState', () => {
    it('should create initial state', () => {
      const initialState = { count: 0 };
      const state$ = createState(initialState);
      
      expect(state$).toBeTruthy();
      state$.addListener({
        next: (state) => {
          expect(state).toEqual(initialState);
        }
      });
    });

    it('should maintain state immutability', (done) => {
      const initialState = { data: { value: 1 } };
      const state$ = createState(initialState);
      
      state$.addListener({
        next: (state) => {
          expect(state).not.toBe(initialState);
          expect(state).toEqual(initialState);
          done();
        }
      });
    });
  });

  describe('updateState', () => {
    it('should update state correctly', (done) => {
      const initialState = { count: 0 };
      const state$ = createState(initialState);
      const update$ = xs.of((state) => ({ ...state, count: state.count + 1 }));
      
      const updatedState$ = updateState(state$, update$);
      
      updatedState$.addListener({
        next: (state) => {
          expect(state.count).toBe(1);
          done();
        }
      });
    });

    it('should handle multiple updates', (done) => {
      const initialState = { count: 0 };
      const state$ = createState(initialState);
      const updates = [
        (state) => ({ ...state, count: state.count + 1 }),
        (state) => ({ ...state, count: state.count + 1 })
      ];
      const update$ = xs.fromArray(updates);
      
      const updatedState$ = updateState(state$, update$);
      let updateCount = 0;
      
      updatedState$.addListener({
        next: (state) => {
          updateCount++;
          if (updateCount === 2) {
            expect(state.count).toBe(2);
            done();
          }
        }
      });
    });
  });

  describe('selectState', () => {
    it('should select specific state slice', (done) => {
      const initialState = { user: { name: 'test', age: 25 } };
      const state$ = createState(initialState);
      
      const userName$ = selectState(state$, state => state.user.name);
      
      userName$.addListener({
        next: (name) => {
          expect(name).toBe('test');
          done();
        }
      });
    });

    it('should update when selected state changes', (done) => {
      const initialState = { data: { value: 1 } };
      const state$ = createState(initialState);
      const update$ = xs.of(state => ({ 
        ...state, 
        data: { ...state.data, value: 2 } 
      }));
      
      const updatedState$ = updateState(state$, update$);
      const value$ = selectState(updatedState$, state => state.data.value);
      
      value$.addListener({
        next: (value) => {
          if (value === 2) {
            expect(value).toBe(2);
            done();
          }
        }
      });
    });
  });
});