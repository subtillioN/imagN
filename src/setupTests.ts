import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import React from 'react';
import { Stream } from 'xstream';

// Configure testing-library
configure({
  testIdAttribute: 'data-testid',
});

// Mock Material-UI components that use DOM APIs
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Snackbar: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    Dialog: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  };
});

// Mock callbag functions
jest.mock('callbag-basics', () => ({
  pipe: jest.fn((source) => {
    return (type: number, sink: any) => {
      if (type === 0) source(0, sink);
      return () => {};
    };
  }),
}));

// Setup global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Add custom matchers for streams
expect.extend({
  toEmitInOrder(received: Stream<any>, expected: any[]) {
    const emitted: any[] = [];
    let error: any = null;

    received.addListener({
      next: (value) => emitted.push(value),
      complete: () => {},
      error: (err) => { error = err; }
    });

    const pass = this.equals(emitted, expected);

    return {
      pass,
      message: () => 
        pass
          ? `Expected stream not to emit ${this.utils.printExpected(expected)} in order`
          : `Expected stream to emit ${this.utils.printExpected(expected)} in order, but got ${this.utils.printReceived(emitted)}${error ? ` with error: ${error}` : ''}`
    };
  },
  toComplete(received: Stream<any>) {
    let completed = false;
    let error: any = null;

    received.addListener({
      next: () => {},
      complete: () => { completed = true; },
      error: (err) => { error = err; }
    });

    const pass = completed && !error;

    return {
      pass,
      message: () =>
        pass
          ? 'Expected stream not to complete'
          : `Expected stream to complete${error ? `, but got error: ${error}` : ', but it did not'}`
    };
  }
});

// Extend global types for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toEmitInOrder(expected: any[]): R;
      toComplete(): R;
    }
  }
} 