import { createSource, map, filter, combine, fromArray, fromPromise } from '../core';

describe('Stream Management', () => {
  describe('Stream Lifecycle', () => {
    it('should properly initialize a stream', () => {
      const stream = createSource(({ next }) => {
        next(1);
        return () => {};
      });

      let value;
      stream.source(0, (type, data) => {
        if (type === 1) {
          value = data;
        }
      });

      expect(value).toBe(1);
    });

    it('should clean up resources when stream is terminated', () => {
      let cleaned = false;
      const stream = createSource(() => {
        return () => {
          cleaned = true;
        };
      });

      stream.source(0, () => {});
      stream.source(2); // Complete the stream
      expect(cleaned).toBe(true);
    });

    it('should handle stream errors gracefully', () => {
      const testError = new Error('Test error');
      let receivedError;
      const stream = createSource(({ error }) => {
        error(testError);
        return () => {};
      });

      stream.source(0, (type, data) => {
        if (type === 3) {
          receivedError = data;
        }
      });

      expect(receivedError).toBe(testError);
    });

    it('should complete stream when complete is called', () => {
      let completed = false;
      const stream = createSource(({ next, complete }) => {
        next(1);
        complete();
        return () => {};
      });

      stream.source(0, (type) => {
        if (type === 2) {
          completed = true;
        }
      });

      expect(completed).toBe(true);
    });
  });

  describe('Stream Operators', () => {
    it('should correctly map values', (done) => {
      const source = fromArray([2]);
      const doubled = map(x => x * 2)(source);

      doubled.source(0, (type, data) => {
        if (type === 1) {
          expect(data).toBe(4);
        }
        if (type === 2) done();
      });
    });

    it('should properly filter values', (done) => {
      const source = fromArray([1, 2, 3]);
      const filtered = filter(x => x > 2)(source);

      filtered.source(0, (type, data) => {
        if (type === 1) {
          expect(data).toBe(3);
        }
        if (type === 2) done();
      });
    });

    it('should combine multiple streams', (done) => {
      const source1 = fromArray([1]);
      const source2 = fromArray(['a']);
      const combined = combine(source1, source2);

      combined.source(0, (type, data) => {
        if (type === 1) {
          expect(data[0]).toBe(1);
          expect(data[1]).toBe('a');
        }
        if (type === 2) done();
      });
    });
  });

  describe('Stream Sources', () => {
    it('should create stream from array', (done) => {
      const stream = fromArray([1, 2, 3]);

      const values = [];
      stream.source(0, (type, data) => {
        if (type === 1) values.push(data);
        if (type === 2) {
          expect(values).toEqual([1, 2, 3]);
          done();
        }
      });
    });

    it('should create stream from promise', (done) => {
      const promise = Promise.resolve(42);
      const stream = fromPromise(promise);

      stream.source(0, (type, data) => {
        if (type === 1) expect(data).toBe(42);
        if (type === 2) done();
      });
    });
  });
});