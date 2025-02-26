import { pipe, map, filter, merge } from 'callbag-basics';
import fromObs from 'callbag-from-obs';
import toObs from 'callbag-to-obs';
import subject from 'callbag-subject';

// Convert from xstream to callbag
export const fromStream = stream => ({ source: fromObs(stream) });

// Convert from callbag to xstream
export const toStream = source => toObs(source.source);

// Basic stream operators
export const streamMap = fn => source => ({ 
  source: pipe(source.source, map(fn))
});

export const streamFilter = predicate => source => ({
  source: pipe(source.source, filter(predicate))
});

export const streamMerge = (...sources) => ({
  source: merge(...sources.map(s => s.source))
});

// Stream lifecycle management
export const createStream = (initialValue) => {
  const sub = subject();
  if (initialValue !== undefined) {
    sub(1, initialValue);
  }
  return {
    source: sub,
    next: value => sub(1, value)
  };
};

// Helper to create a stream from a value
export const of = value => {
  const stream = createStream();
  stream.next(value);
  return stream;
};

// Helper to create a stream from multiple values
export const from = values => {
  const stream = createStream();
  values.forEach(value => stream.next(value));
  return stream;
};

// Helper to combine latest values from multiple streams
export const combineLatest = (...streams) => {
  const combined = subject();
  const latest = new Array(streams.length).fill(undefined);
  let initialized = new Array(streams.length).fill(false);
  let completed = 0;

  streams.forEach((stream, i) => {
    stream.source(0, (t, d) => {
      if (t === 1) {
        latest[i] = d;
        initialized[i] = true;
        if (initialized.every(Boolean)) {
          combined(1, latest.slice());
        }
      } else if (t === 2) {
        completed++;
        if (completed === streams.length) {
          combined(2);
        }
      }
    });
  });

  return {
    source: combined,
    next: value => combined(1, value)
  };
};