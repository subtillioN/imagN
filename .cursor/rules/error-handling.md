# Error Handling Rules

## Stream Error Handling

### Required Patterns
```typescript
// Basic error handling
const safe$ = stream$.pipe(
  catchError(error => {
    logError(error);
    return recoveryStream$;
  })
);

// Retry with backoff
const robust$ = stream$.pipe(
  retryWhen(errors => errors.pipe(
    delay(1000),
    take(3)
  ))
);

// Timeout handling
const timely$ = stream$.pipe(
  timeout(5000),
  catchError(error => handleTimeoutError(error))
);
```

### Recovery Patterns
- `recoverWith` - Provide alternative stream
- `defaultIfEmpty` - Default value on empty

## Component Error Handling

### Error Boundaries
```typescript
function ErrorBoundary(error: Error) {
  // Required: Log error
  logError(error);
  
  // Required: Report error
  reportError(error);
  
  // Required: Show fallback
  return fallbackView(error);
}
```

### User Feedback
- Clear error messages required
- Actionable recovery steps
- User-friendly explanations

## Logging Standards

### Log Levels
1. Error - Critical failures
2. Warn - Potential issues
3. Info - Important events
4. Debug - Development details

### Context Requirements
```typescript
// Required context in logs
const errorContext = {
  stack: error.stack,
  state: currentState,
  action: triggeredAction
};

logger.error('Operation failed', errorContext);
```

## Implementation Guidelines

### Stream Error Handling
```typescript
// Complete error handling pattern
const completeErrorHandling$ = stream$.pipe(
  // Timeout protection
  timeout(5000),
  
  // Retry strategy
  retry(3),
  
  // Error recovery
  catchError(error => {
    // Log error
    logError(error);
    
    // Report error
    reportError(error);
    
    // Recover or rethrow
    return error.isRecoverable
      ? recoveryStream$
      : throwError(error);
  }),
  
  // Cleanup
  finalize(() => cleanup())
);
```

### Component Error Handling
```typescript
function SafeComponent(props: Props) {
  try {
    // Component logic
    return <Component {...props} />;
  } catch (error) {
    // Log error
    logError(error);
    
    // Show user feedback
    return <ErrorView error={error} />;
  }
}
```

## Best Practices

1. Always handle stream errors
2. Provide clear user feedback
3. Log with proper context
4. Implement retry strategies
5. Clean up resources

## Error Categories

### Stream Errors
- Timeout errors
- Network errors
- Processing errors
- Resource errors

### Component Errors
- Rendering errors
- State errors
- Prop errors
- Lifecycle errors

### System Errors
- Memory errors
- Resource exhaustion
- External service errors
- Configuration errors

## Testing Requirements

### Error Test Cases
- Timeout scenarios
- Network failures
- Resource exhaustion
- Invalid inputs

### Recovery Test Cases
- Retry success
- Fallback behavior
- Resource cleanup
- State recovery 