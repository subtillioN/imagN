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
 * @returns {Object} A stream object with a source method
 */
export function createSource(producer) {
  if (typeof producer !== 'function') {
    producer = () => {};
  }

  let talkback;
  let cleanup = null;

  return {
    source(type, data) {
      if (type === START) {
        talkback = data;
        cleanup = producer({
          next: (value) => talkback && talkback(DATA, value),
          error: (err) => talkback && talkback(3, err),
          complete: () => talkback && talkback(END)
        }) || (() => {});
      } else if (type === END) {
        if (cleanup) {
          cleanup();
          cleanup = null;
        }
        talkback = null;
      }
    }
  };
}

/**
 * Maps values in a stream using a transform function
 * @param {Function} transform Transform function for values
 * @returns {Object} A stream object with a source method
 */
export const map = (transform) => source => {
  const sourceFunc = (start, sink) => {
    if (start !== START) return;
    let disposed = false;

    source.source(START, (type, data) => {
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

  return { source: sourceFunc };
};

/**
 * Filters values in a stream
 * @param {Function} predicate Filter condition
 * @returns {Object} A stream object with a source method
 */
export const filter = (predicate) => source => {
  const sourceFunc = (start, sink) => {
    if (start !== START) return;
    let disposed = false;

    source.source(START, (type, data) => {
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

  return { source: sourceFunc };
};

/**
 * Combines multiple streams into one
 * @param {...Object} sources Stream objects to combine
 * @returns {Object} A stream object with a source method
 */
export const combine = (...sources) => {
  const sourceFunc = (start, sink) => {
    if (start !== START) return;
    const n = sources.length;
    const vals = new Array(n);
    const hasVal = new Array(n).fill(false);
    let disposed = false;
    let completed = 0;
    const cleanups = new Array(n);

    const checkComplete = () => {
      if (completed === n && !disposed) {
        disposed = true;
        sink(END);
      }
    };

    sources.forEach((source, i) => {
      if (disposed) return;

      cleanups[i] = source.source(START, (type, data) => {
        if (disposed) return;
        
        if (type === DATA) {
          vals[i] = data;
          hasVal[i] = true;
          if (hasVal.every(Boolean)) {
            sink(DATA, vals.slice());
          }
        } else if (type === END) {
          completed++;
          checkComplete();
        }
      });
    });

    return () => {
      if (!disposed) {
        disposed = true;
        cleanups.forEach(cleanup => cleanup && cleanup());
      }
    };
  };

  return { source: sourceFunc };
};

/**
 * Creates a stream from an array of values
 * @param {Array} values Array of values
 * @returns {Object} A stream object with a source method
 */
export const fromArray = (values) => {
  const sourceFunc = (start, sink) => {
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

  return { source: sourceFunc };
};

/**
 * Creates a stream from a promise
 * @param {Promise} promise Promise to create stream from
 * @returns {Object} A stream object with a source method
 */
export const fromPromise = (promise) => {
  const sourceFunc = (start, sink) => {
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

  return { source: sourceFunc };
};