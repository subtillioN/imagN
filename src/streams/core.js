/**
 * Core stream management module implementing callbags specification
 */

// Stream Types
const START = 0;     // Signal to start the stream
const DATA = 1;      // Signal for data transmission
const END = 2;       // Signal to end the stream

/**
 * Creates a source stream
 * @param {Function} producer Function that produces values
 * @returns {Function} A source callbag
 */
export const createSource = (producer) => (start, sink) => {
  if (start !== START) return;
  let disposed = false;
  let cleanup = null;
  
  sink(START, (type) => {
    if (type === END) {
      disposed = true;
      if (cleanup) cleanup();
    }
  });

  try {
    cleanup = producer({
      next: (data) => !disposed && sink(DATA, data),
      error: (err) => !disposed && sink(END, err),
      complete: () => !disposed && sink(END)
    });
  } catch (error) {
    sink(END, error);
  }

  return () => {
    disposed = true;
    if (cleanup) cleanup();
  };
};

/**
 * Maps values in a stream using a transform function
 * @param {Function} transform Transform function for values
 * @returns {Function} A transformed stream
 */
export const map = (transform) => (source) => (start, sink) => {
  if (start !== START) return;
  let disposed = false;

  source(START, (type, data) => {
    if (disposed) return;
    if (type === DATA) {
      try {
        sink(type, transform(data));
      } catch (error) {
        sink(END, error);
      }
    } else {
      sink(type, data);
    }
  });

  return () => {
    disposed = true;
  };
};

/**
 * Filters values in a stream
 * @param {Function} predicate Filter condition
 * @returns {Function} A filtered stream
 */
export const filter = (predicate) => (source) => (start, sink) => {
  if (start !== START) return;
  let disposed = false;

  source(START, (type, data) => {
    if (disposed) return;
    if (type === DATA) {
      try {
        if (predicate(data)) sink(type, data);
      } catch (error) {
        sink(END, error);
      }
    } else {
      sink(type, data);
    }
  });

  return () => {
    disposed = true;
  };
};

/**
 * Combines multiple streams into one
 * @param {...Function} sources Source streams to combine
 * @returns {Function} A combined stream
 */
export const combine = (...sources) => (start, sink) => {
  if (start !== START) return;
  const n = sources.length;
  const vals = new Array(n);
  const hasVal = new Array(n).fill(false);
  let disposed = false;
  const cleanups = new Array(n);

  sources.forEach((source, i) => {
    if (disposed) return;

    try {
      cleanups[i] = source(START, (type, data) => {
        if (disposed) return;
        if (type === DATA) {
          vals[i] = data;
          hasVal[i] = true;
          if (hasVal.every(Boolean)) {
            sink(DATA, vals.slice());
          }
        } else if (type === END) {
          disposed = true;
          sink(END, data);
        }
      });
    } catch (error) {
      disposed = true;
      sink(END, error);
    }
  });

  return () => {
    disposed = true;
    cleanups.forEach(cleanup => cleanup && cleanup());
  };
};

/**
 * Creates a stream from an array of values
 * @param {Array} values Array of values
 * @returns {Function} A source stream
 */
export const fromArray = (values) => (start, sink) => {
  if (start !== START) return;
  let disposed = false;
  
  try {
    values.forEach(value => {
      if (!disposed) sink(DATA, value);
    });
    if (!disposed) sink(END);
  } catch (error) {
    if (!disposed) sink(END, error);
  }

  return () => {
    disposed = true;
  };
};

/**
 * Creates a stream from a promise
 * @param {Promise} promise Promise to create stream from
 * @returns {Function} A source stream
 */
export const fromPromise = (promise) => (start, sink) => {
  if (start !== START) return;
  let disposed = false;

  promise
    .then(value => {
      if (!disposed) {
        sink(DATA, value);
        sink(END);
      }
    })
    .catch(error => {
      if (!disposed) sink(END, error);
    });

  return () => {
    disposed = true;
  };
};