// Core functional types
export type Func<A, B> = (a: A) => B;
export type Predicate<A> = Func<A, boolean>;

// Stream types
export type StreamSource<T> = {
  source: (type: number, data: T) => void;
  update: (value: T) => void;
};

export type StreamSink<T> = (type: number, data: T) => void;
export type StreamDispose = () => void;
export type StreamFactory<T> = (sink: StreamSink<T>) => StreamDispose;

// Component types
export type ComponentState<S = unknown> = {
  readonly state: S;
  readonly updateState: (newState: Partial<S>) => void;
};

export type ComponentProps<P = unknown> = {
  readonly props: P;
  readonly updateProps: (newProps: Partial<P>) => void;
};

export type LifecycleEvent = 'mount' | 'unmount' | 'update';
export type LifecycleEvents = Record<`${LifecycleEvent}$`, StreamSource<boolean>>;

export type BaseComponentState<S = unknown, P = unknown> = ComponentState<S> &
  ComponentProps<P> & {
    readonly subject: StreamSource<S>;
    readonly lifecycle: LifecycleEvents;
    readonly subscribe: (observer: (data: S) => void) => StreamDispose;
    readonly subscribeToLifecycle: (
      event: keyof LifecycleEvents,
      observer: (data: unknown) => void
    ) => StreamDispose;
    readonly emit: (event: string, data: unknown) => void;
  };

// Validation types
export type ValidationRule = {
  readonly name: string;
  readonly description: string;
  readonly validate: (code: string) => Option<string[]>;
};

export type ValidationResult = {
  readonly rule: string;
  readonly violations: string[];
};

// Pattern types
export type Pattern = {
  readonly name: string;
  readonly description: string;
  readonly test: Predicate<string>;
};

// Import Option type from our existing option.ts
import { Option } from '../utils/option'; 