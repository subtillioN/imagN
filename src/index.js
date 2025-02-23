import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { withState } from '@cycle/state';

// Main application function
function main(sources) {
  // Initial state
  const state$ = sources.state.stream;

  // View
  const view$ = state$.map(state => (
    <div className="app">
      <h1>ImagN</h1>
      <p>FRP-based AI Image Generation Interface</p>
    </div>
  ));

  return {
    DOM: view$,
    state: state$.map(state => state)
  };
}

// Initialize the application
const drivers = {
  DOM: makeDOMDriver('#app'),
};

run(withState(main), drivers);