import { pipe } from 'callbag-pipe';
import { map } from 'callbag-map';
import { filter } from 'callbag-filter';
import { ActionTypes } from './model';

// Helper to create action
const createAction = (type, payload) => ({ type, payload });

// Intent handler for DOM events
export const createIntent = (sources) => {
  const click$ = sources.DOM.select('.button').events('click');
  const input$ = sources.DOM.select('.input').events('input');

  // Transform DOM events into actions
  const actions$ = pipe(
    click$,
    map(event => {
      // Example action creation based on click event
      return createAction(ActionTypes.SET_LOADING, true);
    })
  );

  const inputActions$ = pipe(
    input$,
    map(event => {
      // Transform input events into data actions
      return createAction(ActionTypes.SET_DATA, event.target.value);
    })
  );

  // Error handling stream
  const error$ = pipe(
    sources.HTTP.select('query').response$,
    filter(response => response.error),
    map(response => createAction(ActionTypes.SET_ERROR, response.error))
  );

  return {
    actions$,
    inputActions$,
    error$
  };
};

// Combine all intents into a single stream
export const mergeIntents = (...intents) => {
  return pipe(
    merge(...intents),
    share()
  );
};