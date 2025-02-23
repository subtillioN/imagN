# ImagN: A Functional-Reactive AI Image/Video Generation Interface

## Tech Stack

### Core Technologies
- **Cycle.js** - Main framework for functional-reactive programming
- **Callbags** - Lightweight reactive streams implementation
- **JavaScript (ES6+)** - Modern JavaScript features for clean, maintainable code

### AI Integration
- **Stable Diffusion** - Open source image generation
- **ComfyUI** - Modular UI for AI workflows
- **ModelScope** - Video generation capabilities
- **Hugging Face Transformers** - For various AI model integrations

### Build Tools & Development
- **Vite** - Modern build tool and development server
- **ESLint** - Code quality and style enforcement
- **Prettier** - Code formatting
- **Jest** - Testing framework

## Architecture Principles

### 1. Pure Functional-Reactive Programming
- All side effects must be handled through Cycle.js drivers
- State management through streams only
- No imperative code or direct DOM manipulation
- Pure functions as the building blocks

### 2. Stream-Based Architecture
- Use callbags for all async operations
- Unidirectional data flow
- Event streams for user interactions
- State streams for application data

### 3. Component Structure
- Isolated components with clear input/output streams
- No shared state between components
- Composition through stream operators
- Clear separation of concerns

### 4. AI Integration Guidelines
- Model loading and inference through dedicated drivers
- Streaming progress updates
- Cancellable operations
- Error handling through stream operators

## Development Guidelines

### Code Organization
```
src/
  drivers/        # Cycle.js drivers for side effects
  components/     # Reusable UI components
  ai/             # AI model integrations
  streams/        # Stream utilities and operators
  utils/          # Pure utility functions
  main.js         # Application entry point
```

### Naming Conventions
- Streams end with '$': `clicks$`, `state$`
- Drivers end with 'Driver': `aiDriver`
- Components are PascalCase: `ImageGenerator`
- Stream operators are camelCase: `withLatestFrom`

### Testing Requirements
- Unit tests for all pure functions
- Stream marble testing for operators
- Integration tests for drivers
- Component tests with simulated streams

### Performance Considerations
- Lazy evaluation of streams
- Proper stream cleanup
- Memory leak prevention
- Efficient model loading and caching

## Getting Started

1. Install dependencies
2. Set up development environment
3. Configure AI models
4. Start development server

## Contributing

1. Follow FRP principles strictly
2. Write tests for new features
3. Document stream flows
4. Maintain pure functions

## Resources

- Cycle.js documentation
- Callbags specification
- FRP learning materials
- AI model documentation