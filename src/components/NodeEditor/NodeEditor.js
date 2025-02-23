import { div } from '@cycle/dom';
import xs from 'xstream';
import { BaseComponent } from '../BaseComponent';

export class NodeEditor extends BaseComponent {
  constructor(sources) {
    super(sources);
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

    return xs.merge(dragStart$, dragMove$, dragEnd$);
  }

  model(action$) {
    const initialState = {
      nodes: [],
      connections: [],
      draggingNode: null,
      offset: { x: 0, y: 0 }
    };

    return action$.fold((state, action) => {
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

        default:
          return state;
      }
    }, initialState);
  }

  view(state$) {
    return state$.map(state =>
      div('.node-editor', [
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