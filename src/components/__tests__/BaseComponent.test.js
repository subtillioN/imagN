import { BaseComponent } from '../BaseComponent';

describe('BaseComponent', () => {
  let component;

  beforeEach(() => {
    component = new BaseComponent({ testProp: 'test' });
  });

  afterEach(() => {
    component.dispose();
  });

  test('initializes with props', () => {
    expect(component.props).toEqual({ testProp: 'test' });
    expect(component.state).toEqual({});
  });

  test('lifecycle methods are called in correct order', () => {
    const initializeSpy = jest.spyOn(component, 'onInitialize');
    const mountSpy = jest.spyOn(component, 'onMount');
    const unmountSpy = jest.spyOn(component, 'onUnmount');

    component.mount();
    expect(initializeSpy).toHaveBeenCalled();
    expect(mountSpy).toHaveBeenCalled();

    component.unmount();
    expect(unmountSpy).toHaveBeenCalled();
  });

  test('setState updates state and emits changes', (done) => {
    const stream = component.createStream();
    stream(0, (data) => {
      expect(data.nextState).toEqual({ test: 'value' });
      done();
    });

    component.setState({ test: 'value' });
  });

  test('update method handles prop changes', () => {
    const updateSpy = jest.spyOn(component, 'onUpdate');
    const nextProps = { testProp: 'updated' };

    component.update(nextProps);
    expect(updateSpy).toHaveBeenCalledWith({ testProp: 'test' }, nextProps);
    expect(component.props).toEqual(nextProps);
  });

  test('emit method calls onEvent prop when available', () => {
    const onEvent = jest.fn();
    component = new BaseComponent({ onEvent });

    component.emit('test', { data: 'test' });
    expect(onEvent).toHaveBeenCalledWith('test', { data: 'test' });
  });

  test('lifecycle streams emit correct values', (done) => {
    const { mount$, unmount$, update$ } = component.lifecycle;

    let mountCalled = false;
    let unmountCalled = false;
    let updateCalled = false;

    mount$(0, (value) => {
      expect(value).toBe(true);
      mountCalled = true;
      checkDone();
    });

    unmount$(0, (value) => {
      expect(value).toBe(true);
      unmountCalled = true;
      checkDone();
    });

    update$(0, (value) => {
      expect(value).toHaveProperty('prevProps');
      expect(value).toHaveProperty('nextProps');
      updateCalled = true;
      checkDone();
    });

    component.mount();
    component.update({ newProp: 'test' });
    component.unmount();

    function checkDone() {
      if (mountCalled && unmountCalled && updateCalled) {
        done();
      }
    }
  });
});