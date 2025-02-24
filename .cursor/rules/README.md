# ImagN Cursor Rules

This directory contains the Cursor IDE rules and configurations for the ImagN project. These rules enforce consistent code quality, maintainable architecture, and optimal development practices.

## Rule Categories

1. **File Structure** (`file-structure.json`)
   - Directory organization
   - File naming conventions
   - Component structure

2. **FRP Patterns** (`frp-patterns.json`)
   - Stream naming conventions
   - Required stream patterns
   - Component structure

3. **Testing** (`testing.json`)
   - Coverage requirements
   - Test structure
   - Mock conventions

4. **Documentation** (`documentation.json`)
   - Component documentation
   - Stream documentation
   - Type documentation
   - Diagram standards

5. **Performance** (`performance.json`)
   - Stream optimization
   - Component optimization
   - Bundle size limits
   - Performance monitoring

6. **AI Integration** (`ai-integration.json`)
   - Model management
   - State management
   - Error handling

7. **Error Handling** (`error-handling.json`)
   - Stream error handling
   - Component error boundaries
   - Logging standards

## Implementation

These rules are enforced through:

1. ESLint Configuration (`.eslintrc.js`)
2. TypeScript Configuration (`tsconfig.json`)
3. Jest Configuration (`jest.config.js`)
4. Prettier Configuration (`.prettierrc`)
5. Pre-commit Hooks (`.husky/pre-commit`)

## Usage

The rules are automatically enforced through:

1. IDE Integration
   - ESLint plugin
   - TypeScript plugin
   - Prettier plugin

2. Development Workflow
   - Pre-commit hooks
   - CI/CD pipeline
   - Development scripts

3. Documentation
   - JSDoc comments
   - Component documentation
   - Stream documentation

## Maintenance

These rules should be reviewed and updated as the project evolves. Any changes should be:

1. Documented in the relevant rule file
2. Updated in the main documentation
3. Communicated to the team
4. Reflected in the enforcement tools 