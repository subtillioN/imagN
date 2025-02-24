# FRP Pattern Rules

## Stream Naming Conventions

### Required Suffixes
- State streams: `*State$`
- Action streams: `*Action$`
- Event streams: `*Event$`
- Effect streams: `*Effect$`
- Query streams: `*Query$`
- Response streams: `*Response$`

## Stream Patterns

### Required Patterns
```typescript
// Error handling
const safe$ = stream$.pipe(
  catchError(error => handleError(error)),
  timeout(5000),
  retry(3)
);

// Cleanup
const subscription = stream$.subscribe({
  next: value => handleValue(value),
  error: error => handleError(error),
  complete: () => cleanup()
});

// Type definition
type StreamType = {
  value: string;
  timestamp: number;
};
const typed$ = stream$.pipe(map((value): StreamType => ({
  value,
  timestamp: Date.now()
})));
```

### Required Features
- Error handling
- Completion handling
- Resource cleanup
- Type definitions

### Operator Usage
#### Preferred Operators
- `map`
- `filter`
- `merge`
- `combine`

#### Restricted Operators
- `subscribe`
- `tap`

## Component Structure

### Required Pattern
```typescript
function MyComponent(sources: Sources): Sinks {
  // Intent (User Actions)
  const intent = createIntent(sources);
  
  // Model (State Management)
  const model = createModel(intent);
  
  // View (Pure Render)
  const view = createView(model.state$);
  
  return {
    DOM: view.vtree$,
    HTTP: model.request$,
    state: model.state$
  };
}
```

### Required Functions
- `createIntent(sources)`
- `createModel(actions)`
- `view(state$)`

### Required Exports
- `DOM`
- `HTTP`
- `state$`

## Implementation Guidelines

1. All streams must follow naming conventions
2. Error handling must be implemented for all streams
3. Resource cleanup must be handled properly
4. Component structure must follow MVI pattern
5. Type safety must be maintained throughout 