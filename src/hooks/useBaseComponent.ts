import { useEffect, useRef, useState } from 'react';
import { createSource } from '../streams/core';
import { Option, Some, None } from '../utils/option';

// Types
export type Observer<T> = (data: T) => void;
export type Unsubscribe = () => void;
export type Source<T> = {
  source: (type: number, data: T) => void;
  update: (value: T) => void;
};

export type LifecycleEvents = {
  mount$: Source<boolean>;
  unmount$: Source<boolean>;
  update$: Source<unknown>;
};

export type BaseComponentState<S = unknown, P = unknown> = {
  state: S;
  props: P;
  subject: Source<S>;
  lifecycle: LifecycleEvents;
};

// Utility functions
const createLifecycleEvents = (): LifecycleEvents => ({
  mount$: createSource<boolean>(() => () => undefined),
  unmount$: createSource<boolean>(() => () => undefined),
  update$: createSource<unknown>(() => () => undefined)
});

// Hook implementation
export const useBaseComponent = <S, P>(initialState: S): BaseComponentState<S, P> => {
  // State management
  const [state, setState] = useState<S>(initialState);
  const [props, setProps] = useState<P>({} as P);
  
  // Refs for memoization
  const subjectRef = useRef<Option<Source<S>>>(None);
  const lifecycleRef = useRef<Option<LifecycleEvents>>(None);

  // Initialize subject if not exists
  if (subjectRef.current === None) {
    subjectRef.current = Some(createSource<S>((sink) => {
      sink.next(state);
      return () => undefined;
    }));
  }

  // Initialize lifecycle events if not exists
  if (lifecycleRef.current === None) {
    lifecycleRef.current = Some(createLifecycleEvents());
  }

  // Mount effect
  useEffect(() => {
    const lifecycle = lifecycleRef.current;
    if (lifecycle !== None) {
      lifecycle.value.mount$.source(1, true);
      return () => {
        lifecycle.value.unmount$.source(1, true);
      };
    }
    return undefined;
  }, []);

  // Update state immutably
  const updateState = (newState: Partial<S>): void => {
    setState((prev) => ({ ...prev, ...newState }));
    if (subjectRef.current !== None) {
      subjectRef.current.value.source(1, { ...state, ...newState });
    }
  };

  // Update props immutably
  const updateProps = (newProps: Partial<P>): void => {
    setProps((prev) => ({ ...prev, ...newProps }));
    if (lifecycleRef.current !== None) {
      lifecycleRef.current.value.update$.source(1, newProps);
    }
  };

  // Subscribe to state changes
  const subscribe = (observer: Observer<S>): Unsubscribe => {
    if (subjectRef.current === None) return () => undefined;
    return subjectRef.current.value.source(0, (type, data) => {
      if (type === 1) observer(data);
    });
  };

  // Subscribe to lifecycle events
  const subscribeToLifecycle = (
    event: keyof LifecycleEvents,
    observer: Observer<unknown>
  ): Unsubscribe => {
    if (lifecycleRef.current === None) return () => undefined;
    const lifecycle = lifecycleRef.current.value[event];
    if (!lifecycle) {
      throw new Error(`Invalid lifecycle event: ${event}`);
    }
    return lifecycle.source(0, (type, data) => {
      if (type === 1) observer(data);
    });
  };

  // Emit events
  const emit = (event: string, data: unknown): void => {
    const currentProps = props as any;
    if (currentProps.onEvent) {
      currentProps.onEvent(event, data);
    }
  };

  return {
    state,
    props,
    subject: subjectRef.current === None ? createSource(() => () => undefined) : subjectRef.current.value,
    lifecycle: lifecycleRef.current === None ? createLifecycleEvents() : lifecycleRef.current.value,
    updateState,
    updateProps,
    subscribe,
    subscribeToLifecycle,
    emit
  };
}; 