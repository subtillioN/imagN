# imagN Dev Tools Integration

## Overview

This document outlines how imagN integrates with the FRAOP-MVI-Dev-Tools package for development and debugging purposes. The integration provides real-time monitoring, performance analysis, and optimization suggestions for the application.

## Integration Setup

### 1. Installation

```bash
npm install fraop-mvi-dev-tools --save-dev
```

### 2. Basic Configuration

```typescript
// src/dev-tools/config.ts
import { DevToolsConfig } from 'fraop-mvi-dev-tools';

export const devToolsConfig: DevToolsConfig = {
  features: [
    'monitoring',
    'optimization',
    'analysis'
  ],
  theme: 'dark',
  position: {
    x: 'right',
    y: 0
  }
};
```

### 3. Initialization

```typescript
// src/dev-tools/init.ts
import { initDevTools } from 'fraop-mvi-dev-tools';
import { devToolsConfig } from './config';

export function setupDevTools() {
  if (process.env.NODE_ENV === 'development') {
    const target = document.createElement('div');
    target.id = 'dev-tools-root';
    document.body.appendChild(target);

    initDevTools({
      ...devToolsConfig,
      target
    });
  }
}
```

## Component Integration

### 1. HOC Usage

```typescript
// src/components/withDevTools.tsx
import { withPropTracking } from 'fraop-mvi-dev-tools';

export function withDevTools<P extends object>(
  Component: React.ComponentType<P>,
  options = {}
) {
  if (process.env.NODE_ENV === 'development') {
    return withPropTracking(Component, {
      ...options,
      trackChildren: true
    });
  }
  return Component;
}
```

### 2. Component Implementation

```typescript
// src/components/ImageWorkflow.tsx
import { withDevTools } from './withDevTools';

const ImageWorkflow: React.FC<WorkflowProps> = (props) => {
  // Component implementation
};

export default withDevTools(ImageWorkflow, {
  name: 'ImageWorkflow',
  trackUpdates: true
});
```

## Performance Monitoring

### 1. Custom Metrics

```typescript
// src/dev-tools/metrics.ts
import { registerMetric } from 'fraop-mvi-dev-tools';

export function setupCustomMetrics() {
  registerMetric('imageProcessingTime', {
    label: 'Image Processing Time',
    unit: 'ms',
    threshold: 100
  });
}
```

### 2. Usage in Components

```typescript
// src/components/ImageProcessor.tsx
import { trackMetric } from 'fraop-mvi-dev-tools';

function processImage(data: ImageData) {
  const start = performance.now();
  // Processing logic
  const duration = performance.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    trackMetric('imageProcessingTime', duration);
  }
}
```

## Debug Features

### 1. Component Debugging

```typescript
// src/components/Debug.tsx
import { useDebugger } from 'fraop-mvi-dev-tools';

export function DebugPanel() {
  const debug = useDebugger();

  return process.env.NODE_ENV === 'development' ? (
    <div className="debug-panel">
      <button onClick={() => debug.inspectComponent('ImageWorkflow')}>
        Debug Workflow
      </button>
    </div>
  ) : null;
}
```

### 2. Performance Testing

```typescript
// src/tests/performance.test.ts
import { measurePerformance } from 'fraop-mvi-dev-tools/testing';

describe('ImageWorkflow Performance', () => {
  it('should process images efficiently', async () => {
    const metrics = await measurePerformance(() => {
      // Test implementation
    });

    expect(metrics.renderTime).toBeLessThan(16);
    expect(metrics.memoryUsage).toBeLessThan(50 * 1024 * 1024);
  });
});
```

## Production Considerations

### 1. Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.ENABLE_DEV_TOOLS': JSON.stringify(
      process.env.NODE_ENV === 'development'
    )
  },
  build: {
    rollupOptions: {
      external: process.env.NODE_ENV === 'production' 
        ? ['fraop-mvi-dev-tools']
        : []
    }
  }
});
```

### 2. Tree Shaking

```typescript
// src/utils/dev-tools.ts
export const isDevToolsEnabled = 
  process.env.NODE_ENV === 'development' &&
  process.env.ENABLE_DEV_TOOLS === 'true';

export function initializeDevTools() {
  if (isDevToolsEnabled) {
    return import('../dev-tools/init').then(m => m.setupDevTools());
  }
  return Promise.resolve();
}
```

## Error Handling

### 1. Development Errors

```typescript
// src/dev-tools/error-boundary.tsx
import { DevToolsErrorBoundary } from 'fraop-mvi-dev-tools';

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  if (process.env.NODE_ENV === 'development') {
    return (props: P) => (
      <DevToolsErrorBoundary>
        <Component {...props} />
      </DevToolsErrorBoundary>
    );
  }
  return Component;
}
```

### 2. Error Reporting

```typescript
// src/utils/error-handler.ts
import { reportError } from 'fraop-mvi-dev-tools';

export function handleError(error: Error) {
  if (process.env.NODE_ENV === 'development') {
    reportError(error);
  }
  // Production error handling
}
```

## Testing Integration

### 1. Test Setup

```typescript
// src/tests/setup.ts
import { setupTestEnvironment } from 'fraop-mvi-dev-tools/testing';

beforeAll(() => {
  setupTestEnvironment({
    mockPerformance: true,
    recordMetrics: true
  });
});
```

### 2. Integration Tests

```typescript
// src/tests/dev-tools.test.ts
import { DevToolsTestHelper } from 'fraop-mvi-dev-tools/testing';

describe('Dev Tools Integration', () => {
  let helper: DevToolsTestHelper;

  beforeEach(() => {
    helper = new DevToolsTestHelper();
  });

  it('should track component updates', async () => {
    const metrics = await helper.trackUpdates(() => {
      // Test implementation
    });

    expect(metrics.updateCount).toBeGreaterThan(0);
  });
});
``` 