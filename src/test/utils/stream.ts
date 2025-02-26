import xs, { Stream, Listener } from 'xstream';

export interface StreamTest<T> {
  stream: Stream<T>;
  values: T[];
  complete: boolean;
  error: any;
}

/**
 * Creates a test helper for a stream that collects all emitted values
 */
export function createStreamTest<T>(stream: Stream<T>): StreamTest<T> {
  const test: StreamTest<T> = {
    stream,
    values: [],
    complete: false,
    error: null
  };

  stream.addListener({
    next: (value: T) => test.values.push(value),
    complete: () => { test.complete = true; },
    error: (err: any) => { test.error = err; }
  });

  return test;
}

/**
 * Creates a mock listener for testing streams
 */
export function createMockListener<T>(): jest.Mocked<Listener<T>> {
  return {
    next: jest.fn(),
    error: jest.fn(),
    complete: jest.fn()
  };
}

/**
 * Creates a stream that emits values after specified delays
 */
export function createTimedStream<T>(values: Array<[T, number]>): Stream<T> {
  return xs.create({
    start: (listener) => {
      values.forEach(([value, delay]) => {
        setTimeout(() => listener.next(value), delay);
      });
    },
    stop: () => {}
  });
}

/**
 * Waits for a stream to complete or timeout
 */
export function waitForStream(stream: Stream<any>, timeout = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Stream timeout'));
    }, timeout);

    stream.addListener({
      next: () => {},
      complete: () => {
        clearTimeout(timer);
        resolve();
      },
      error: (err) => {
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}

/**
 * Creates a stream that completes after emitting all values
 */
export function createCompletingStream<T>(values: T[]): Stream<T> {
  return xs.fromArray(values);
}

/**
 * Creates a stream that errors with the given error
 */
export function createErrorStream(error: Error): Stream<never> {
  return xs.throw(error);
}

/**
 * Combines multiple stream tests into one
 */
export function combineStreamTests<T>(tests: StreamTest<T>[]): StreamTest<T[]> {
  const combinedStream = xs.combine(...tests.map(test => test.stream));
  return createStreamTest(combinedStream);
} 