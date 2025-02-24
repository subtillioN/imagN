# Testing Rules

## Coverage Requirements

### Minimum Thresholds
- Statements: 90%
- Branches: 85%
- Functions: 90%
- Lines: 90%

## Testing Requirements

### Component Testing
- Unit tests required
- Integration tests required
- Stream tests required

### Stream Testing
- Marble tests required
- Error tests required
- Completion tests required

### Driver Testing
- Mock tests required
- Integration tests required

## Test Structure

### Test File Organization
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

### Naming Conventions

#### Describe Blocks
- Components: `^Component:`
- Streams: `^Stream:`
- Drivers: `^Driver:`
- Utils: `^Util:`

#### Test Files
- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

### Mock Conventions
- Naming pattern: `^mock[A-Z][a-zA-Z]*$`
- Location: `__mocks__/` directory

## Test Types

### Unit Tests
- Test individual functions
- Mock dependencies
- Focus on single responsibility

### Integration Tests
- Test component interactions
- Test stream combinations
- Minimal mocking

### E2E Tests
- Test complete workflows
- Test user interactions
- Real dependencies

## Implementation Guidelines

1. All components must have unit tests
2. All streams must have marble tests
3. All error cases must be tested
4. All mocks must follow naming convention
5. Coverage thresholds must be met

## Best Practices

1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Keep tests focused and simple
4. Clean up resources after tests
5. Use appropriate test doubles 