import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { Source } from 'callbag';
import { CoverageTracker } from './coverage-utils';

// Mock source creator for testing callbag streams
export function createMockSource<T>(values: T[]): Source<T> {
  CoverageTracker.markCovered('createMockSource');
  return (...args: [number, any]) => {
    const [type, sink] = args;
    if (type !== 0) return;
    
    sink(0, (t: number) => {
      if (t === 2) {
        values.forEach(value => sink(1, value));
        sink(2);
      }
    });
  };
}

// Custom render function with coverage tracking
export function render(ui: React.ReactElement, options = {}) {
  CoverageTracker.markCovered('render');
  return rtlRender(ui, {
    wrapper: ({ children }) => {
      CoverageTracker.markCovered('render.wrapper');
      return children;
    },
    ...options,
  });
}

// Create mock workflow preset with coverage tracking
export function createMockWorkflowPreset(overrides = {}) {
  CoverageTracker.markCovered('createMockWorkflowPreset');
  return {
    id: 'test-preset',
    name: 'Test Preset',
    description: 'A test preset',
    tags: ['test', 'mock'],
    category: 'test',
    type: 'test',
    nodes: [],
    connections: [],
    ...overrides,
  };
}

// Create mock project with coverage tracking
export function createMockProject(overrides = {}) {
  CoverageTracker.markCovered('createMockProject');
  return {
    id: 'test-project',
    name: 'Test Project',
    description: 'A test project',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    presetId: 'test-preset',
    ...overrides,
  };
}

// Reset coverage before each test
beforeEach(() => {
  CoverageTracker.reset();
});

// Re-export everything
export * from '@testing-library/react'; 