import { svg } from '@cycle/dom';
import { pipe, merge, map } from 'callbag-basics';
import { BaseComponent } from '../BaseComponent';

export class NodeConnection extends BaseComponent {
  constructor(sources) {
    super(sources);
    this.state$ = this.model(this.intent(sources));
  }

  intent(sources) {
    const connectionStart$ = sources.DOM.select('.node-output')
      .events('mousedown')
      .map(event => ({
        type: 'CONNECTION_START',
        payload: {
          x: event.clientX,
          y: event.clientY,
          outputId: event.target.dataset.outputId,
          nodeId: event.target.closest('.node').dataset.nodeId
        }
      }));

    const connectionMove$ = sources.DOM.select('document')
      .events('mousemove')
      .map(event => ({
        type: 'CONNECTION_MOVE',
        payload: {
          x: event.clientX,
          y: event.clientY
        }
      }));

    const connectionEnd$ = sources.DOM.select('.node-input')
      .events('mouseup')
      .map(event => ({
        type: 'CONNECTION_END',
        payload: {
          inputId: event.target.dataset.inputId,
          nodeId: event.target.closest('.node').dataset.nodeId
        }
      }));

    const connectionCancel$ = sources.DOM.select('document')
      .events('mouseup')
      .map(() => ({ type: 'CONNECTION_CANCEL' }));

    return merge(
      connectionStart$,
      connectionMove$,
      connectionEnd$,
      connectionCancel$
    );
  }

  model(action$) {
    const initialState = {
      activeConnection: null,
      connections: []
    };

    return pipe(action$, map((state, action) => {
      switch (action.type) {
        case 'CONNECTION_START':
          return {
            ...state,
            activeConnection: {
              start: action.payload,
              end: action.payload
            }
          };

        case 'CONNECTION_MOVE':
          if (!state.activeConnection) return state;
          return {
            ...state,
            activeConnection: {
              ...state.activeConnection,
              end: action.payload
            }
          };

        case 'CONNECTION_END':
          if (!state.activeConnection) return state;
          return {
            ...state,
            activeConnection: null,
            connections: [
              ...state.connections,
              {
                id: `${state.activeConnection.start.nodeId}-${action.payload.nodeId}`,
                from: {
                  nodeId: state.activeConnection.start.nodeId,
                  outputId: state.activeConnection.start.outputId
                },
                to: {
                  nodeId: action.payload.nodeId,
                  inputId: action.payload.inputId
                }
              }
            ]
          };

        case 'CONNECTION_CANCEL':
          return {
            ...state,
            activeConnection: null
          };

        default:
          return state;
      }
    }, initialState);
  }

  createPath(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const controlPoint1 = { x: start.x + dx * 0.5, y: start.y };
    const controlPoint2 = { x: end.x - dx * 0.5, y: end.y };
    return `M ${start.x},${start.y} C ${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${end.x},${end.y}`;
  }

  view(state$) {
    return state$.map(state =>
      svg('.connections', {
        attrs: {
          width: '100%',
          height: '100%',
          style: 'position: absolute; pointer-events: none;'
        }
      }, [
        ...state.connections.map(conn =>
          svg('path.connection', {
            attrs: {
              d: this.createPath(
                document.querySelector(`[data-output-id="${conn.from.outputId}"]`).getBoundingClientRect(),
                document.querySelector(`[data-input-id="${conn.to.inputId}"]`).getBoundingClientRect()
              )
            }
          })
        ),
        state.activeConnection && svg('path.connection.active', {
          attrs: {
            d: this.createPath(
              state.activeConnection.start,
              state.activeConnection.end
            )
          }
        })
      ])
    );
  }
}