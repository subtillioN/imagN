# Documentation Rules

## Component Documentation

### Required Tags
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

### Optional Tags
- `@see` - References to related components
- `@since` - Version introduced
- `@deprecated` - Deprecation notice

## Stream Documentation

### Required Tags
```typescript
/**
 * @stream State stream description
 * @type {Observable<StateType>}
 * @category State Management
 * @operators map, filter, merge
 * @cleanup Subscription disposal
 */
```

## Type Documentation

### Required Tags
```typescript
/**
 * @interface Interface description
 * @property {type} name - Property description
 * @typedef {type} Name - Type description
 */
```

## Diagram Standards

### Theme Configuration
```mermaid
%%{init: {'theme':'dark'}}%%
```

### Color Palette
- Primary: `#2f3545` (Desaturated Deep Blue-Gray)
- Secondary: `#3a4255` (Muted Medium Blue-Gray)
- Video: `#383344` (Desaturated Deep Purple-Gray)
- Workflow: `#4a4339` (Muted Deep Orange-Gray)

### Layout Guidelines
- Flow Direction: Top-Down
- Spacing: 1.5
- Alignment: Center

## Documentation Structure

### Component Files
1. File description
2. Import statements
3. Type definitions
4. Component documentation
5. Implementation
6. Export statement

### Stream Files
1. Stream description
2. Type definitions
3. Operator documentation
4. Implementation
5. Cleanup handling

### Type Files
1. Type description
2. Interface definitions
3. Type exports
4. Usage examples

## Best Practices

1. Keep documentation up to date
2. Use clear and concise descriptions
3. Include relevant examples
4. Document error cases
5. Maintain consistent formatting

## Implementation Guidelines

1. All public APIs must be documented
2. All components must have examples
3. All streams must document cleanup
4. All types must have descriptions
5. All diagrams must follow standards 