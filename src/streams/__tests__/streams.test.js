import { fromStream, toStream, streamMap, streamFilter, streamMerge, createStream } from '../index';
import xs from 'xstream';

describe('Stream Management', () => {
  describe('Stream Lifecycle', () => {
    it('should properly initialize a stream', () => {
      const stream = createStream(42);
      let value;
      stream.source(0, (t, d) => {
        if (t === 1) value = d;
      });
      expect(value).toBe(42);
    });

    it('should update stream value', () => {
      const stream = createStream(1);
      let value;
      stream.source(0, (t, d) => {
        if (t === 1) value = d;
      });
      expect(value).toBe(1);
    });
  });

  describe('Stream Operators', () => {
    it('should correctly map values', () => {
      const source = createStream(2);
      const doubled = streamMap(x => x * 2)(source);
      let value;
      doubled.source(0, (t, d) => {
        if (t === 1) value = d;
      });
      expect(value).toBe(4);
    });

    it('should properly filter values', () => {
      const source = createStream(3);
      const filtered = streamFilter(x => x > 2)(source);
      let value;
      filtered.source(0, (t, d) => {
        if (t === 1) value = d;
      });
      expect(value).toBe(3);
    });
  });

  describe('Stream Conversion', () => {
    it('should convert between xstream and callbag', (done) => {
      const xs$ = xs.of(1, 2, 3);
      const callbag = fromStream(xs$);
      const back$ = toStream(callbag);
      
      back$.addListener({
        next: value => {
          expect(value).toBe(1);
          done();
        }
      });
    });
  });
});