import { pipe, map, filter, merge } from 'callbag-basics';
import fromObs from 'callbag-from-obs';
import toObs from 'callbag-to-obs';

// Convert from xstream to callbag
export const fromStream = stream => fromObs(stream);

// Convert from callbag to xstream
export const toStream = source => toObs(source);

// Basic stream operators
export const streamMap = fn => source => pipe(source, map(fn));
export const streamFilter = predicate => source => pipe(source, filter(predicate));
export const streamMerge = (...sources) => merge(...sources);

// Stream lifecycle management
export const createStream = (initialValue) => {
  let currentValue = initialValue;
  return {
    source: (type, sink) => {
      if (type === 0) {
        sink(0, (t, d) => {
          if (t === 1) currentValue = d;
        });
        sink(1, currentValue);
      }
    }
  };
};