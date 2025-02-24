import { render, fireEvent } from '@testing-library/react';
import NodeConnection from '../NodeConnection';

describe('NodeConnection', () => {
  let nodeConnection;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    nodeConnection = new NodeConnection({
      DOM: {
        select: () => ({
          events: () => []
        })
      }
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('initializes with empty state', () => {
    const state = nodeConnection.state$.getValue();
    expect(state.activeConnection).toBeNull();
    expect(state.connections).toEqual([]);
  });

  test('handles connection start', () => {
    const action = {
      type: 'CONNECTION_START',
      payload: {
        x: 100,
        y: 100,
        outputId: 'output-1',
        nodeId: 'node-1'
      }
    };

    const newState = nodeConnection.model(action);
    expect(newState.activeConnection).toEqual({
      start: action.payload,
      end: action.payload
    });
  });

  test('handles connection move', () => {
    const initialState = {
      activeConnection: {
        start: { x: 0, y: 0, outputId: 'output-1', nodeId: 'node-1' },
        end: { x: 0, y: 0 }
      },
      connections: []
    };

    const action = {
      type: 'CONNECTION_MOVE',
      payload: { x: 100, y: 100 }
    };

    const newState = nodeConnection.model(action);
    expect(newState.activeConnection.end).toEqual(action.payload);
  });

  test('handles connection end', () => {
    const initialState = {
      activeConnection: {
        start: { x: 0, y: 0, outputId: 'output-1', nodeId: 'node-1' },
        end: { x: 100, y: 100 }
      },
      connections: []
    };

    const action = {
      type: 'CONNECTION_END',
      payload: {
        inputId: 'input-1',
        nodeId: 'node-2'
      }
    };

    const newState = nodeConnection.model(action);
    expect(newState.activeConnection).toBeNull();
    expect(newState.connections).toHaveLength(1);
    expect(newState.connections[0]).toEqual({
      id: 'node-1-node-2',
      from: {
        nodeId: 'node-1',
        outputId: 'output-1'
      },
      to: {
        nodeId: 'node-2',
        inputId: 'input-1'
      }
    });
  });

  test('handles connection cancel', () => {
    const initialState = {
      activeConnection: {
        start: { x: 0, y: 0, outputId: 'output-1', nodeId: 'node-1' },
        end: { x: 100, y: 100 }
      },
      connections: []
    };

    const action = { type: 'CONNECTION_CANCEL' };
    const newState = nodeConnection.model(action);
    expect(newState.activeConnection).toBeNull();
    expect(newState.connections).toHaveLength(0);
  });

  test('creates correct SVG path', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 100 };
    const path = nodeConnection.createPath(start, end);
    expect(path).toBeDefined();
    expect(typeof path).toBe('string');
    expect(path.startsWith('M')).toBe(true);
  });
});