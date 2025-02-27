# FRAOP-MVI Dev Tools

A comprehensive development tools suite for Functional Reactive Aspect-Oriented Programming (FRAOP) with Model-View-Intent (MVI) architecture.

## Features

### 🔍 Real-time Prop Analysis
- Track prop changes and patterns
- Identify performance bottlenecks
- Monitor render frequency
- Analyze prop value patterns

### 📊 Performance Monitoring
- Component render timing
- Prop update frequency
- Memory usage tracking
- Update cascading analysis

### 🎯 Optimization Recommendations
- Automatic memoization suggestions
- Component restructuring advice
- Prop usage optimization
- Real-time performance tips

### 🔧 Developer Tools
- Interactive visualization
- Component dependency graph
- Prop value inspector
- Performance timeline

## Installation

```bash
npm install --save-dev fraop-mvi-dev-tools
# or
yarn add -D fraop-mvi-dev-tools
```

## Quick Start

```typescript
import { initDevTools } from 'fraop-mvi-dev-tools';

if (process.env.NODE_ENV === 'development') {
  initDevTools({
    target: document.body,
    features: ['propAnalysis', 'performance', 'optimization']
  });
}
```

## Usage

### Basic Setup

```typescript
// In your app's entry point
import { initDevTools } from 'fraop-mvi-dev-tools';

initDevTools({
  target: document.body,
  features: ['propAnalysis', 'performance', 'optimization'],
  theme: 'dark',
  plugins: []
});
```

### Custom Plugin

```typescript
import { createPlugin } from 'fraop-mvi-dev-tools';

const customPlugin = createPlugin({
  name: 'custom-analyzer',
  hooks: {
    onAnalysis: (data) => {
      // Custom analysis logic
    },
    onRender: () => {
      // Custom UI component
      return <CustomView />;
    }
  }
});

initDevTools({
  plugins: [customPlugin]
});
```

## Configuration

### Options

```typescript
interface DevToolsConfig {
  // Required
  target: HTMLElement;        // Where to mount the dev tools
  
  // Optional
  features?: string[];       // Enabled features
  theme?: 'light' | 'dark'; // UI theme
  plugins?: Plugin[];       // Custom plugins
  position?: {             // DevTools window position
    x: number;
    y: number;
  };
}
```

### Features
- `propAnalysis`: Track and analyze component props
- `performance`: Monitor rendering performance
- `optimization`: Get optimization suggestions
- `visualization`: Show component relationships

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/subtillioN/FRAOP-MVI-Dev-Tools.git

# Install dependencies
npm install

# Start development
npm run dev
```

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run test`: Run tests
- `npm run lint`: Lint code
- `npm run format`: Format code

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation

- [API Reference](docs/api/README.md)
- [User Guide](docs/guides/README.md)
- [Plugin Development](docs/plugins/README.md)
- [Examples](docs/examples/README.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- [GitHub Issues](https://github.com/subtillioN/FRAOP-MVI-Dev-Tools/issues)
- [Documentation](https://fraop-mvi-dev-tools.dev)
- [Discord Community](https://discord.gg/fraop-mvi)

## Acknowledgments

- React DevTools for inspiration
- The React community
- All our contributors

## Roadmap

- [ ] Visual regression testing
- [ ] Performance regression detection
- [ ] AI-powered optimization suggestions
- [ ] Custom visualization plugins
- [ ] VS Code extension
- [ ] Chrome DevTools extension 