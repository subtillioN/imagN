# Initial Repository Setup

## Repository Structure
```
fraop-mvi-dev-tools/
├── .github/                    # GitHub specific files
│   ├── workflows/             # GitHub Actions workflows
│   └── ISSUE_TEMPLATE/        # Issue templates
├── src/                       # Source code
│   ├── components/            # React components
│   ├── core/                  # Core functionality
│   ├── hooks/                # React hooks
│   ├── utils/                # Utility functions
│   └── index.ts              # Main entry point
├── tests/                     # Test files
│   ├── __fixtures__/         # Test fixtures
│   ├── __mocks__/            # Test mocks
│   └── __utils__/            # Test utilities
├── docs/                      # Documentation
│   ├── api/                  # API documentation
│   ├── guides/              # User guides
│   └── examples/            # Example code
├── scripts/                   # Build and utility scripts
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier configuration
├── jest.config.js            # Jest configuration
├── package.json              # Package manifest
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## Initial Dependencies

### Production Dependencies
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "recharts": "^2.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.0.0",
    "@types/jest": "^27.0.0",
    "typescript": "^4.5.0",
    "eslint": "^8.0.0",
    "prettier": "^2.0.0",
    "rollup": "^2.0.0",
    "@rollup/plugin-typescript": "^8.0.0",
    "@rollup/plugin-node-resolve": "^13.0.0",
    "@rollup/plugin-commonjs": "^21.0.0"
  }
}
```

## Configuration Files

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "esnext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "declaration": true,
    "declarationDir": "dist/types",
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

### ESLint Configuration (.eslintrc.js)
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
```

### Prettier Configuration (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Jest Configuration (jest.config.js)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/__utils__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Rollup Configuration (rollup.config.js)
```javascript
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  external: ['react', 'react-dom', 'recharts'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types'
    }),
    resolve(),
    commonjs(),
    terser()
  ]
};
```

## GitHub Actions Workflow (.github/workflows/ci.yml)
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]

    steps:
    - uses: actions/checkout@v2
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}
        
    - name: Install dependencies
      run: npm ci
      
    - name: Lint
      run: npm run lint
      
    - name: Test
      run: npm test
      
    - name: Build
      run: npm run build
```

## Next Steps
1. Create repository at github.com/subtillioN/FRAOP-MVI-Dev-Tools
2. Clone repository locally
3. Create the directory structure
4. Add configuration files
5. Install dependencies
6. Set up GitHub Actions
7. Add initial documentation 