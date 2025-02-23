# Frontend Development Guidelines

## Core Principles

### 1. Model-View-Intent (MVI) Architecture
- **Model**: Pure state management through streams
  - Single source of truth
  - Immutable state updates
  - State history management

- **View**: Pure render functions
  - Declarative UI components
  - State-driven rendering
  - Composable view logic

- **Intent**: User action handlers
  - Action stream creation
  - Side effect management through drivers
  - Pure action-to-state transformations

### 2. Functional Reactive Programming
- Use Cycle.js for implementing MVI pattern
- Use callbags exclusively for reactive streams (no RxJS)
- Maintain pure functions throughout
- Handle side effects only through drivers
- Keep state management in streams

### 2. JavaScript Best Practices
- Use ES6+ features
- JSDoc for documentation
- Consistent naming conventions
- Proper error handling

### 3. Component Architecture
- Single responsibility principle
- Input/Output stream interfaces
- Isolated state management
- Composable design

## Code Organization

### 1. Project Structure
```
src/
  components/     # Reusable UI components
    common/       # Shared components
    image/        # Image generation components
    video/        # Video generation components
  drivers/        # Cycle.js drivers
  streams/        # Stream utilities
  types/          # TypeScript definitions
  utils/          # Pure utility functions
  constants/      # Application constants
  styles/         # Global styles
```

### 2. File Naming
- Component files: PascalCase.js
- Stream files: camelCase.stream.js
- Driver files: camelCase.driver.js
- Test files: *.test.js

## Coding Standards

### 1. Stream Naming
```javascript
// Stream names end with $
const click$ = xs.fromEvent(button, 'click')
const state$ = xs.of(initialState)

// Operator names are descriptive
const filteredClick$ = click$.filter(isValid)
const mappedState$ = state$.map(transform)
```

### 2. Component Structure (MVI Pattern)
```javascript
function MyComponent(sources) {
  // Intent (User Actions)
  const intent = {
    input$: sources.DOM.select('.input').events('input'),
    submit$: sources.DOM.select('.submit').events('click')
  }
  
  // Model (State Management)
  const model = {
    state$: intent.input$.map(processInput)
      .map(updateState)
      .startWith(initialState)
  }
  
  // View (Pure Render)
  const view = {
    vdom$: model.state$.map(state => renderView(state))
  }
  
  return {
    DOM: view.vdom$,
    HTTP: model.state$.map(createRequest)
  }
}
```

### 3. Error Handling
```javascript
// Stream error handling
const safe$ = stream$.catch(handleError)

// Proper error propagation
const errorState$ = stream$.map(processWithError)
```

## Testing Guidelines

### 1. Unit Tests
- Test pure functions thoroughly
- Use marble testing for streams
- Mock external dependencies
- Test error cases

### 2. Component Tests
```javascript
describe('Component', () => {
  it('should handle input streams', () => {
    // Setup test streams
    const input$ = xs.of(testData)
    
    // Assert output streams
    const output$ = component(input$)
    // Verify results
  })
})
```

## Performance Guidelines

### 1. Stream Optimization
- Use appropriate operators
- Implement proper cleanup
- Handle memory management
- Optimize re-renders

### 2. Resource Management
```typescript
// Proper resource cleanup
const subscription = stream$.subscribe({
  next: handleNext,
  error: handleError,
  complete: cleanup
})

// Dispose when done
subscription.unsubscribe()
```

## Documentation

### 1. Code Comments
```javascript
// Document complex stream operations
const processed$ = input$.pipe(
  // Transform input to required format
  map(transform),
  // Filter invalid states
  filter(isValid),
  // Combine with latest state
  withLatestFrom(state$)
)
```

### 2. Component Documentation
```javascript
/**
 * @description Handles image generation process
 * @param {Object} sources - Component sources
 * @returns {Object} Component sinks
 */
function ImageGenerator(sources) {
  // Implementation
}
```

## Development Workflow

### 1. Version Control
- Feature branches
- Meaningful commits
- PR reviews
- Clean history

### 2. Development Process
- Local development setup
- Testing workflow
- Code review guidelines
- Deployment process

## Best Practices

### 1. Stream Management
- Keep streams simple
- Proper error handling
- Memory management
- Performance optimization

### 2. Component Design
- Single responsibility
- Pure functions
- Proper typing
- Clear documentation