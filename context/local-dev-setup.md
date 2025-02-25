# Local Development Setup

## Prerequisites

- Node.js (v18.x or later)
- npm (v9.x or later)
- Git

## Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/imagn.git
   cd imagn
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
   
   > **Note**: The `--legacy-peer-deps` flag may be necessary to resolve any dependency conflicts, particularly with Material-UI packages.

## Environment Configuration

1. Create a `.env` file in the project root (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables as needed:
   ```
   VITE_API_URL=http://localhost:3000/api
   VITE_WEBSOCKET_URL=ws://localhost:3000/ws
   ```

## Available Scripts

### Development

- Start the development server:
  ```bash
  npm run dev
  ```
  This starts the development server at http://localhost:3004/

- Build the project:
  ```bash
  npm run build
  ```

- Preview the production build:
  ```bash
  npm run preview
  ```

### Testing

- Run tests:
  ```bash
  npm test
  ```

- Run tests with coverage:
  ```bash
  npm run test:coverage
  ```

### Linting and Formatting

- Lint the codebase:
  ```bash
  npm run lint
  ```

- Format the codebase:
  ```bash
  npm run format
  ```

## Project Structure

```
imagn/
├── public/            # Static assets
├── src/               # Source code
│   ├── components/    # React components
│   ├── streams/       # Stream definitions and operators
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── theme/         # Material-UI theme configuration
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── test/              # Test files
├── .env               # Environment variables
├── .gitignore         # Git ignore file
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## Key Dependencies

### Core
- React
- TypeScript
- Vite

### UI & Styling
- Material-UI (@mui/material)
- Material Icons (@mui/icons-material)
- Emotion (@emotion/react, @emotion/styled)

### Streaming & State Management
- xstream
- Cycle.js
- Callbags

### Testing
- Jest
- React Testing Library
- Jest DOM

## Material-UI Theme Setup

The application uses Material-UI with a custom dark theme. The theme is configured in `src/theme/darkTheme.ts`:

```typescript
// src/theme/darkTheme.ts
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
    },
    secondary: {
      main: '#10b981',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
    },
  },
  // Other theme options...
});

export default darkTheme;
```

This theme is applied at the root level in `src/main.tsx` using ThemeProvider:

```jsx
// src/main.tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import darkTheme from './theme/darkTheme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

## Common Issues and Solutions

### Dependency Conflicts

If you encounter dependency conflicts, particularly with React or Material-UI, try:

```bash
npm install --legacy-peer-deps
```

### Build Errors

If you encounter build errors related to TypeScript:

1. Check the TypeScript configuration in `tsconfig.json`
2. Ensure correct types are imported
3. Run `npm run build` with the `--verbose` flag to get more information

### Development Server Issues

If the development server fails to start:

1. Check if the port is already in use
2. Verify that all dependencies are installed
3. Check for errors in the terminal output
4. Try clearing the cache: `npm run clean:cache`

## Getting Help

If you encounter issues not covered here, please:

1. Check the project documentation
2. Review existing issues on GitHub
3. Reach out to the development team
4. Create a new issue with detailed information about the problem

## Contribution Guidelines

Before contributing, please:

1. Set up your development environment as described above
2. Familiarize yourself with the codebase and architecture
3. Follow the coding standards and guidelines
4. Write tests for your changes
5. Update documentation as needed

## License

This project is licensed under the [MIT License](LICENSE). 