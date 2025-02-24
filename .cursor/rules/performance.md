# Performance Rules

## Stream Optimization

### Subscriber Limits
- Maximum subscribers: 3
- Maximum operators in chain: 5

### Resource Management
```typescript
// Required cleanup pattern
const subscription = stream$.subscribe({
  next: value => handleValue(value),
  error: error => handleError(error),
  complete: () => cleanup()
});

// Proper disposal
subscription.unsubscribe();
```

### Memory Management
- Unsubscribe from all subscriptions
- Complete streams when done
- Dispose of resources properly

## Component Optimization

### Complexity Limits
- Maximum cyclomatic complexity: 10
- Maximum nesting depth: 3
- Maximum parameters: 3

### Required Optimizations
- Memoization for expensive computations
- Lazy loading for heavy components
- Code sharing for common functionality

## Bundle Size Management

### Size Limits
- Initial bundle: 200KB
- Maximum chunk size: 50KB
- Minimum chunk size: 10KB

### Optimization Techniques
1. Code splitting
2. Tree shaking
3. Lazy loading
4. Dynamic imports

## Performance Monitoring

### Metrics
- FPS (Frames Per Second)
- Memory usage
- Load time
- Time to First Byte (TTFB)

### Thresholds
- FPS: 60
- Memory: 100MB
- Load time: 2s
- TTFB: 200ms

## Implementation Guidelines

### Stream Performance
```typescript
// Efficient stream usage
const efficient$ = stream$.pipe(
  filter(predicate),
  map(transform),
  take(1)
);

// Memory leak prevention
useEffect(() => {
  const subscription = stream$.subscribe();
  return () => subscription.unsubscribe();
}, []);
```

### Component Performance
```typescript
// Memoization example
const memoizedValue = useMemo(() => {
  return expensiveComputation(props);
}, [props.id]);

// Lazy loading example
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

## Best Practices

1. Monitor performance metrics regularly
2. Optimize critical rendering paths
3. Implement proper cleanup
4. Use appropriate caching strategies
5. Profile performance bottlenecks

## Performance Testing

### Required Tests
- Load testing
- Memory leak testing
- Performance regression testing
- Bundle size monitoring

### Tools
- Chrome DevTools
- Lighthouse
- Bundle analyzer
- Memory profiler 