# Architectural Rules and Enforcement

## Core Principle: Strict Separation of Concerns

The most fundamental architectural rule in this project is the strict separation between the main application (imagN) and development tools (FRAOP-MVI-Dev-Tools). This separation is **non-negotiable** and automatically enforced.

## Module Structure

```
Project Root
├── imagN/                      # Main Application
│   ├── src/                    # Application source
│   │   ├── components/        # Application components ONLY
│   │   └── integration/       # Integration points with external modules
│   └── ...
│
└── FRAOP-MVI-Dev-Tools/       # Development Tools Module
    ├── src/
    │   ├── core/             # Analysis engine
    │   ├── components/       # Dev tools UI components
    │   └── services/         # Dev tools services
    └── ...
```

## Architectural Rules

### 1. Location Rule
- ✅ All dev tools code MUST reside in the FRAOP-MVI-Dev-Tools module
- ❌ NO dev tools code is allowed in the main application
- ❌ NO dev tools files or folders at project root

### 2. Dependency Rules
- ✅ Main app can ONLY import from 'fraop-mvi-dev-tools' package
- ❌ NO direct imports from dev tools implementation files
- ❌ NO circular dependencies between modules

### 3. Integration Rules
- ✅ Use ONLY the public API exposed by fraop-mvi-dev-tools
- ❌ NO custom dev tools implementations in main app
- ❌ NO copying of dev tools code into main app

## Enforcement

### 1. Pre-commit Validation
Every commit is automatically checked for:
- Dev tools code location
- Import patterns
- Architectural violations

### 2. Continuous Integration
The CI pipeline includes:
- Architectural validation
- Dependency checks
- Module boundary verification

### 3. Development Time Validation
- TypeScript enforced module boundaries
- ESLint rules for imports
- Runtime validation in development mode

## Example: Correct Integration

```typescript
// ✅ CORRECT: Import from package
import { DevToolsButton, DevToolsPanel } from 'fraop-mvi-dev-tools';

// ❌ WRONG: Direct import from implementation
import { DevToolsButton } from './components/DevToolsButton';

// ❌ WRONG: Custom implementation in main app
const DevToolsButton = () => { ... };
```

## Validation Commands

```bash
# Run architectural validation
npm run validate:architecture

# Run full pre-commit checks
npm run precommit
```

## Error Messages

When you violate architectural rules, you'll see clear error messages:

```
ERROR: Dev tools files found outside FRAOP-MVI-Dev-Tools module
File: src/components/DevToolsButton.tsx
Message: Dev tools code must be in FRAOP-MVI-Dev-Tools module

ERROR: Invalid dev tools import
File: src/App.tsx
Line: 4
Message: Use 'fraop-mvi-dev-tools' package instead
```

## Why So Strict?

1. **Clean Architecture**
   - Clear module boundaries
   - Single responsibility principle
   - Proper dependency direction

2. **Maintainability**
   - No scattered implementations
   - Clear integration points
   - Consistent patterns

3. **Scalability**
   - Independent module evolution
   - Clear upgrade paths
   - Proper versioning

4. **Testing**
   - Isolated test environments
   - Clear component boundaries
   - Proper mocking points

## Contributing

1. **Adding Dev Tools Features**
   - Add to FRAOP-MVI-Dev-Tools module
   - Update public API if needed
   - Update integration documentation

2. **Using Dev Tools**
   - Import only from package
   - Use only public API
   - Follow integration patterns

3. **Modifying Architecture**
   - Discuss in architecture review
   - Update validation rules
   - Update documentation

## Remember

The separation between application and development tools is a fundamental architectural principle. It is not a suggestion or guideline - it is a strict rule that is automatically enforced. Any attempt to circumvent this will be caught by the validation system. 