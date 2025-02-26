import { BaseComponent } from '../BaseComponent';

describe('BaseComponent', () => {
  let component;

  beforeEach(() => {
    component = new BaseComponent();
  });

  it('initializes with default state', () => {
    let value;
    component.subject.source(0, (type, data) => {
      if (type === 1) {
        value = data;
      }
    });

    expect(value).toEqual({});
  });

  it('setState updates state and emits changes', () => {
    let value;
    component.subject.source(0, (type, data) => {
      if (type === 1) {
        value = data;
      }
    });

    component.setState({ test: 'value' });
    expect(value).toEqual({ test: 'value' });
  });

  it('update method handles prop changes', () => {
    let value;
    component.lifecycle.update$.source(0, (type, data) => {
      if (type === 1) {
        value = data;
      }
    });

    component.update({ test: 'value' });
    expect(value).toEqual({ test: 'value' });
  });

  it('lifecycle streams emit correct values', () => {
    let mountValue, unmountValue, updateValue;

    component.lifecycle.mount$.source(0, (type, data) => {
      if (type === 1) {
        mountValue = true;
      }
    });

    component.lifecycle.unmount$.source(0, (type, data) => {
      if (type === 1) {
        unmountValue = true;
      }
    });

    component.lifecycle.update$.source(0, (type, data) => {
      if (type === 1) {
        updateValue = data;
      }
    });

    component.mount();
    expect(mountValue).toBe(true);

    component.update({ test: 'value' });
    expect(updateValue).toEqual({ test: 'value' });

    component.unmount();
    expect(unmountValue).toBe(true);
  });
});