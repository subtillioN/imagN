import { Source, Callbag } from 'callbag';
import { createSource } from '../../../src/source';
import { createSink } from '../../../src/sink';
import {
  calculateThroughput,
  generatePerformanceReport,
  analyzeLatencyPatterns,
  visualizeDistribution,
  visualizeTimeSeries
} from './metric-helpers';

/**
 * Helper types and functions for testing callbag sources
 * 
 * Note on type casting:
 * We use type casting in the createSink helper to bridge the gap between the callbag
 * specification and TypeScript's type system. The callbag spec expects a sink function
 * that can handle different message types (START, DATA, END) with different payload types,
 * which is difficult to express precisely in TypeScript without complex conditional types.
 * 
 * The @ts-ignore comment is used in createSink because:
 * 1. The sink function needs to handle multiple message types with different payload shapes
 * 2. The callbag type definitions expect specific tuple types that don't match our handler pattern
 * 3. The actual runtime behavior is correct and well-tested
 */

// Message types in the callbag protocol
type MessageType = 0 | 1 | 2; // START | DATA | END
type Talkback = Callbag<never, never>;

/**
 * Safely casts an unknown value to a Talkback function
 * This is safe because we only use it when we know we're receiving a START message
 */
function asTalkback(d: unknown): Talkback {
  return d as Talkback;
}

/**
 * Creates a sink function with a more ergonomic API for testing
 * Instead of dealing with message types directly, you can provide handlers
 * for specific events (start, data, end)
 */
function createSink<T>(handlers: {
  onStart?: (talkback: Talkback) => void;
  onData?: (data: T) => void;
  onEnd?: (error?: any) => void;
}): Callbag<T, never> {
  return (type: number, data?: any) => {
    if (type === 0 && handlers.onStart) handlers.onStart(data as Talkback);
    if (type === 1 && handlers.onData) handlers.onData(data as T);
    if (type === 2 && handlers.onEnd) handlers.onEnd(data);
  };
}

type NextFn<T> = (data: T) => void;
type CompleteFn = () => void;
type ErrorFn = (error: any) => void;

