import { ReactElement } from 'react';
import { Stream } from 'xstream';
import { VNode } from '@cycle/react';
import { MainViewActions } from './actions';

export interface MainViewSinks {
  DOM: ReactElement;
  state?: Stream<any>;
  storage?: Stream<any>;
  react: Stream<VNode>;
  workflowPresets: Stream<MainViewActions>;
} 