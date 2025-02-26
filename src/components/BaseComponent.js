import { createSource } from '../streams/core';

export class BaseComponent {
  constructor() {
    this.state = {};
    this.props = {};
    this.initializeStreams();
  }

  initializeStreams() {
    this.subject = createSource((sink) => {
      sink.next(this.state);
      return () => {};
    });

    this.lifecycle = {
      mount$: createSource((sink) => {
        let mounted = false;
        return () => {
          mounted = false;
        };
      }),
      unmount$: createSource((sink) => {
        return () => {};
      }),
      update$: createSource((sink) => {
        return () => {};
      })
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.subject.source(1, this.state);
  }

  update(props) {
    this.props = { ...this.props, ...props };
    this.lifecycle.update$.source(1, props);
  }

  mount() {
    this.lifecycle.mount$.source(1, true);
  }

  unmount() {
    this.lifecycle.unmount$.source(1, true);
  }

  subscribe(observer) {
    return this.subject.source(0, (type, data) => {
      if (type === 1) {
        observer(data);
      }
    });
  }

  subscribeToLifecycle(event, observer) {
    if (!this.lifecycle[event]) {
      throw new Error(`Invalid lifecycle event: ${event}`);
    }
    return this.lifecycle[event].source(0, (type, data) => {
      if (type === 1) {
        observer(data);
      }
    });
  }

  // Lifecycle hooks
  initialize() {
    // Called when component is created
    this.onInitialize();
  }

  onMount() {
    // Called when component is mounted to DOM
  }

  onUnmount() {
    // Called when component is removed from DOM
  }

  onUpdate(prevProps, nextProps) {
    // Lifecycle hook implementation
  }

  // Communication
  emit(event, data) {
    if (this.props.onEvent) {
      this.props.onEvent(event, data);
    }
  }

  // Cleanup
  dispose() {
    this.unmount();
    this.subject.source(0, (type, data) => {
      if (type === 2) data();
    });
  }
}