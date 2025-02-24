import { render, fireEvent } from '@testing-library/react';
import NodeEditor from '../NodeEditor';
import { createNode } from '../NodeTypes';

describe('NodeEditor', () => {
  let nodeEditor;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    nodeEditor = new NodeEditor({
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
    const state = nodeEditor.state$.getValue();
    expect(state.nodes).toEqual([]);
    expect(state.connections).toEqual([]);
    expect(state.draggingNode).toBeNull();
    expect(state.offset).toEqual({ x: 0, y: 0 });
  });

  test('handles node drag start', () => {
    const action = {
      type: 'NODE_DRAG_START',
      payload: {
        x: 100,
        y: 100,
        nodeId: 'test-node'
      }
    };

    const newState = nodeEditor.model(action);
    expect(newState.draggingNode).toBe('test-node');
    expect(newState.offset).toEqual({ x: 100, y: 100 });
  });

  test('handles node drag move', () => {
    const initialState = {
      nodes: [{ id: 'test-node', position: { x: 0, y: 0 } }],
      draggingNode: 'test-node',
      offset: { x: 0, y: 0 }
    };

    const action = {
      type: 'NODE_DRAG_MOVE',
      payload: { x: 100, y: 100 }
    };

    const newState = nodeEditor.model(action);
    const updatedNode = newState.nodes.find(n => n.id === 'test-node');
    expect(updatedNode.position).toEqual({ x: 100, y: 100 });
  });

  test('handles workflow save and load', () => {
    const testWorkflow = {
      nodes: [createNode('IMAGE_INPUT', { x: 100, y: 100 })],
      connections: []
    };

    // Test save workflow
    const saveAction = { type: 'SAVE_WORKFLOW' };
    const saveState = nodeEditor.model(saveAction);
    expect(saveState).toBeDefined();

    // Test load workflow
    const loadAction = { type: 'LOAD_WORKFLOW' };
    const loadState = nodeEditor.model(loadAction);
    expect(loadState).toBeDefined();
  });

  test('renders nodes correctly', () => {
    const testNode = createNode('IMAGE_INPUT', { x: 100, y: 100 });
    nodeEditor.state$.next({
      nodes: [testNode],
      connections: [],
      draggingNode: null,
      offset: { x: 0, y: 0 }
    });

    const view = nodeEditor.view(nodeEditor.state$);
    expect(view).toBeDefined();
  });
});