describe('createSource', () => {
  it('should create a source that can emit values', (done) => {
    const values: number[] = [];
    const source = createSource<number>((next, complete) => {
      next(42);
      complete();
    });

    source(0, createSink<number>({
      onData: (data) => values.push(data),
      onEnd: () => {
        expect(values).toEqual([42]);
        done();
      }
    }));
  });

  it('should handle cleanup correctly', () => {
    const cleanup = jest.fn();
    const source = createSource<void>((next, complete) => {
      complete();
      return cleanup;
    });

    source(0, createSink<void>({
      onStart: (talkback) => {
        talkback(2); // End immediately
      }
    }));

    expect(cleanup).toHaveBeenCalled();
  });

  it('should handle errors correctly', (done) => {
    const testError = new Error('test error');
    const source = createSource<never>((next, complete, error) => {
      error(testError);
    });

    source(0, createSink<never>({
      onEnd: (error) => {
        expect(error).toBe(testError);
        done();
      }
    }));
  });

  it('should support multiple values', (done) => {
    const inputValues = [1, 2, 3, 4, 5];
    const receivedValues: number[] = [];
    
    const source = createSource<number>((next, complete) => {
      inputValues.forEach(next);
      complete();
    });

    source(0, createSink<number>({
      onData: (data) => receivedValues.push(data),
      onEnd: () => {
        expect(receivedValues).toEqual(inputValues);
        done();
      }
    }));
  });

  it('should handle asynchronous emissions', (done) => {
    const source = createSource<number>((next, complete) => {
      setTimeout(() => {
        next(1);
        next(2);
        complete();
      }, 0);
    });

    const receivedValues: number[] = [];
    source(0, createSink<number>({
      onData: (data) => receivedValues.push(data),
      onEnd: () => {
        expect(receivedValues).toEqual([1, 2]);
        done();
      }
    }));
  });

  it('should handle cleanup during active emissions', (done) => {
    const cleanup = jest.fn();
    const source = createSource<number>((next, complete) => {
      const interval = setInterval(() => next(1), 100);
      return () => {
        clearInterval(interval);
        cleanup();
      };
    });

    source(0, createSink<number>({
      onStart: (talkback) => {
        setTimeout(() => {
          talkback(2);
          expect(cleanup).toHaveBeenCalled();
          done();
        }, 150);
      }
    }));
  });

  it('should handle immediate unsubscribe', (done) => {
    const cleanup = jest.fn();
    const source = createSource<number>(() => cleanup);

    source(0, createSink<number>({
      onStart: (talkback) => {
        talkback(2); // Immediate unsubscribe
      }
    }));

    setTimeout(() => {
      expect(cleanup).toHaveBeenCalled();
      done();
    }, 0);
  });

  it('should handle errors in producer', (done) => {
    const source = createSource<number>((next, complete, error) => {
      try {
        throw new Error('producer error');
      } catch (e) {
        error(e);
      }
    });

    source(0, createSink<number>({
      onEnd: (error) => {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('producer error');
        done();
      }
    }));
  });

  it('should not emit after complete', (done) => {
    const emitted: number[] = [];
    const source = createSource<number>((next, complete) => {
      next(1);
      complete();
      // These should not be emitted
      next(2);
      next(3);
    });

    source(0, createSink<number>({
      onData: (data) => emitted.push(data),
      onEnd: () => {
        expect(emitted).toEqual([1]);
        done();
      }
    }));
  });

  it('should not emit after error', (done) => {
    const emitted: number[] = [];
    const source = createSource<number>((next, complete, error) => {
      next(1);
      error(new Error('test error'));
      // These should not be emitted
      next(2);
      next(3);
    });

    source(0, createSink<number>({
      onData: (data) => emitted.push(data),
      onEnd: (error) => {
        expect(emitted).toEqual([1]);
        expect(error).toBeInstanceOf(Error);
        done();
      }
    }));
  });

  it('should handle nested source creation', (done) => {
    const cleanup1 = jest.fn();
    const cleanup2 = jest.fn();
    
    const source1 = createSource<number>(() => cleanup1);
    const source2 = createSource<number>(() => {
      let innerTalkback: Talkback;
      source1(0, createSink<number>({
        onStart: (talkback) => {
          innerTalkback = talkback;
        }
      }));
      return () => {
        innerTalkback?.(2);
        cleanup2();
      };
    });

    source2(0, createSink<number>({
      onStart: (talkback) => {
        setTimeout(() => {
          talkback(2);
          expect(cleanup1).toHaveBeenCalled();
          expect(cleanup2).toHaveBeenCalled();
          done();
        }, 0);
      }
    }));
  });

  it('should support multiple subscribers', (done) => {
    const source = createSource<number>((next, complete) => {
      next(1);
      next(2);
      complete();
    });

    const values1: number[] = [];
    const values2: number[] = [];
    let completeCount = 0;

    const checkDone = () => {
      completeCount++;
      if (completeCount === 2) {
        expect(values1).toEqual([1, 2]);
        expect(values2).toEqual([1, 2]);
        done();
      }
    };

    source(0, createSink<number>({
      onData: (data) => values1.push(data),
      onEnd: checkDone
    }));

    source(0, createSink<number>({
      onData: (data) => values2.push(data),
      onEnd: checkDone
    }));
  });

  it('should clean up resources when source errors', (done) => {
    const cleanup = jest.fn();
    const source = createSource<number>((next, complete, error) => {
      const timer = setTimeout(() => {
        next(1);
      }, 100);

      setTimeout(() => {
        error(new Error('test error'));
      }, 50);

      return () => {
        clearTimeout(timer);
        cleanup();
      };
    });

    source(0, createSink<number>({
      onEnd: (error) => {
        expect(error).toBeInstanceOf(Error);
        expect(cleanup).toHaveBeenCalled();
        done();
      }
    }));
  });

  it('should handle synchronous unsubscribe during emission', (done) => {
    const values: number[] = [];
    let unsubscribed = false;
    
    const source = createSource<number>((next) => {
      next(1);
      expect(unsubscribed).toBe(false);
      next(2);
      next(3);
      return () => {
        unsubscribed = true;
      };
    });

    let talkback: Talkback;
    source(0, createSink<number>({
      onStart: (tb) => {
        talkback = tb;
      },
      onData: (data) => {
        values.push(data);
        if (data === 2) {
          talkback(2); // Unsubscribe after receiving 2
        }
      },
      onEnd: () => {
        expect(values).toEqual([1, 2]);
        expect(unsubscribed).toBe(true);
        done();
      }
    }));
  });

  it('should handle reentrant complete calls', (done) => {
    let completed = false;
    const source = createSource<number>((next, complete) => {
      next(1);
      complete();
      // Second complete call should be ignored
      complete();
      next(2); // Should not be emitted
    });

    source(0, createSink<number>({
      onData: (data) => {
        expect(completed).toBe(false);
      },
      onEnd: () => {
        completed = true;
        done();
      }
    }));
  });

  it('should handle race condition between complete and unsubscribe', (done) => {
    const cleanup = jest.fn();
    const values: number[] = [];
    
    const source = createSource<number>((next, complete) => {
      const timer1 = setTimeout(() => next(1), 10);
      const timer2 = setTimeout(() => complete(), 20);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        cleanup();
      };
    });

    let talkback: Talkback;
    source(0, createSink<number>({
      onStart: (tb) => {
        talkback = tb;
        // Unsubscribe around the same time as complete
        setTimeout(() => talkback(2), 20);
      },
      onData: (data) => values.push(data),
      onEnd: () => {
        // Should have cleaned up regardless of whether complete or unsubscribe won
        expect(cleanup).toHaveBeenCalled();
        done();
      }
    }));
  });

  it('should maintain correct order of emissions with nested schedules', (done) => {
    const values: number[] = [];
    const source = createSource<number>((next, complete) => {
      Promise.resolve().then(() => next(1));
      setTimeout(() => next(2), 0);
      queueMicrotask(() => next(3));
      next(4);
    });

    source(0, createSink<number>({
      onData: (data) => {
        values.push(data);
        if (data === 2) {
          expect(values).toEqual([4, 3, 1, 2]);
          done();
        }
      }
    }));
  });

  it('should handle errors during cleanup', (done) => {
    const errorDuringCleanup = new Error('cleanup error');
    const source = createSource<number>(() => {
      return () => {
        throw errorDuringCleanup;
      };
    });

    let unsubscribeError: Error | undefined;
    try {
      source(0, createSink<number>({
        onStart: (talkback) => {
          try {
            talkback(2);
          } catch (e) {
            unsubscribeError = e as Error;
          }
          expect(unsubscribeError).toBe(errorDuringCleanup);
          done();
        }
      }));
    } catch (e) {
      unsubscribeError = e as Error;
    }
  });

  it('should handle recursive emissions', (done) => {
    const values: number[] = [];
    let recursionDepth = 0;
    const maxRecursion = 3;

    const source = createSource<number>((next, complete) => {
      function emitRecursively(value: number) {
        next(value);
        recursionDepth++;
        if (recursionDepth < maxRecursion) {
          emitRecursively(value + 1);
        }
        recursionDepth--;
        if (recursionDepth === 0) {
          complete();
        }
      }

      emitRecursively(1);
    });

    source(0, createSink<number>({
      onData: (data) => values.push(data),
      onEnd: () => {
        expect(values).toEqual([1, 2, 3]);
        done();
      }
    }));
  });

  it('should not leak memory with multiple subscribe/unsubscribe cycles', (done) => {
    let subscriptionCount = 0;
    let cleanupCount = 0;
    
    const source = createSource<number>((next) => {
      subscriptionCount++;
      return () => {
        cleanupCount++;
      };
    });

    // Run multiple subscribe/unsubscribe cycles
    const runCycle = (cycleCount: number) => {
      if (cycleCount === 0) {
        expect(subscriptionCount).toBe(3);
        expect(cleanupCount).toBe(3);
        done();
        return;
      }

      source(0, createSink<number>({
        onStart: (talkback) => {
          // Unsubscribe immediately
          talkback(2);
          // Run next cycle after a small delay
          setTimeout(() => runCycle(cycleCount - 1), 0);
        }
      }));
    };

    runCycle(3);
  });

  it('should handle backpressure with synchronous emissions', (done) => {
    const values: number[] = [];
    let canEmitMore = true;
    
    const source = createSource<number>((next) => {
      // Try to emit values faster than they can be processed
      for (let i = 0; i < 1000 && canEmitMore; i++) {
        next(i);
      }
    });

    let processedCount = 0;
    source(0, createSink<number>({
      onData: (data) => {
        values.push(data);
        processedCount++;
        
        if (processedCount === 5) {
          canEmitMore = false;
          expect(values).toEqual([0, 1, 2, 3, 4]);
          done();
        }
      }
    }));
  });

  it('should propagate errors through nested sources', (done) => {
    const innerError = new Error('inner source error');
    const cleanup = jest.fn();
    
    const innerSource = createSource<number>((next, complete, error) => {
      setTimeout(() => error(innerError), 10);
      return cleanup;
    });

    const outerSource = createSource<number>((next, complete, error) => {
      let innerTalkback: Talkback;
      innerSource(0, createSink<number>({
        onStart: (tb) => {
          innerTalkback = tb;
        },
        onEnd: (err) => {
          error(err); // Propagate inner error to outer source
        }
      }));
      
      return () => {
        innerTalkback?.(2);
      };
    });

    outerSource(0, createSink<number>({
      onEnd: (error) => {
        expect(error).toBe(innerError);
        expect(cleanup).toHaveBeenCalled();
        done();
      }
    }));
  });

  it('should handle concurrent emissions from multiple sources', (done) => {
    const results: Array<{ source: number, value: number }> = [];
    let completedSources = 0;
    
    // Create multiple sources that emit values at different rates
    const createTimedSource = (sourceId: number, interval: number, count: number) => 
      createSource<number>((next, complete) => {
        let emitted = 0;
        const timer = setInterval(() => {
          next(sourceId * 100 + emitted);
          emitted++;
          if (emitted === count) {
            clearInterval(timer);
            complete();
          }
        }, interval);
        
        return () => clearInterval(timer);
      });

    const sources = [
      createTimedSource(1, 10, 3), // Fast source
      createTimedSource(2, 20, 2), // Medium source
      createTimedSource(3, 30, 1)  // Slow source
    ];

    // Subscribe to all sources
    sources.forEach(source => {
      source(0, createSink<number>({
        onData: (data) => {
          results.push({ source: Math.floor(data / 100), value: data % 100 });
        },
        onEnd: () => {
          completedSources++;
          if (completedSources === sources.length) {
            // Verify that we received all values in the correct order per source
            const sourceResults = new Map<number, number[]>();
            results.forEach(({ source, value }) => {
              if (!sourceResults.has(source)) {
                sourceResults.set(source, []);
              }
              sourceResults.get(source)!.push(value);
            });

            // Check each source's values are in order
            sourceResults.forEach((values, source) => {
              const expected = Array.from({ length: 4 - source }, (_, i) => i);
              expect(values).toEqual(expected);
            });
            done();
          }
        }
      }));
    });
  });

  it('should handle errors thrown during emission', (done) => {
    const emissionError = new Error('error during emission');
    const cleanup = jest.fn();
    let errorCaught = false;

    const source = createSource<number>((next, complete, error) => {
      try {
        next(1);
        throw emissionError;
      } catch (e) {
        errorCaught = true;
        error(e);
      }
      return cleanup;
    });

    source(0, createSink<number>({
      onData: (data) => {
        expect(data).toBe(1);
      },
      onEnd: (err) => {
        expect(errorCaught).toBe(true);
        expect(err).toBe(emissionError);
        expect(cleanup).toHaveBeenCalled();
        done();
      }
    }));
  });

  it('should handle delayed start acknowledgment', (done) => {
    const values: number[] = [];
    let started = false;
    
    const source = createSource<number>((next, complete) => {
      // Attempt to emit before start is acknowledged
      next(1); // Should be ignored
      
      const interval = setInterval(() => {
        if (started) {
          next(2);
          clearInterval(interval);
          complete();
        }
      }, 10);

      return () => clearInterval(interval);
    });

    source(0, createSink<number>({
      onStart: (talkback) => {
        // Delay start acknowledgment
        setTimeout(() => {
          started = true;
        }, 50);
      },
      onData: (data) => {
        values.push(data);
      },
      onEnd: () => {
        expect(values).toEqual([2]); // First value should be ignored
        done();
      }
    }));
  });

  it('should handle source termination during async operation', (done) => {
    const cleanup = jest.fn();
    const operationComplete = jest.fn();
    let terminated = false;

    const source = createSource<number>((next, complete) => {
      const asyncOp = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!terminated) {
          next(1);
        }
        operationComplete();
      };

      asyncOp();
      return () => {
        terminated = true;
        cleanup();
      };
    });

    let talkback: Talkback;
    source(0, createSink<number>({
      onStart: (tb) => {
        talkback = tb;
        // Terminate before async operation completes
        setTimeout(() => {
          talkback(2);
          setTimeout(() => {
            expect(cleanup).toHaveBeenCalled();
            expect(operationComplete).toHaveBeenCalled();
            done();
          }, 150);
        }, 50);
      },
      onData: () => {
        // Should not receive any data
        expect(true).toBe(false);
      }
    }));
  });

  it('should handle multiple error scenarios in sequence', (done) => {
    const errors: Error[] = [
      new Error('error 1'),
      new Error('error 2'),
      new Error('error 3')
    ];
    
    let errorIndex = 0;
    const source = createSource<number>((next, complete, error) => {
      const timer = setInterval(() => {
        if (errorIndex < errors.length) {
          error(errors[errorIndex++]);
        }
      }, 10);

      return () => clearInterval(timer);
    });

    const receivedErrors: Error[] = [];
    source(0, createSink<number>({
      onEnd: (err) => {
        receivedErrors.push(err as Error);
        if (receivedErrors.length === 1) {
          // Only the first error should be received
          expect(receivedErrors).toEqual([errors[0]]);
          done();
        }
      }
    }));
  });

  it('should handle reentrant emissions during onData', (done) => {
    const values: number[] = [];
    let reentrantEmission = false;
    
    const source = createSource<number>((next, complete) => {
      next(1);
      if (!reentrantEmission) {
        reentrantEmission = true;
        next(2); // Reentrant emission during first onData
      }
      next(3);
      complete();
    });

    source(0, createSink<number>({
      onData: (data) => {
        values.push(data);
        if (data === 1) {
          // First emission should process all values in order
          expect(reentrantEmission).toBe(false);
        }
      },
      onEnd: () => {
        expect(values).toEqual([1, 2, 3]);
        done();
      }
    }));
  });

  it('should handle error during start handshake', (done) => {
    const startError = new Error('error during start');
    const cleanup = jest.fn();
    let startCalled = false;
    
    const source = createSource<number>((next) => {
      if (!startCalled) {
        startCalled = true;
        throw startError;
      }
      next(1); // Should never be called
      return cleanup;
    });

    try {
      source(0, createSink<number>({
        onData: () => {
          // Should never be called
          expect(true).toBe(false);
        },
        onEnd: () => {
          // Should never be called
          expect(true).toBe(false);
        }
      }));
    } catch (e) {
      expect(e).toBe(startError);
      expect(cleanup).not.toHaveBeenCalled();
      done();
    }
  });

  it('should handle completion during error handling', (done) => {
    const error1 = new Error('first error');
    const values: number[] = [];
    let errorHandled = false;
    
    const source = createSource<number>((next, complete, error) => {
      next(1);
      error(error1);
      complete(); // Should be ignored
      next(2); // Should be ignored
    });

    source(0, createSink<number>({
      onData: (data) => {
        values.push(data);
      },
      onEnd: (err) => {
        if (!errorHandled) {
          errorHandled = true;
          expect(err).toBe(error1);
          expect(values).toEqual([1]);
          done();
        }
      }
    }));
  });

  it('should handle nested emissions with delayed unsubscribe', (done) => {
    const values: number[] = [];
    const cleanups: jest.Mock[] = [];
    let unsubscribed = false;

    function createNestedSource(depth: number): Source<number> {
      return createSource((next, complete) => {
        const cleanup = jest.fn(() => {
          if (depth === 0) {
            unsubscribed = true;
          }
        });
        cleanups.push(cleanup);

        if (depth > 0) {
          const inner = createNestedSource(depth - 1);
          inner(0, createSink<number>({
            onData: (data) => next(data * 10),
            onEnd: complete
          }));
        } else {
          next(1);
          next(2);
          complete();
        }

        return cleanup;
      });
    }

    const source = createNestedSource(2);
    let talkback: Talkback;

    source(0, createSink<number>({
      onStart: (tb) => {
        talkback = tb;
      },
      onData: (data) => {
        values.push(data);
        if (data === 100) {
          setTimeout(() => {
            talkback(2); // Delayed unsubscribe
            expect(values).toEqual([100, 200]);
            expect(unsubscribed).toBe(true);
            expect(cleanups).toHaveLength(3);
            cleanups.forEach(cleanup => {
              expect(cleanup).toHaveBeenCalled();
            });
            done();
          }, 10);
        }
      }
    }));
  });

  it('should handle Promise-based source creation', (done) => {
    const values: number[] = [];
    const delays = [30, 10, 20];
    const expected = [1, 2, 3];
    
    const source = createSource<number>((next, complete) => {
      const promises = delays.map((delay, index) =>
        new Promise<void>(resolve => 
          setTimeout(() => {
            next(expected[index]);
            resolve();
          }, delay)
        )
      );

      Promise.all(promises).then(() => complete());
    });

    source(0, createSink<number>({
      onData: (data) => values.push(data),
      onEnd: () => {
        // Values should arrive in order of resolution, not creation
        expect(values).toEqual([2, 3, 1]);
        done();
      }
    }));
  });

  it('should handle source composition with error boundaries', (done) => {
    const errors: Error[] = [];
    const values: number[] = [];
    
    function createErrorBoundary<T>(source: Source<T>): Source<T> {
      return createSource((next, complete, error) => {
        let innerTalkback: Talkback;
        
        source(0, createSink<T>({
          onStart: (tb) => {
            innerTalkback = tb;
          },
          onData: (data) => {
            try {
              next(data);
            } catch (e) {
              errors.push(e as Error);
            }
          },
          onEnd: (err) => {
            if (err) {
              errors.push(err as Error);
              complete(); // Convert error to completion
            } else {
              complete();
            }
          }
        }));

        return () => innerTalkback?.(2);
      });
    }

    const errorSource = createSource<number>((next, complete, error) => {
      next(1);
      error(new Error('test error'));
      next(2); // Should be ignored
    });

    const protectedSource = createErrorBoundary(errorSource);

    protectedSource(0, createSink<number>({
      onData: (data) => values.push(data),
      onEnd: () => {
        expect(values).toEqual([1]);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('test error');
        done();
      }
    }));
  });

  it('should handle source replay behavior', (done) => {
    const values: number[] = [];
    const replayValues: number[] = [];
    let completed = false;
    
    // Create a source that can be replayed
    function createReplaySource<T>(source: Source<T>): Source<T> {
      const recorded: { type: 'data' | 'complete' | 'error', value?: T | Error }[] = [];
      let hasRecorded = false;
      
      return createSource((next, complete, error) => {
        if (hasRecorded) {
          // Replay recorded values
          recorded.forEach(event => {
            switch (event.type) {
              case 'data':
                next(event.value as T);
                break;
              case 'complete':
                complete();
                break;
              case 'error':
                error(event.value as Error);
                break;
            }
          });
          return;
        }

        let innerTalkback: Talkback;
        source(0, createSink<T>({
          onStart: (tb) => {
            innerTalkback = tb;
          },
          onData: (data) => {
            recorded.push({ type: 'data', value: data });
            next(data);
          },
          onEnd: (err) => {
            if (err) {
              recorded.push({ type: 'error', value: err });
              error(err);
            } else {
              recorded.push({ type: 'complete' });
              complete();
            }
            hasRecorded = true;
          }
        }));

        return () => innerTalkback?.(2);
      });
    }

    const originalSource = createSource<number>((next, complete) => {
      next(1);
      next(2);
      complete();
    });

    const replayableSource = createReplaySource(originalSource);

    // First subscription
    replayableSource(0, createSink<number>({
      onData: (data) => values.push(data),
      onEnd: () => {
        completed = true;
        
        // Second subscription should get replayed values
        replayableSource(0, createSink<number>({
          onData: (data) => replayValues.push(data),
          onEnd: () => {
            expect(values).toEqual([1, 2]);
            expect(replayValues).toEqual([1, 2]);
            done();
          }
        }));
      }
    }));
  });

  it('should handle source composition with error handling and cleanup', (done) => {
    const cleanups: jest.Mock[] = [jest.fn(), jest.fn()];
    const values: number[] = [];
    const error = new Error('test error');

    // Create a source that emits values then errors
    const source1 = createSource<number>((next, complete, error) => {
      next(1);
      next(2);
      setTimeout(() => error(error), 10);
      return cleanups[0];
    });

    // Create a source that transforms values
    const source2 = createSource<number>((next, complete, error) => {
      let innerTalkback: Talkback;
      
      source1(0, createSink<number>({
        onStart: (tb) => {
          innerTalkback = tb;
        },
        onData: (data) => next(data * 10),
        onEnd: error // Propagate error
      }));

      return () => {
        innerTalkback?.(2);
        cleanups[1]();
      };
    });

    source2(0, createSink<number>({
      onData: (data) => values.push(data),
      onEnd: (err) => {
        expect(values).toEqual([10, 20]);
        expect(err).toBe(error);
        expect(cleanups[0]).toHaveBeenCalled();
        expect(cleanups[1]).toHaveBeenCalled();
        done();
      }
    }));
  });

  it('should handle rate limiting with time-based throttling', (done) => {
    const values: number[] = [];
    const minInterval = 50; // Minimum time between emissions
    let lastEmissionTime = 0;
    
    const source = createSource<number>((next, complete) => {
      // Attempt rapid emissions
      const attemptEmissions = async () => {
        for (let i = 0; i < 5; i++) {
          const now = Date.now();
          const timeSinceLastEmission = now - lastEmissionTime;
          
          if (timeSinceLastEmission >= minInterval) {
            next(i);
            lastEmissionTime = now;
          } else {
            // Wait for the minimum interval
            await new Promise(resolve => 
              setTimeout(resolve, minInterval - timeSinceLastEmission)
            );
            next(i);
            lastEmissionTime = Date.now();
          }
        }
        complete();
      };

      attemptEmissions();
    });

    const startTime = Date.now();
    source(0, createSink<number>({
      onData: (data) => {
        values.push(data);
        const timeSinceStart = Date.now() - startTime;
        // Each value should be emitted at least minInterval ms after the previous
        if (values.length > 1) {
          const expectedMinTime = (values.length - 1) * minInterval;
          expect(timeSinceStart).toBeGreaterThanOrEqual(expectedMinTime);
        }
      },
      onEnd: () => {
        expect(values).toEqual([0, 1, 2, 3, 4]);
        done();
      }
    }));
  });

  it('should handle scheduling strategies correctly', (done) => {
    const values: string[] = [];
    const expectedOrder = [
      'sync',      // Synchronous execution
      'microtask', // queueMicrotask
      'promise',   // Promise.resolve().then()
      'timeout'    // setTimeout
    ];
    
    const source = createSource<string>((next, complete) => {
      // Schedule emissions using different strategies
      setTimeout(() => {
        next('timeout');
        complete();
      }, 0);

      Promise.resolve().then(() => next('promise'));
      queueMicrotask(() => next('microtask'));
      next('sync');
    });

    source(0, createSink<string>({
      onData: (data) => {
        values.push(data);
      },
      onEnd: () => {
        expect(values).toEqual(expectedOrder);
        done();
      }
    }));
  });

  it('should handle circular dependencies safely', (done) => {
    type Message = { from: number; data: number };
    const values: Message[] = [];
    let source1Talkback: Talkback;
    let source2Talkback: Talkback;
    
    // Create two sources that communicate with each other
    const source1 = createSource<Message>((next, complete) => {
      // Start the cycle
      next({ from: 1, data: 0 });
      
      return () => source2Talkback?.(2);
    });

    const source2 = createSource<Message>((next, complete) => {
      // Handle messages from source1
      const handleMessage = (msg: Message) => {
        if (msg.from === 1 && msg.data < 3) {
          next({ from: 2, data: msg.data + 1 });
        } else if (msg.data >= 3) {
          complete();
        }
      };

      return () => source1Talkback?.(2);
    });

    // Connect the sources
    source1(0, createSink<Message>({
      onStart: (tb) => source1Talkback = tb,
      onData: (msg) => {
        values.push(msg);
        source2(0, createSink<Message>({
          onStart: (tb) => source2Talkback = tb,
          onData: (msg) => {
            values.push(msg);
            if (msg.from === 1 && msg.data < 3) {
              source2(0, createSink<Message>({
                onData: (data) => values.push(data)
              }));
            }
          }
        }));
      },
      onEnd: () => {
        expect(values).toEqual([
          { from: 1, data: 0 },
          { from: 2, data: 1 },
          { from: 1, data: 2 },
          { from: 2, data: 3 }
        ]);
        done();
      }
    }));
  });

  it('should handle large numbers of emissions efficiently', (done) => {
    const COUNT = 100000;
    let emittedCount = 0;
    let receivedCount = 0;
    const startTime = Date.now();
    
    const source = createSource<number>((next, complete) => {
      // Emit in chunks to avoid blocking
      function emitChunk(start: number) {
        const end = Math.min(start + 1000, COUNT);
        for (let i = start; i < end; i++) {
          next(i);
          emittedCount++;
        }
        if (end < COUNT) {
          queueMicrotask(() => emitChunk(end));
        } else {
          complete();
        }
      }
      emitChunk(0);
    });

    source(0, createSink<number>({
      onData: () => {
        receivedCount++;
      },
      onEnd: () => {
        const duration = Date.now() - startTime;
        expect(emittedCount).toBe(COUNT);
        expect(receivedCount).toBe(COUNT);
        // Should process at least 10k emissions per second
        expect(duration).toBeLessThan(COUNT / 10);
        done();
      }
    }));
  });

  it('should handle exponential backoff retry pattern', (done) => {
    const maxRetries = 3;
    const baseDelay = 10;
    const errors: Error[] = [];
    const attempts: number[] = [];
    
    const source = createSource<number>((next, complete, error) => {
      function attemptWithRetry(attempt: number): Promise<void> {
        return new Promise((resolve, reject) => {
          attempts.push(attempt);
          
          if (attempt < maxRetries) {
            const err = new Error(`Attempt ${attempt} failed`);
            errors.push(err);
            
            // Exponential backoff
            const delay = baseDelay * Math.pow(2, attempt);
            setTimeout(() => {
              resolve(attemptWithRetry(attempt + 1));
            }, delay);
          } else {
            next(attempt);
            complete();
            resolve();
          }
        });
      }

      attemptWithRetry(0);
    });

    const startTime = Date.now();
    source(0, createSink<number>({
      onData: (data) => {
        const totalTime = Date.now() - startTime;
        // Should have waited for exponential backoff
        const expectedMinTime = baseDelay * (Math.pow(2, maxRetries) - 1);
        expect(totalTime).toBeGreaterThanOrEqual(expectedMinTime);
        expect(data).toBe(maxRetries);
        expect(attempts).toEqual([0, 1, 2, 3]);
        expect(errors).toHaveLength(maxRetries);
      },
      onEnd: () => done()
    }));
  });

  it('should handle complex composition with filtering and mapping', (done) => {
    function createFilterMap<T, R>(
      predicate: (value: T) => boolean,
      transform: (value: T) => R
    ): (source: Source<T>) => Source<R> {
      return (source) => createSource((next, complete, error) => {
        let innerTalkback: Talkback;
        let completed = false;
        
        source(0, createSink<T>({
          onStart: (tb) => {
            innerTalkback = tb;
          },
          onData: (value) => {
            if (!completed && predicate(value)) {
              try {
                next(transform(value));
              } catch (e) {
                error(e);
              }
            }
          },
          onEnd: (err) => {
            completed = true;
            if (err) error(err);
            else complete();
          }
        }));

        return () => {
          completed = true;
          innerTalkback?.(2);
        };
      });
    }

    const values: number[] = [];
    const source = createSource<number>((next) => {
      [1, 2, 3, 4, 5, 6].forEach(next);
    });

    // Create a pipeline of operations
    const isEven = (n: number) => n % 2 === 0;
    const double = (n: number) => n * 2;
    const addTen = (n: number) => n + 10;
    
    const pipeline = (source: Source<number>) =>
      createFilterMap(isEven, double)(source);

    const enhancedSource = pipeline(source);

    enhancedSource(0, createSink<number>({
      onData: (value) => {
        values.push(value);
      },
      onEnd: () => {
        // Should have filtered even numbers and doubled them
        expect(values).toEqual([4, 8, 12]);
        done();
      }
    }));
  });

  it('should handle debouncing of rapid emissions', (done) => {
    const values: number[] = [];
    const debounceTime = 50;
    let lastTimeout: NodeJS.Timeout;
    
    const source = createSource<number>((next, complete) => {
      const debouncedNext = (value: number) => {
        clearTimeout(lastTimeout);
        lastTimeout = setTimeout(() => {
          next(value);
        }, debounceTime);
      };

      // Rapid emissions that should be debounced
      debouncedNext(1);
      debouncedNext(2);
      debouncedNext(3);
      
      setTimeout(() => {
        // Another burst after a delay
        debouncedNext(4);
        debouncedNext(5);
        
        // Complete after all possible debounced emissions
        setTimeout(() => {
          clearTimeout(lastTimeout);
          complete();
        }, debounceTime * 2);
      }, debounceTime * 2);

      return () => clearTimeout(lastTimeout);
    });

    const startTime = Date.now();
    source(0, createSink<number>({
      onData: (data) => {
        values.push(data);
        const timeSinceStart = Date.now() - startTime;
        // Each value should be at least debounceTime after the previous
        if (values.length > 1) {
          const timeSinceLastValue = timeSinceStart - (values.length - 1) * debounceTime;
          expect(timeSinceLastValue).toBeGreaterThanOrEqual(0);
        }
      },
      onEnd: () => {
        // Should only receive the last value from each burst
        expect(values).toEqual([3, 5]);
        done();
      }
    }));
  });

  it('should handle shared state between multiple subscribers', (done) => {
    interface SharedState {
      value: number;
      subscribers: Set<(value: number) => void>;
    }

    const state: SharedState = {
      value: 0,
      subscribers: new Set()
    };

    // Create a source that shares state between subscribers
    const createSharedSource = () => createSource<number>((next, complete) => {
      const notify = (value: number) => next(value);
      state.subscribers.add(notify);
      next(state.value); // Emit current value immediately

      return () => {
        state.subscribers.delete(notify);
      };
    });

    const values1: number[] = [];
    const values2: number[] = [];
    let source1Complete = false;
    let source2Complete = false;

    // Create two subscribers
    const source1 = createSharedSource();
    const source2 = createSharedSource();

    // Helper to update state and notify subscribers
    const updateState = (newValue: number) => {
      state.value = newValue;
      state.subscribers.forEach(notify => notify(newValue));
    };

    source1(0, createSink<number>({
      onData: (data) => values1.push(data),
      onEnd: () => {
        source1Complete = true;
        checkDone();
      }
    }));

    source2(0, createSink<number>({
      onData: (data) => values2.push(data),
      onEnd: () => {
        source2Complete = true;
        checkDone();
      }
    }));

    // Update state multiple times
    setTimeout(() => updateState(1), 10);
    setTimeout(() => updateState(2), 20);
    setTimeout(() => {
      updateState(3);
      
      // Complete both sources
      source1(2);
      source2(2);
    }, 30);

    function checkDone() {
      if (source1Complete && source2Complete) {
        expect(values1).toEqual([0, 1, 2, 3]);
        expect(values2).toEqual([0, 1, 2, 3]);
        expect(state.subscribers.size).toBe(0); // All subscribers cleaned up
        done();
      }
    }
  });

  it('should detect memory leaks using WeakRef', (done) => {
    let weakRef: WeakRef<object> | undefined;
    let cleanup = jest.fn();
    
    const runTest = () => {
      const obj = { data: new Array(1000).fill(0) }; // Create a significant object
      weakRef = new WeakRef(obj);
      
      const source = createSource<typeof obj>((next, complete) => {
        next(obj);
        complete();
        return cleanup;
      });

      let talkback: Talkback;
      source(0, createSink<typeof obj>({
        onStart: (tb) => {
          talkback = tb;
        },
        onData: () => {
          // Immediately unsubscribe after receiving data
          talkback(2);
        }
      }));
    };

    runTest();

    // Helper function to check if object is garbage collected
    const checkGarbageCollection = () => {
      // Try to force garbage collection by allocating large arrays
      const arrays: number[][] = [];
      try {
        while (true) {
          arrays.push(new Array(1000000).fill(0));
        }
      } catch (e) {
        // Out of memory error expected
      }
      arrays.length = 0; // Clear the arrays

      if (!weakRef?.deref()) {
        // Object has been garbage collected
        expect(cleanup).toHaveBeenCalled();
        done();
      } else {
        // Check again after a delay
        setTimeout(checkGarbageCollection, 100);
      }
    };

    // Start checking for garbage collection
    setTimeout(checkGarbageCollection, 100);
  });

  it('should handle concurrent operation limits', (done) => {
    const maxConcurrent = 2;
    let activeOperations = 0;
    const completedOperations: number[] = [];
    
    const source = createSource<number>((next, complete) => {
      const operations = [1, 2, 3, 4, 5];
      const pending = [...operations];
      const inProgress = new Set<number>();

      function tryStartOperation() {
        while (pending.length > 0 && inProgress.size < maxConcurrent) {
          const op = pending.shift()!;
          inProgress.add(op);
          activeOperations++;
          
          // Simulate async operation with random duration
          setTimeout(() => {
            expect(activeOperations).toBeLessThanOrEqual(maxConcurrent);
            next(op);
            inProgress.delete(op);
            activeOperations--;
            completedOperations.push(op);
            
            if (inProgress.size === 0 && pending.length === 0) {
              complete();
            } else {
              tryStartOperation();
            }
          }, Math.random() * 50);
        }
      }

      tryStartOperation();
    });

    source(0, createSink<number>({
      onData: () => {
        expect(activeOperations).toBeLessThanOrEqual(maxConcurrent);
      },
      onEnd: () => {
        expect(completedOperations.length).toBe(5);
        done();
      }
    }));
  });

  it('should handle custom scheduling with priorities', (done) => {
    interface Task {
      id: number;
      priority: number;
      value: number;
    }

    const tasks: Task[] = [
      { id: 1, priority: 3, value: 100 },
      { id: 2, priority: 1, value: 200 },
      { id: 3, priority: 2, value: 300 },
      { id: 4, priority: 1, value: 400 },
      { id: 5, priority: 3, value: 500 }
    ];

    const executedTasks: number[] = [];
    const source = createSource<number>((next, complete) => {
      const queue = [...tasks].sort((a, b) => b.priority - a.priority);
      let currentPriority = queue[0].priority;
      let timeSlice = 0;

      function executeNextTask() {
        if (queue.length === 0) {
          complete();
          return;
        }

        // Switch priority levels periodically
        if (timeSlice % 2 === 0) {
          currentPriority = queue[0].priority;
        }

        // Execute tasks at current priority level
        const taskIndex = queue.findIndex(t => t.priority === currentPriority);
        if (taskIndex !== -1) {
          const task = queue.splice(taskIndex, 1)[0];
          executedTasks.push(task.id);
          next(task.value);
        }

        timeSlice++;
        if (queue.length > 0) {
          setTimeout(executeNextTask, 10);
        } else {
          complete();
        }
      }

      executeNextTask();
    });

    source(0, createSink<number>({
      onEnd: () => {
        // High priority tasks (3) should be executed first
        expect(executedTasks[0]).toBe(1);
        expect(executedTasks[1]).toBe(5);
        done();
      }
    }));
  });

  it('should handle resource pooling', (done) => {
    interface Resource {
      id: number;
      inUse: boolean;
    }

    const poolSize = 3;
    const resourcePool: Resource[] = Array.from(
      { length: poolSize },
      (_, i) => ({ id: i + 1, inUse: false })
    );

    const operations: number[] = [];
    const resourceUsage = new Map<number, number>();
    
    const source = createSource<number>((next, complete) => {
      let completedOps = 0;
      const totalOps = 10;

      function acquireResource(): Resource | undefined {
        return resourcePool.find(r => !r.inUse);
      }

      function releaseResource(resource: Resource) {
        resource.inUse = false;
      }

      function executeOperation() {
        const resource = acquireResource();
        if (!resource) {
          setTimeout(executeOperation, 10);
          return;
        }

        resource.inUse = true;
        const usageCount = resourceUsage.get(resource.id) || 0;
        resourceUsage.set(resource.id, usageCount + 1);

        // Simulate operation with resource
        setTimeout(() => {
          operations.push(resource.id);
          next(resource.id);
          releaseResource(resource);
          completedOps++;

          if (completedOps === totalOps) {
            complete();
          } else if (completedOps < totalOps) {
            executeOperation();
          }
        }, Math.random() * 30);
      }

      // Start multiple operations
      for (let i = 0; i < poolSize; i++) {
        executeOperation();
      }
    });

    source(0, createSink<number>({
      onEnd: () => {
        expect(operations.length).toBe(10);
        // Check that all resources were used
        resourceUsage.forEach((count) => {
          expect(count).toBeGreaterThan(0);
        });
        // Verify pool size was never exceeded
        const maxConcurrent = Math.max(
          ...Array.from({ length: operations.length - poolSize + 1 }, 
            (_, i) => new Set(operations.slice(i, i + poolSize)).size
          )
        );
        expect(maxConcurrent).toBeLessThanOrEqual(poolSize);
        done();
      }
    }));
  });

  it('should ensure fair distribution among multiple subscribers', (done) => {
    const subscriberCount = 3;
    const valuesPerSubscriber = new Map<number, number[]>();
    let completedSubscribers = 0;
    
    const source = createSource<number>((next, complete) => {
      let count = 0;
      const interval = setInterval(() => {
        next(count++);
        if (count >= 10) {
          clearInterval(interval);
          complete();
        }
      }, 10);
      return () => clearInterval(interval);
    });

    // Create multiple subscribers with different processing speeds
    for (let i = 0; i < subscriberCount; i++) {
      valuesPerSubscriber.set(i, []);
      source(0, createSink<number>({
        onData: (data) => {
          // Simulate different processing speeds
          setTimeout(() => {
            valuesPerSubscriber.get(i)!.push(data);
          }, Math.random() * 20);
        },
        onEnd: () => {
          completedSubscribers++;
          if (completedSubscribers === subscriberCount) {
            // Verify fair distribution
            const lengths = Array.from(valuesPerSubscriber.values()).map(v => v.length);
            const maxDiff = Math.max(...lengths) - Math.min(...lengths);
            expect(maxDiff).toBeLessThanOrEqual(1); // Allow at most 1 value difference
            done();
          }
        }
      }));
    }
  });

  it('should balance load between consumers with backpressure', (done) => {
    const consumers = 2;
    const processedCounts = new Array(consumers).fill(0);
    const processingTimes = [10, 50]; // Different processing speeds
    let completedConsumers = 0;
    
    const source = createSource<number>((next, complete) => {
      let value = 0;
      const maxValue = 20;
      
      function tryEmit() {
        if (value < maxValue) {
          next(value++);
          setTimeout(tryEmit, 5); // Fast emission rate
        } else {
          complete();
        }
      }
      
      tryEmit();
    });

    // Create consumers with different processing speeds
    for (let i = 0; i < consumers; i++) {
      source(0, createSink<number>({
        onData: (data) => {
          // Simulate processing with different speeds
          setTimeout(() => {
            processedCounts[i]++;
          }, processingTimes[i]);
        },
        onEnd: () => {
          completedConsumers++;
          if (completedConsumers === consumers) {
            // Verify slower consumer processed fewer items
            expect(processedCounts[0]).toBeGreaterThan(processedCounts[1]);
            // But both consumers should have processed some items
            processedCounts.forEach(count => {
              expect(count).toBeGreaterThan(0);
            });
            done();
          }
        }
      }));
    }
  });

  it('should prevent deadlocks with competing resources', (done) => {
    interface Resource {
      id: number;
      locked: boolean;
    }
    
    const resources: Resource[] = [
      { id: 1, locked: false },
      { id: 2, locked: false }
    ];
    
    const acquiredResources = new Set<number>();
    const completedOperations: number[] = [];

    function acquireResource(id: number): Promise<Resource> {
      const resource = resources.find(r => r.id === id)!;
      return new Promise(resolve => {
        function tryAcquire() {
          if (!resource.locked) {
            resource.locked = true;
            acquiredResources.add(id);
            resolve(resource);
          } else {
            setTimeout(tryAcquire, 10);
          }
        }
        tryAcquire();
      });
    }

    function releaseResource(id: number) {
      const resource = resources.find(r => r.id === id)!;
      resource.locked = false;
      acquiredResources.delete(id);
    }

    // Create two sources that need both resources but try to acquire them in opposite orders
    const source1 = createSource<number>((next, complete) => {
      async function run() {
        await acquireResource(1);
        await acquireResource(2);
        next(1);
        releaseResource(2);
        releaseResource(1);
        complete();
      }
      run();
    });

    const source2 = createSource<number>((next, complete) => {
      async function run() {
        await acquireResource(2);
        await acquireResource(1);
        next(2);
        releaseResource(1);
        releaseResource(2);
        complete();
      }
      run();
    });

    let completedCount = 0;
    [source1, source2].forEach(source => {
      source(0, createSink<number>({
        onData: (data) => completedOperations.push(data),
        onEnd: () => {
          completedCount++;
          if (completedCount === 2) {
            expect(completedOperations.length).toBe(2);
            expect(acquiredResources.size).toBe(0); // All resources released
            done();
          }
        }
      }));
    });
  });

  it('should handle dynamic resource pool with auto-scaling', (done) => {
    interface PoolResource {
      id: number;
      busy: boolean;
    }

    const initialPoolSize = 2;
    const maxPoolSize = 4;
    let currentPoolSize = initialPoolSize;
    const pool: PoolResource[] = Array.from(
      { length: initialPoolSize },
      (_, i) => ({ id: i + 1, busy: false })
    );

    const metrics = {
      waitTime: 0,
      utilizationRate: 0,
      scaleUpCount: 0,
      scaleDownCount: 0
    };

    function scalePool(utilization: number) {
      if (utilization > 0.8 && currentPoolSize < maxPoolSize) {
        pool.push({ id: currentPoolSize++, busy: false });
        metrics.scaleUpCount++;
      } else if (utilization < 0.3 && currentPoolSize > initialPoolSize) {
        pool.pop();
        currentPoolSize--;
        metrics.scaleDownCount++;
      }
    }

    const source = createSource<number>((next, complete) => {
      const operations = Array.from({ length: 10 }, (_, i) => i);
      let completed = 0;
      let totalWaitTime = 0;
      let measurementStart = Date.now();

      function processNextTask() {
        if (operations.length === 0) {
          if (completed === 10) {
            metrics.waitTime = totalWaitTime / 10;
            metrics.utilizationRate = pool.filter(r => r.busy).length / pool.length;
            complete();
          }
          return;
        }

        const freeResource = pool.find(r => !r.busy);
        if (freeResource) {
          freeResource.busy = true;
          const waitTime = Date.now() - measurementStart;
          totalWaitTime += waitTime;
          
          const op = operations.shift()!;
          setTimeout(() => {
            next(op);
            freeResource.busy = false;
            completed++;
            
            const utilization = pool.filter(r => r.busy).length / pool.length;
            scalePool(utilization);
            
            measurementStart = Date.now();
            processNextTask();
          }, Math.random() * 50);
        } else {
          setTimeout(processNextTask, 10);
        }
      }

      // Start multiple operations
      Array.from({ length: Math.min(operations.length, currentPoolSize) }).forEach(processNextTask);
    });

    source(0, createSink<number>({
      onEnd: () => {
        expect(metrics.scaleUpCount + metrics.scaleDownCount).toBeGreaterThan(0);
        expect(metrics.utilizationRate).toBeLessThanOrEqual(1);
        expect(metrics.waitTime).toBeGreaterThanOrEqual(0);
        done();
      }
    }));
  });

  it('should handle priority scheduling with preemption', (done) => {
    interface Task {
      id: number;
      priority: number;
      startTime?: number;
      endTime?: number;
    }

    const tasks: Task[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      priority: Math.floor(i / 3) + 1  // Priorities 1-3
    }));

    const metrics = {
      preemptions: 0,
      completedTasks: [] as number[],
      avgWaitTime: new Map<number, number>()
    };

    const source = createSource<Task>((next, complete) => {
      const runningTasks = new Set<number>();
      const taskQueue = [...tasks];
      let currentTime = Date.now();

      function preemptLowerPriorityTask(newTask: Task): boolean {
        const runningTask = tasks.find(t => 
          runningTasks.has(t.id) && t.priority > newTask.priority
        );
        if (runningTask) {
          runningTasks.delete(runningTask.id);
          taskQueue.unshift(runningTask);
          metrics.preemptions++;
          return true;
        }
        return false;
      }

      function processNextTask() {
        if (taskQueue.length === 0 && runningTasks.size === 0) {
          complete();
          return;
        }

        const availableSlots = 2 - runningTasks.size;
        if (availableSlots > 0 && taskQueue.length > 0) {
          const nextTask = taskQueue.shift()!;
          const canSchedule = runningTasks.size < 2 || preemptLowerPriorityTask(nextTask);
          
          if (canSchedule) {
            nextTask.startTime = Date.now();
            runningTasks.add(nextTask.id);
            
            setTimeout(() => {
              nextTask.endTime = Date.now();
              runningTasks.delete(nextTask.id);
              next(nextTask);
              metrics.completedTasks.push(nextTask.id);
              
              // Calculate wait time for priority level
              const waitTime = nextTask.startTime! - currentTime;
              const prevAvg = metrics.avgWaitTime.get(nextTask.priority) || 0;
              const count = metrics.completedTasks.filter(id => 
                tasks[id].priority === nextTask.priority
              ).length;
              metrics.avgWaitTime.set(
                nextTask.priority,
                (prevAvg * (count - 1) + waitTime) / count
              );
              
              processNextTask();
            }, Math.random() * 50);
          }
        }
        
        setTimeout(processNextTask, 10);
      }

      processNextTask();
    });

    source(0, createSink<Task>({
      onEnd: () => {
        // Higher priority tasks should have lower average wait times
        const waitTimes = Array.from(metrics.avgWaitTime.entries());
        waitTimes.sort((a, b) => a[0] - b[0]);
        for (let i = 1; i < waitTimes.length; i++) {
          expect(waitTimes[i][1]).toBeGreaterThanOrEqual(waitTimes[i-1][1]);
        }
        expect(metrics.preemptions).toBeGreaterThan(0);
        done();
      }
    }));
  });

  it('should handle adaptive backpressure with flow control', (done) => {
    const windowSize = 5;
    const metrics = {
      emissionRates: [] as number[],
      processingTimes: [] as number[],
      backpressureEvents: 0
    };

    const source = createSource<number>((next, complete) => {
      let emitted = 0;
      let processed = 0;
      let lastEmissionTime = Date.now();
      let processingStartTime = Date.now();
      const window: number[] = [];

      function calculateBackpressure() {
        const currentRate = window.length / 
          ((Date.now() - processingStartTime) / 1000);
        const avgProcessingTime = metrics.processingTimes.length > 0 ?
          metrics.processingTimes.reduce((a, b) => a + b) / 
          metrics.processingTimes.length : 0;
        
        return Math.max(0, Math.min(100,
          (currentRate * avgProcessingTime - windowSize) * 10
        ));
      }

      function tryEmit() {
        if (emitted >= 20) {
          complete();
          return;
        }

        const backpressure = calculateBackpressure();
        if (backpressure > 80) {
          metrics.backpressureEvents++;
          setTimeout(tryEmit, backpressure);
          return;
        }

        const now = Date.now();
        const timeSinceLastEmission = now - lastEmissionTime;
        metrics.emissionRates.push(1000 / timeSinceLastEmission);
        lastEmissionTime = now;

        window.push(emitted);
        next(emitted++);
        
        const delay = Math.max(10, backpressure);
        setTimeout(tryEmit, delay);
      }

      function processWindow() {
        if (window.length > 0) {
          const startProcess = Date.now();
          const value = window.shift()!;
          
          setTimeout(() => {
            processed++;
            metrics.processingTimes.push(Date.now() - startProcess);
            processWindow();
          }, Math.random() * 50 + 10);
        } else if (processed < 20) {
          setTimeout(processWindow, 10);
        }
      }

      tryEmit();
      processWindow();
    });

    source(0, createSink<number>({
      onEnd: () => {
        // Verify adaptive behavior
        expect(metrics.backpressureEvents).toBeGreaterThan(0);
        expect(metrics.emissionRates.length).toBeGreaterThan(0);
        
        // Emission rates should show adaptation
        const rateChanges = metrics.emissionRates.map((rate, i, arr) => 
          i > 0 ? Math.abs(rate - arr[i-1]) : 0
        ).filter(change => change > 0);
        
        expect(rateChanges.length).toBeGreaterThan(0);
        done();
      }
    }));
  });

  it('should handle fault tolerance with circuit breaking', (done) => {
    interface CircuitState {
      failures: number;
      lastFailure: number;
      isOpen: boolean;
      halfOpenAttempts: number;
    }

    const circuit: CircuitState = {
      failures: 0,
      lastFailure: 0,
      isOpen: false,
      halfOpenAttempts: 0
    };

    const FAILURE_THRESHOLD = 3;
    const RESET_TIMEOUT = 100;
    const MAX_HALF_OPEN_ATTEMPTS = 2;

    function shouldAttemptOperation(): boolean {
      const now = Date.now();
      
      if (circuit.isOpen) {
        if (now - circuit.lastFailure > RESET_TIMEOUT) {
          // Try half-open state
          circuit.isOpen = false;
          circuit.halfOpenAttempts++;
          return circuit.halfOpenAttempts <= MAX_HALF_OPEN_ATTEMPTS;
        }
        return false;
      }
      return true;
    }

    function recordFailure() {
      circuit.failures++;
      circuit.lastFailure = Date.now();
      if (circuit.failures >= FAILURE_THRESHOLD) {
        circuit.isOpen = true;
      }
    }

    function recordSuccess() {
      circuit.failures = 0;
      circuit.halfOpenAttempts = 0;
      circuit.isOpen = false;
    }

    const metrics = {
      attempts: 0,
      successes: 0,
      failures: 0,
      circuitBreaks: 0,
      recoveries: 0
    };

    const source = createSource<number>((next, complete) => {
      let value = 0;
      const maxAttempts = 15;

      function attemptOperation() {
        if (value >= maxAttempts) {
          complete();
          return;
        }

        if (!shouldAttemptOperation()) {
          metrics.circuitBreaks++;
          setTimeout(attemptOperation, 20);
          return;
        }

        metrics.attempts++;
        // Simulate failure pattern: fail on every third attempt
        const shouldFail = value % 3 === 2;

        if (shouldFail) {
          metrics.failures++;
          recordFailure();
          value++;
          setTimeout(attemptOperation, 20);
        } else {
          metrics.successes++;
          recordSuccess();
          next(value++);
          setTimeout(attemptOperation, 20);
        }
      }

      attemptOperation();
    });

    source(0, createSink<number>({
      onEnd: () => {
        expect(metrics.circuitBreaks).toBeGreaterThan(0);
        expect(metrics.successes).toBeGreaterThan(0);
        expect(metrics.failures).toBeGreaterThan(0);
        expect(circuit.failures).toBeLessThan(FAILURE_THRESHOLD);
        done();
      }
    }));
  });

  it('should handle load shedding with QoS levels', (done) => {
    interface Request {
      id: number;
      priority: 'high' | 'medium' | 'low';
      size: number;
    }

    const metrics = {
      processed: new Map<string, number>(),
      dropped: new Map<string, number>(),
      totalLatency: new Map<string, number>()
    };

    const LOAD_THRESHOLD = 0.8;
    const MAX_QUEUE_SIZE = 10;
    const priorities = ['high', 'medium', 'low'] as const;

    function updateMetrics(type: 'processed' | 'dropped', priority: string) {
      const map = type === 'processed' ? metrics.processed : metrics.dropped;
      map.set(priority, (map.get(priority) || 0) + 1);
    }

    const source = createSource<Request>((next, complete) => {
      const queue: Request[] = [];
      let currentLoad = 0;
      let processed = 0;
      const totalRequests = 20;

      function calculateLoad() {
        return queue.reduce((load, req) => load + req.size, 0) / MAX_QUEUE_SIZE;
      }

      function shouldAcceptRequest(request: Request): boolean {
        const projectedLoad = currentLoad + request.size / MAX_QUEUE_SIZE;
        
        if (projectedLoad <= LOAD_THRESHOLD) return true;
        if (request.priority === 'high') return true;
        if (request.priority === 'medium' && projectedLoad <= 0.9) return true;
        return false;
      }

      function generateRequest(): Request {
        return {
          id: processed,
          priority: priorities[Math.floor(Math.random() * 3)],
          size: Math.random() * 0.3 + 0.1 // 0.1 to 0.4
        };
      }

      function processQueue() {
        if (queue.length > 0) {
          const request = queue.shift()!;
          const startTime = Date.now();
          
          setTimeout(() => {
            next(request);
            processed++;
            updateMetrics('processed', request.priority);
            metrics.totalLatency.set(
              request.priority,
              (metrics.totalLatency.get(request.priority) || 0) + Date.now() - startTime
            );
            currentLoad = calculateLoad();
            
            if (processed < totalRequests) {
              processQueue();
            } else {
              complete();
            }
          }, request.size * 100);
        } else if (processed < totalRequests) {
          setTimeout(processQueue, 10);
        }
      }

      function addRequests() {
        if (processed >= totalRequests) return;

        const request = generateRequest();
        if (shouldAcceptRequest(request)) {
          queue.push(request);
          currentLoad = calculateLoad();
        } else {
          updateMetrics('dropped', request.priority);
        }

        setTimeout(addRequests, Math.random() * 30 + 20);
      }

      addRequests();
      processQueue();
    });

    source(0, createSink<Request>({
      onEnd: () => {
        // Verify QoS guarantees
        expect(metrics.dropped.get('high') || 0).toBeLessThan(
          metrics.dropped.get('low') || 0
        );
        
        // Check average latency by priority
        const avgLatency = new Map<string, number>();
        priorities.forEach(priority => {
          const total = metrics.totalLatency.get(priority) || 0;
          const count = metrics.processed.get(priority) || 1;
          avgLatency.set(priority, total / count);
        });

        // Higher priority should have lower average latency
        expect(avgLatency.get('high')!).toBeLessThan(avgLatency.get('low')!);
        done();
      }
    }));
  });

  it('should handle fair work distribution with work stealing', (done) => {
    interface Worker {
      id: number;
      queue: number[];
      busy: boolean;
      processed: number;
      stolen: number;
    }

    const NUM_WORKERS = 3;
    const TOTAL_TASKS = 50;
    const workers: Worker[] = Array.from(
      { length: NUM_WORKERS },
      (_, i) => ({
        id: i,
        queue: [],
        busy: false,
        processed: 0,
        stolen: 0
      })
    );

    const metrics = {
      totalSteals: 0,
      maxQueueLength: 0,
      workBalance: 0
    };

    const source = createSource<number>((next, complete) => {
      let completedTasks = 0;

      function findVictim(thiefId: number): Worker | undefined {
        return workers
          .filter(w => w.id !== thiefId && w.queue.length > 1)
          .sort((a, b) => b.queue.length - a.queue.length)[0];
      }

      function tryStealWork(workerId: number) {
        const victim = findVictim(workerId);
        if (victim) {
          const stolenTask = victim.queue.pop()!;
          workers[workerId].queue.push(stolenTask);
          workers[workerId].stolen++;
          metrics.totalSteals++;
        }
      }

      function processTask(workerId: number) {
        const worker = workers[workerId];
        if (worker.queue.length === 0) {
          tryStealWork(workerId);
        }

        if (worker.queue.length > 0) {
          worker.busy = true;
          const task = worker.queue.shift()!;
          
          setTimeout(() => {
            next(task);
            worker.processed++;
            completedTasks++;
            worker.busy = false;

            metrics.maxQueueLength = Math.max(
              metrics.maxQueueLength,
              worker.queue.length
            );

            if (completedTasks === TOTAL_TASKS) {
              // Calculate work balance
              const loads = workers.map(w => w.processed);
              metrics.workBalance = Math.max(...loads) - Math.min(...loads);
              complete();
            } else {
              processTask(workerId);
            }
          }, Math.random() * 50);
        } else {
          setTimeout(() => processTask(workerId), 10);
        }
      }

      // Initial task distribution
      for (let i = 0; i < TOTAL_TASKS; i++) {
        const targetWorker = i % NUM_WORKERS;
        workers[targetWorker].queue.push(i);
      }

      // Start all workers
      workers.forEach((_, id) => processTask(id));
    });

    source(0, createSink<number>({
      onEnd: () => {
        expect(metrics.totalSteals).toBeGreaterThan(0);
        expect(metrics.workBalance).toBeLessThanOrEqual(5);
        // Each worker should have processed some tasks
        workers.forEach(worker => {
          expect(worker.processed).toBeGreaterThan(0);
        });
        done();
      }
    }));
  });

  it('should handle distributed consensus with leader election', (done) => {
    interface Node {
      id: number;
      term: number;
      isLeader: boolean;
      votes: Set<number>;
      lastHeartbeat: number;
    }

    const NODES = 5;
    const ELECTION_TIMEOUT = 150;
    const HEARTBEAT_INTERVAL = 50;

    const metrics = {
      elections: 0,
      leaderChanges: 0,
      heartbeats: 0,
      maxTerm: 0
    };

    const nodes: Node[] = Array.from({ length: NODES }, (_, i) => ({
      id: i,
      term: 0,
      isLeader: false,
      votes: new Set(),
      lastHeartbeat: Date.now()
    }));

    const source = createSource<string>((next, complete) => {
      let currentLeader: number | null = null;
      let isCompleted = false;

      function startElection(nodeId: number) {
        const node = nodes[nodeId];
        node.term++;
        node.votes = new Set([nodeId]); // Vote for self
        metrics.elections++;
        metrics.maxTerm = Math.max(metrics.maxTerm, node.term);

        // Request votes from other nodes
        nodes.forEach((peer, peerId) => {
          if (peerId !== nodeId && peer.term <= node.term) {
            if (Math.random() > 0.2) { // 80% chance to receive vote
              node.votes.add(peerId);
            }
          }
        });

        // Check if won election
        if (node.votes.size > NODES / 2) {
          if (currentLeader !== nodeId) {
            metrics.leaderChanges++;
            if (currentLeader !== null) {
              nodes[currentLeader].isLeader = false;
            }
            currentLeader = nodeId;
            node.isLeader = true;
            next(`Node ${nodeId} elected leader for term ${node.term}`);
          }
        }
      }

      function sendHeartbeat(leaderId: number) {
        const leader = nodes[leaderId];
        leader.lastHeartbeat = Date.now();
        metrics.heartbeats++;
        
        nodes.forEach((node, id) => {
          if (id !== leaderId) {
            node.lastHeartbeat = Date.now();
            node.term = Math.max(node.term, leader.term);
          }
        });
      }

      function checkTimeouts() {
        if (isCompleted) return;

        const now = Date.now();
        nodes.forEach((node, id) => {
          if (!node.isLeader && now - node.lastHeartbeat > ELECTION_TIMEOUT) {
            startElection(id);
          }
        });

        if (currentLeader !== null) {
          sendHeartbeat(currentLeader);
        }

        if (metrics.leaderChanges >= 3) {
          isCompleted = true;
          complete();
        } else {
          setTimeout(checkTimeouts, HEARTBEAT_INTERVAL);
        }
      }

      // Start the consensus process
      startElection(Math.floor(Math.random() * NODES));
      checkTimeouts();
    });

    source(0, createSink<string>({
      onEnd: () => {
        expect(metrics.elections).toBeGreaterThan(0);
        expect(metrics.leaderChanges).toBeGreaterThanOrEqual(3);
        expect(metrics.heartbeats).toBeGreaterThan(0);
        done();
      }
    }));
  });

  it('should handle token bucket rate limiting', (done) => {
    interface TokenBucket {
      tokens: number;
      lastRefill: number;
      capacity: number;
      refillRate: number;
    }

    const metrics = {
      accepted: 0,
      rejected: 0,
      burstCount: 0,
      avgDelay: 0
    };

    const bucket: TokenBucket = {
      tokens: 10,
      lastRefill: Date.now(),
      capacity: 10,
      refillRate: 2 // tokens per 100ms
    };

    function refillBucket() {
      const now = Date.now();
      const timePassed = now - bucket.lastRefill;
      const newTokens = Math.floor(timePassed / 100) * bucket.refillRate;
      bucket.tokens = Math.min(bucket.capacity, bucket.tokens + newTokens);
      bucket.lastRefill = now;
    }

    const source = createSource<number>((next, complete) => {
      let requestCount = 0;
      const totalRequests = 50;
      const delays: number[] = [];

      function processRequest() {
        if (requestCount >= totalRequests) {
          metrics.avgDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
          complete();
          return;
        }

        refillBucket();
        const requestSize = Math.ceil(Math.random() * 3); // Request 1-3 tokens

        if (bucket.tokens >= requestSize) {
          bucket.tokens -= requestSize;
          metrics.accepted++;
          if (requestSize > 1) metrics.burstCount++;
          next(requestCount);
          delays.push(0);
        } else {
          metrics.rejected++;
          const waitTime = Math.ceil((requestSize - bucket.tokens) / bucket.refillRate * 100);
          delays.push(waitTime);
          setTimeout(() => processRequest(), waitTime);
          return;
        }

        requestCount++;
        const nextDelay = Math.random() * 50;
        setTimeout(processRequest, nextDelay);
      }

      processRequest();
    });

    source(0, createSink<number>({
      onEnd: () => {
        expect(metrics.accepted + metrics.rejected).toBeGreaterThan(0);
        expect(metrics.burstCount).toBeGreaterThan(0);
        expect(metrics.avgDelay).toBeGreaterThan(0);
        done();
      }
    }));
  });

  it('should handle adaptive load balancing with weighted round robin', (done) => {
    interface Backend {
      id: number;
      weight: number;
      latency: number;
      errorRate: number;
      requests: number;
    }

    const backends: Backend[] = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      weight: 1,
      latency: 50,
      errorRate: 0.1,
      requests: 0
    }));

    const metrics = {
      totalRequests: 0,
      errors: 0,
      weightAdjustments: 0,
      latencies: [] as number[],
      timestamps: [] as number[],
      throughput: [] as number[],
      backendLatencies: new Map<number, number[]>(),
      backendErrors: new Map<number, number>()
    };

    // Initialize per-backend metrics
    backends.forEach(b => {
      metrics.backendLatencies.set(b.id, []);
      metrics.backendErrors.set(b.id, 0);
    });

    function adjustWeights() {
      const totalRequests = backends.reduce((sum, b) => sum + b.requests, 0);
      if (totalRequests === 0) return;

      backends.forEach(backend => {
        const oldWeight = backend.weight;
        const latencyFactor = 50 / backend.latency;
        const errorFactor = 1 - backend.errorRate;
        const newWeight = Math.max(0.1, Math.min(2, latencyFactor * errorFactor));
        
        if (Math.abs(newWeight - oldWeight) > 0.1) {
          backend.weight = newWeight;
          metrics.weightAdjustments++;
        }
      });
    }

    const source = createSource<number>((next: NextFn<number>, complete: CompleteFn) => {
      let requestCount = 0;
      const maxRequests = 100;
      let lastEmissionTime = Date.now();

      function selectBackend(): Backend {
        const totalWeight = backends.reduce((sum, b) => sum + b.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const backend of backends) {
          random -= backend.weight;
          if (random <= 0) return backend;
        }
        return backends[0];
      }

      function processRequest() {
        if (requestCount >= maxRequests) {
          // Calculate final throughput
          const windowSize = 1000; // 1 second window
          metrics.throughput = calculateThroughput(metrics.timestamps, windowSize);
          complete();
          return;
        }

        const backend = selectBackend();
        const startTime = Date.now();
        metrics.timestamps.push(startTime);

        // Calculate current throughput
        const currentWindow = metrics.timestamps.filter(
          ts => ts > startTime - 1000
        ).length;
        metrics.throughput.push(currentWindow);

        backend.requests++;
        metrics.totalRequests++;

        setTimeout(() => {
          const success = Math.random() > backend.errorRate;
          if (success) {
            next(backend.id);
            const latency = Date.now() - startTime;
            metrics.latencies.push(latency);
            metrics.backendLatencies.get(backend.id)?.push(latency);
            backend.latency = (backend.latency * 0.9) + (latency * 0.1);
          } else {
            metrics.errors++;
            metrics.backendErrors.set(
              backend.id,
              (metrics.backendErrors.get(backend.id) || 0) + 1
            );
            backend.errorRate = (backend.errorRate * 0.9) + 0.1;
          }

          if (requestCount % 10 === 0) {
            adjustWeights();
          }

          requestCount++;
          setTimeout(processRequest, Math.random() * 30);
        }, backend.latency * (1 + Math.random() * 0.5));
      }

      processRequest();
    });

    source(0, createSink<number>({
      onEnd: () => {
        expect(metrics.weightAdjustments).toBeGreaterThan(0);
        expect(metrics.totalRequests).toBe(100);
        
        // Generate and log comprehensive performance report
        console.log(generatePerformanceReport(metrics));
        
        // Analyze per-backend performance
        backends.forEach(backend => {
          const backendLatencies = metrics.backendLatencies.get(backend.id) || [];
          const backendErrors = metrics.backendErrors.get(backend.id) || 0;
          
          console.log(`\nBackend ${backend.id} Analysis:`);
          console.log('Latency Distribution:');
          console.log(visualizeDistribution(backendLatencies));
          
          if (backendLatencies.length > 0) {
            console.log('\nLatency Over Time:');
            console.log(visualizeTimeSeries(
              backendLatencies,
              metrics.timestamps.slice(0, backendLatencies.length)
            ));
          }
          
          const errorRate = (backendErrors / backend.requests) * 100;
          console.log(`\nError Rate: ${errorRate.toFixed(2)}%`);
          console.log(`Total Requests: ${backend.requests}`);
          console.log(`Final Weight: ${backend.weight.toFixed(2)}`);
        });
        
        // Verify load distribution
        const loads = backends.map(b => b.requests);
        const maxDiff = Math.max(...loads) - Math.min(...loads);
        expect(maxDiff / metrics.totalRequests).toBeLessThan(0.4);
        
        // Analyze latency patterns
        const { patterns, bottlenecks, statistics } = analyzeLatencyPatterns(
          metrics.latencies,
          metrics.timestamps
        );
        
        console.log('\nLatency Analysis:');
        console.log(patterns.join('\n'));
        
        if (bottlenecks.length > 0) {
          console.log('\nBottleneck timestamps:');
          bottlenecks.forEach(timestamp => {
            console.log(`${new Date(timestamp).toISOString()}: ${metrics.latencies[timestamp]}ms`);
          });
        }
        
        if (statistics?.seasonal) {
          console.log('\nSeasonal Analysis:');
          console.log('Trend Component:');
          console.log(visualizeTimeSeries(
            statistics.seasonal.trend,
            metrics.timestamps
          ));
        }
        
        done();
      }
    }));
  });
}); 