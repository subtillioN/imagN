import { createSource, map, filter, combine, fromArray, fromPromise } from '../core';

describe('Stream Management', () => {
  describe('Stream Lifecycle', () => {
    it('should properly initialize a stream', (done) => {
      const source = createSource(({ next, complete }) => {
        next(1);
        complete();
      });

      source(0, (type, data) => {
        if (type === 1) expect(data).toBe(1);
        if (type === 2) done();
      });
    });

    it('should clean up resources when stream is terminated', (done) => {
      let cleaned = false;
      const source = createSource(({ next, complete }) => {
        return () => { cleaned = true; };
      });

      source(0, (type, data) => {
        if (type === 0) {
          data(2);
          expect(cleaned).toBe(true);
          done();
        }
      });
    });

    it('should handle stream errors gracefully', (done) => {
      const source = createSource(({ error }) => {
        error(new Error('Test error'));
      });

      source(0, (type, data) => {
        if (type === 2) {
          expect(data).toBeInstanceOf(Error);
          expect(data.message).toBe('Test error');
          done();
        }
      });
    });
  });

  describe('Stream Operators', () => {
    it('should correctly map values', (done) => {
      const source = fromArray([1, 2, 3]);
      const doubled = map(x => x * 2)(source);
      const results = [];

      doubled(0, (type, data) => {
        if (type === 1) results.push(data);
        if (type === 2) {
          expect(results).toEqual([2, 4, 6]);
          done();
        }
      });
    });

    it('should properly filter values', (done) => {
      const source = fromArray([1, 2, 3, 4]);
      const evens = filter(x => x % 2 === 0)(source);
      const results = [];

      evens(0, (type, data) => {
        if (type === 1) results.push(data);
        if (type === 2) {
          expect(results).toEqual([2, 4]);
          done();
        }
      });
    });

    it('should combine multiple streams', (done) => {
      const source1 = fromArray([1, 2]);
      const source2 = fromArray(['a', 'b']);
      const combined = combine(source1, source2);
      const results = [];

      combined(0, (type, data) => {
        if (type === 1) results.push(data);
        if (type === 2) {
          expect(results).toEqual([[1, 'a'], [2, 'b']]);
          done();
        }
      });
    });
  });

  describe('Stream Sources', () => {
    it('should create stream from array', (done) => {
      const source = fromArray([1, 2, 3]);
      const results = [];

      source(0, (type, data) => {
        if (type === 1) results.push(data);
        if (type === 2) {
          expect(results).toEqual([1, 2, 3]);
          done();
        }
      });
    });

    it('should create stream from promise', (done) => {
      const promise = Promise.resolve(42);
      const source = fromPromise(promise);

      source(0, (type, data) => {
        if (type === 1) expect(data).toBe(42);
        if (type === 2) done();
      });
    });
  });
}));