import { Stream } from 'xstream';
import { VNode, div, h1 } from '@cycle/dom';
import { StateSource } from '@cycle/state';

export interface Sources {
  DOM: any;
  state: StateSource<State>;
}

export interface Sinks {
  DOM: Stream<VNode>;
  state: Stream<Reducer>;
}

export interface State {
  count: number;
}

export type Reducer = (prev: State) => State;

export function App(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const vdom$ = state$.map(state =>
    div([
      h1('Cycle.js App'),
      div(`Count: ${state.count}`),
    ])
  );

  const defaultReducer$ = Stream.of((prev: State) => ({
    ...prev,
    count: 0,
  }));

  return {
    DOM: vdom$,
    state: defaultReducer$,
  };
} 