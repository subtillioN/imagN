import { createSource, map, filter, combine, fromArray } from '../core';

describe('Stream Management', () => {
  describe('Stream Lifecycle', () => {
    it('should properly initialize a stream', (done) => {
      const stream = createSource(({ next, complete }) => {
        next(42);
        complete();
        return () => {};
      });

      stream.source(0, (type, data) => {
        if (type === 1) expect(data).toBe(42);
        if (type === 2) done();
      });
    });

    it('should update stream value', (done) => {
      const stream = createSource(({ next }) => {
        next(1);
        return () => {};
      });

      stream.source(0, (type, data) => {
        if (type === 1) {
          expect(data).toBe(1);
          done();
        }
      });
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
});