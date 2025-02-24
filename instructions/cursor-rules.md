# ImagN Cursor Rules

## Overview
This document defines the comprehensive set of rules and patterns that must be followed when developing the ImagN application using Cursor IDE. These rules are designed to enforce consistent code quality, maintainable architecture, and optimal development practices.

## File Structure Rules

### Directory Organization
```
src/
├── components/          # UI Components
│   ├── common/         # Shared components
│   ├── image/          # Image generation components
│   ├── video/          # Video generation components
│   ├── node/           # Node editor components
│   └── workflow/       # Workflow management components
├── drivers/            # Cycle.js drivers
├── streams/            # Stream utilities and definitions
├── types/             # TypeScript type definitions
├── utils/             # Helper functions
├── constants/         # Application constants
├── styles/            # Global styles
├── ai/                # AI model integration
└── workflows/         # Workflow templates
```

### File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `ImageGenerator.tsx`)
- Streams: `camelCase.stream.ts` (e.g., `imageState.stream.ts`)
- Drivers: `camelCase.driver.ts` (e.g., `aiModel.driver.ts`)
- Tests: `*.test.ts` or `*.spec.ts`
- Styles: `camelCase.styles.ts`
- Types: `PascalCaseTypes.ts`
- Constants: `SCREAMING_SNAKE_CASE.constants.ts`

## Code Style Rules

### TypeScript Configuration
```typescript
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true
  }
}
```

### FRP Patterns

#### Stream Naming
- State streams: `*State$`
- Action streams: `*Action$`
- Event streams: `*Event$`
- Effect streams: `*Effect$`
- Query streams: `*Query$`
- Response streams: `*Response$`

#### Required Stream Patterns
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

## Component Rules

### Structure
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

### Props and State Types
```typescript
interface IComponentProps {
  // Props definition
}

interface IComponentState {
  // State definition
}

interface IComponentActions {
  // Actions definition
}
```

## Testing Rules

### Coverage Requirements
- Statements: 90%
- Branches: 85%
- Functions: 90%
- Lines: 90%

### Test Structure
```typescript
describe('Component:', () => {
  describe('Stream Management', () => {
    it('should handle stream lifecycle', () => {
      // Test implementation
    });
  });

  describe('Error Handling', () => {
    it('should recover from errors', () => {
      // Test implementation
    });
  });
});
```

## Documentation Rules

### Component Documentation
```typescript
/**
 * @description Component description
 * @param {Sources} sources - Component sources
 * @returns {Sinks} Component sinks
 * @example
 * ```typescript
 * const sinks = MyComponent(sources);
 * ```
 * @category UI Components
 */
```

### Stream Documentation
```typescript
/**
 * @stream State stream description
 * @type {Observable<StateType>}
 * @category State Management
 * @operators map, filter, merge
 * @cleanup Subscription disposal
 */
```

## Performance Rules

### Stream Optimization
- Maximum subscribers: 3
- Maximum operators in chain: 5
- Required cleanup handlers
- Memory management through proper unsubscribe

### Component Optimization
- Maximum cyclomatic complexity: 10
- Maximum nesting depth: 3
- Maximum parameters: 3
- Required memoization for expensive computations

### Bundle Size Limits
- Initial bundle: 200KB
- Chunk size: 50KB
- Minimum chunk: 10KB

## AI Integration Rules

### Model Management
```typescript
// Async loading
const model = await loadModel();

// Progress tracking
const progress$ = model.process$.pipe(
  map(progress => trackProgress(progress))
);

// Error handling
const result$ = model.execute$.pipe(
  timeout(30000),
  retry(3),
  catchError(handleModelError)
);
```

## Error Handling Rules

### Stream Error Handling
```typescript
const robust$ = stream$.pipe(
  catchError(error => {
    logError(error);
    return recoveryStream$;
  }),
  retryWhen(errors => errors.pipe(
    delay(1000),
    take(3)
  ))
);
```

### Component Error Boundaries
```typescript
function ErrorBoundary(error: Error) {
  logError(error);
  return fallbackView(error);
}
```

## Implementation Notes

1. Use ESLint with the provided configuration
2. Configure Jest for testing according to the rules
3. Set up TypeScript with strict mode
4. Implement pre-commit hooks for rule validation
5. Use automated tools for rule enforcement where possible

## Maintenance

These rules should be reviewed and updated as the project evolves. Any changes should be documented and communicated to the team. 