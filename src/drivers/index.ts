import { Stream } from 'xstream';
import { ReactSource } from '@cycle/react';
import { DOMSource, makeDOMDriver } from '@cycle/dom';
import { WorkflowSource, WorkflowSink, makeWorkflowDriver } from './workflowDriver';
import { makeStorageDriver, StorageSource, StorageSink } from './storageDriver';
import { MainViewState } from '../types/state';
import { VNode } from '@cycle/dom';

// Define the sources type for the main cycle
export interface Sources {
  DOM: DOMSource;
  react: ReactSource;
  workflow: WorkflowSource;
  storage: StorageSource;
  state: Stream<MainViewState>;
}

// Define the sinks type for the main cycle
export interface Sinks {
  DOM: Stream<VNode>;
  react: Stream<VNode>;
  workflow: Stream<WorkflowSink>;
  storage: Stream<StorageSink>;
  state: Stream<MainViewState>;
}

// Export all drivers
export const drivers = {
  DOM: makeDOMDriver('#root'),
  react: makeDOMDriver('#root'),
  workflow: makeWorkflowDriver(),
  storage: makeStorageDriver(),
}; 