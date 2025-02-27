import { renderHook, act } from '@testing-library/react';
import { useBaseComponent } from '../useBaseComponent';
import { isSome, Some } from '../../utils/option';
import { BaseComponentState, StreamSource } from '../../types/functional';

describe('useBaseComponent', () => {
  type TestState = {
    count: number;
    text: string;
  };

  type TestProps = {
    onEvent?: (event: string, data: unknown) => void;
    value?: number;
  };

  const initialState: TestState = {
    count: 0,
    text: ''
  };

  it('should initialize with the provided state', () => {
    const { result } = renderHook(() => useBaseComponent<TestState, TestProps>(initialState));
    expect(result.current.state).toEqual(initialState);
  });

  it('should update state immutably', () => {
    const { result } = renderHook(() => useBaseComponent<TestState, TestProps>(initialState));

    act(() => {
      result.current.updateState({ count: 1 });
    });

    expect(result.current.state).toEqual({ ...initialState, count: 1 });
    expect(result.current.state).not.toBe(initialState); // Ensure new reference
  });

  it('should handle lifecycle events', () => {
    const mountSpy = jest.fn();
    const unmountSpy = jest.fn();

    const { result, unmount } = renderHook(() => {
      const hook = useBaseComponent<TestState, TestProps>(initialState);
      
      // Subscribe to lifecycle events
      hook.subscribeToLifecycle('mount$', mountSpy);
      hook.subscribeToLifecycle('unmount$', unmountSpy);
      
      return hook;
    });

    expect(mountSpy).toHaveBeenCalledWith(true);
    
    unmount();
    
    expect(unmountSpy).toHaveBeenCalledWith(true);
  });

  it('should handle stream subscriptions', () => {
    const stateSpy = jest.fn();
    const { result } = renderHook(() => useBaseComponent<TestState, TestProps>(initialState));

    // Subscribe to state changes
    result.current.subscribe(stateSpy);

    act(() => {
      result.current.updateState({ count: 1 });
    });

    expect(stateSpy).toHaveBeenCalledWith({ ...initialState, count: 1 });
  });

  it('should handle props updates', () => {
    const updateSpy = jest.fn();
    
    const { result } = renderHook(() => {
      const hook = useBaseComponent<TestState, TestProps>(initialState);
      hook.subscribeToLifecycle('update$', updateSpy);
      return hook;
    });

    act(() => {
      result.current.updateProps({ value: 42 });
    });

    expect(result.current.props).toEqual({ value: 42 });
    expect(updateSpy).toHaveBeenCalledWith(true);
  });

  it('should emit events', () => {
    const eventSpy = jest.fn();
    
    const { result } = renderHook(() => {
      const hook = useBaseComponent<TestState, TestProps>(initialState);
      hook.updateProps({ onEvent: eventSpy });
      return hook;
    });

    act(() => {
      result.current.emit('test', { value: 42 });
    });

    expect(eventSpy).toHaveBeenCalledWith('test', { value: 42 });
  });

  it('should maintain referential integrity of functions', () => {
    const { result, rerender } = renderHook(() => useBaseComponent<TestState, TestProps>(initialState));
    
    const firstUpdateState = result.current.updateState;
    const firstSubscribe = result.current.subscribe;
    
    rerender();
    
    expect(result.current.updateState).toBe(firstUpdateState);
    expect(result.current.subscribe).toBe(firstSubscribe);
  });

  it('should handle cleanup properly', () => {
    const { result, unmount } = renderHook(() => useBaseComponent<TestState, TestProps>(initialState));
    const unsubscribeSpy = jest.fn();
    
    result.current.subscribe(() => {});
    
    unmount();
    
    // Verify that subject exists and is a valid stream source
    expect(typeof result.current.subject.source).toBe('function');
    expect(typeof result.current.subject.update).toBe('function');
  });
}); 