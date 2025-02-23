import { makeSubject } from 'callbag-subject';
import { pipe } from 'callbag-pipe';
import { share } from 'callbag-share';
import { startWith } from 'callbag-start-with';

export class BaseComponent {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.subject = makeSubject();
    this.lifecycle = this.setupLifecycle();
    this.initialize();
  }

  // Lifecycle setup
  setupLifecycle() {
    const mount$ = makeSubject();
    const unmount$ = makeSubject();
    const update$ = makeSubject();

    return {
      mount$: pipe(mount$, share()),
      unmount$: pipe(unmount$, share()),
      update$: pipe(update$, share())
    };
  }

  // Lifecycle hooks
  initialize() {
    // Called when component is created
    this.onInitialize();
  }

  mount() {
    // Called when component is mounted to DOM
    this.lifecycle.mount$(1)(true);
    this.onMount();
  }

  unmount() {
    // Called when component is removed from DOM
    this.lifecycle.unmount$(1)(true);
    this.onUnmount();
  }

  update(nextProps) {
    const prevProps = this.props;
    this.props = nextProps;
    this.lifecycle.update$(1)({ prevProps, nextProps });
    this.onUpdate(prevProps, nextProps);
  }

  // Lifecycle hook implementations (to be overridden)
  onInitialize() {}
  onMount() {}
  onUnmount() {}
  onUpdate(prevProps, nextProps) {}

  // State management
  setState(nextState) {
    const prevState = this.state;
    this.state = { ...this.state, ...nextState };
    this.subject(1)({ prevState, nextState: this.state });
  }

  // Stream creation helper
  createStream(initial = null) {
    return pipe(
      this.subject,
      startWith(initial),
      share()
    );
  }

  // Communication methods
  emit(eventName, data) {
    if (this.props.onEvent) {
      this.props.onEvent(eventName, data);
    }
  }

  // Cleanup method
  dispose() {
    this.unmount();
    this.subject(2)(); // Complete the subject
  }
}