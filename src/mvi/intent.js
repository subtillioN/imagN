import { pipe } from 'callbag-pipe';
import { map } from 'callbag-map';
import { filter } from 'callbag-filter';
import { merge } from 'callbag-merge';
import { share } from 'callbag-share';
import { ActionTypes } from './model';

// Helper to create action
const createAction = (type, payload) => ({ type, payload });

// Intent handler for DOM events
export const createIntent = (sources) => {
  const click$ = sources.DOM.select('.button').events('click');
  const input$ = sources.DOM.select('.input').events('input');
  const hover$ = sources.DOM.select('.interactive').events('mouseenter');
  const upload$ = sources.DOM.select('.file-input').events('change');
  const params$ = sources.DOM.select('.parameter').events('change');

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

  const hoverActions$ = pipe(
    hover$,
    map(event => createAction(ActionTypes.SET_HOVER, event.target.dataset))
  );

  const uploadActions$ = pipe(
    upload$,
    map(event => {
      const file = event.target.files[0];
      return createAction(ActionTypes.SET_UPLOAD, file);
    })
  );

  const paramActions$ = pipe(
    params$,
    map(event => createAction(ActionTypes.SET_PARAMS, {
      name: event.target.name,
      value: event.target.value
    }))
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
    hoverActions$,
    uploadActions$,
    paramActions$,
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