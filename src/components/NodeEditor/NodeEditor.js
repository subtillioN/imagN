import { div, button } from '@cycle/dom';
import { pipe, merge, map } from 'callbag-basics';
import { BaseComponent } from '../BaseComponent';
import { WorkflowStorageService } from '../../services/workflowStorage';

export class NodeEditor extends BaseComponent {
  constructor(sources) {
    super(sources);
    this.workflowStorage = new WorkflowStorageService();
    this.state$ = this.model(this.intent(sources));
  }

  intent(sources) {
    const dragStart$ = sources.DOM.select('.node')
      .events('mousedown')
      .map(event => ({
        type: 'NODE_DRAG_START',
        payload: {
          x: event.clientX,
          y: event.clientY,
          nodeId: event.target.dataset.nodeId
        }
      }));

    const dragMove$ = sources.DOM.select('document')
      .events('mousemove')
      .map(event => ({
        type: 'NODE_DRAG_MOVE',
        payload: {
          x: event.clientX,
          y: event.clientY
        }
      }));

    const dragEnd$ = sources.DOM.select('document')
      .events('mouseup')
      .map(() => ({ type: 'NODE_DRAG_END' }));

    const saveWorkflow$ = sources.DOM.select('.save-workflow')
      .events('click')
      .map(() => ({ type: 'SAVE_WORKFLOW' }));

    const loadWorkflow$ = sources.DOM.select('.load-workflow')
      .events('click')
      .map(() => ({ type: 'LOAD_WORKFLOW' }));

    return merge(dragStart$, dragMove$, dragEnd$, saveWorkflow$, loadWorkflow$);
  }

  model(action$) {
    const initialState = {
      nodes: [],
      connections: [],
      draggingNode: null,
      offset: { x: 0, y: 0 }
    };

    return pipe(action$, map((state, action) => {
      switch (action.type) {
        case 'NODE_DRAG_START':
          return {
            ...state,
            draggingNode: action.payload.nodeId,
            offset: {
              x: action.payload.x,
              y: action.payload.y
            }
          };

        case 'NODE_DRAG_MOVE':
          if (!state.draggingNode) return state;
          return {
            ...state,
            nodes: state.nodes.map(node =>
              node.id === state.draggingNode
                ? {
                    ...node,
                    position: {
                      x: node.position.x + (action.payload.x - state.offset.x),
                      y: node.position.y + (action.payload.y - state.offset.y)
                    }
                  }
                : node
            ),
            offset: {
              x: action.payload.x,
              y: action.payload.y
            }
          };

        case 'NODE_DRAG_END':
          return {
            ...state,
            draggingNode: null
          };

        case 'SAVE_WORKFLOW':
          this.workflowStorage.saveWorkflow(state).subscribe(
            () => console.log('Workflow saved successfully'),
            error => console.error('Error saving workflow:', error)
          );
          return state;

        case 'LOAD_WORKFLOW':
          this.workflowStorage.getAllWorkflows().forEach(workflow => {
            if (workflow.nodes && workflow.connections) {
              return {
                ...state,
                nodes: workflow.nodes,
                connections: workflow.connections
              };
            }
          });
          return state;

        default:
          return state;
      }
    }, initialState);
  }

  view(state$) {
    return state$.map(state =>
      div('.node-editor', [
        div('.toolbar', [
          button('.save-workflow', 'Save Workflow'),
          button('.load-workflow', 'Load Workflow')
        ]),
        div('.node-canvas', [
          ...state.nodes.map(node =>
            div('.node', {
              attrs: {
                'data-node-id': node.id,
                style: `transform: translate(${node.position.x}px, ${node.position.y}px)`
              }
            }, [
              div('.node-header', node.title),
              div('.node-content', [
                div('.node-inputs', node.inputs.map(input =>
                  div('.node-input', { attrs: { 'data-input-id': input.id } }, input.name)
                )),
                div('.node-outputs', node.outputs.map(output =>
                  div('.node-output', { attrs: { 'data-output-id': output.id } }, output.name)
                ))
              ])
            ])
          )
        ])
      ])
    );
  }
}