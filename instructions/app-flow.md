# Application Flow

## Overview

This document outlines the application flow for ImagN, a reactive web application for AI-powered image and video generation. The application follows a Model-View-Intent (MVI) architecture pattern integrated with Material-UI components for a consistent and responsive user interface.

## Core Architecture

The application uses a combination of:
- **React** as the view layer
- **Material-UI** for UI components and theming
- **Reactive streams** for state management and data flow

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│     INTENT      │──────▶│      MODEL      │──────▶│      VIEW       │
│  (User Events)  │       │  (Data Logic)   │       │  (MUI/React)    │
│                 │       │                 │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        ▲                                                   │
        │                                                   │
        └───────────────────────────────────────────────────┘
```

## Application Entry Points

### 1. Main Entry (main.tsx)

The main entry point sets up:
- Material-UI ThemeProvider with custom dark theme
- Root component rendering
- Stream initialization

```jsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
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

### 2. App Component (App.tsx)

```jsx
// App.tsx
import React from 'react';
import { Box } from '@mui/material';
import MainView from './components/MainView';
import DevToolsButton from './components/DevToolsButton';

function App() {
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <MainView />
      <DevToolsButton />
    </Box>
  );
}

export default App;
```

## Key Component Flows

### 1. Main View Flow

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│   MainView      │──────▶│  ImageEditor    │──────▶│  ResultsView    │
│  (Container)    │       │  (User Input)   │       │  (Output)       │
│                 │       │                 │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                  │
                                  ▼
                          ┌─────────────────┐
                          │                 │
                          │   Parameters    │
                          │  (Controls)     │
                          │                 │
                          └─────────────────┘
```

### 2. Developer Tools Flow

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│ DevToolsButton  │──────▶│  DevToolsPanel  │──────▶│ FeatureAnalysis │
│  (Trigger)      │       │  (Container)    │       │   (Metrics)     │
│                 │       │                 │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                  │
                                  ▼
                          ┌─────────────────┐
                          │                 │
                          │ TaskProgress    │
                          │ (Visualization) │
                          │                 │
                          └─────────────────┘
```

## Data Flow

### 1. User Interaction Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  User       │────▶│  UI Events  │────▶│  Streams    │────▶│  State      │
│  Action     │     │  (Intent)   │     │  (Model)    │     │  Update     │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Rendered   │◀────│  React      │◀────│  Virtual    │◀────│  View       │
│  UI         │     │  Components │     │  DOM        │     │  Updates    │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 2. API Interaction Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  UI         │────▶│  API        │────▶│  Backend    │────▶│  AI         │
│  Request    │     │  Client     │     │  Processing │     │  Model      │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  UI         │◀────│  State      │◀────│  Stream     │◀────│  Result     │
│  Update     │     │  Update     │     │  Update     │     │  Data       │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Component Implementation Examples

### MainView Component

```jsx
// src/components/MainView.tsx
import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

export default function MainView() {
  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ImagN
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          AI-Powered Image and Video Generation
        </Typography>
        <Box sx={{ mt: 4 }}>
          {/* Content components will be placed here */}
        </Box>
      </Paper>
    </Container>
  );
}
```

### DevToolsButton Component

```jsx
// src/components/DevToolsButton.tsx
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

export default function DevToolsButton() {
  return (
    <Tooltip title="Developer Tools - Task & Feature Analysis" arrow placement="left">
      <IconButton
        aria-label="Developer Tools"
        color="primary"
        sx={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.3)',
          },
          boxShadow: '0 0 8px rgba(59, 130, 246, 0.2)',
        }}
      >
        <SettingsIcon />
      </IconButton>
    </Tooltip>
  );
}
```

## User Journey

1. **Application Load**
   - Theme provider initializes with dark theme
   - Main components render
   - DevTools button appears in the upper-right corner

2. **Image Generation**
   - User selects image generation tab
   - Parameters are configured using MUI form components
   - Generation request is sent through streams
   - Progress feedback is displayed with MUI progress components
   - Results are displayed in a responsive grid layout

3. **Video Generation**
   - User selects video generation tab
   - Frame parameters are configured
   - Video processing request is initiated
   - Real-time progress is tracked
   - Preview is displayed in a video player component

4. **Developer Tools**
   - User clicks DevToolsButton in the upper-right corner
   - Tools panel slides in from the right using MUI Drawer
   - Task progress and feature analysis are displayed
   - User can interact with visualization components
   - Panel can be closed by clicking outside or the close button

## Key UI Components

### Layout Components
- **Container**: Main content wrapper
- **Grid**: Responsive layout system
- **Box**: Flexible layout component
- **Paper**: Container with elevation

### Input Components
- **TextField**: Text inputs
- **Slider**: Range inputs
- **Select**: Dropdown selection
- **Switch**: Toggle switches
- **Checkbox**: Boolean inputs
- **RadioGroup**: Option selection

### Display Components
- **Typography**: Text display
- **Card**: Content containers
- **List**: Organized content
- **Table**: Tabular data
- **Divider**: Content separation

### Feedback Components
- **Dialog**: Modal windows
- **Snackbar**: Notifications
- **Alert**: Status messaging
- **Progress**: Loading indicators
- **Tooltip**: Contextual help

## Application State

State is managed through a combination of:
1. **Local Component State**: Using React's useState for UI-specific state
2. **Reactive Streams**: For application-wide state and data flow
3. **MUI Theme**: For consistent styling and theming

## Error Handling Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Error      │────▶│  Stream     │────▶│  Error      │────▶│  UI Error   │
│  Occurrence │     │  Operator   │     │  Handler    │     │  Component  │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Theming System

The application uses Material-UI's theming system with a custom dark theme:

```jsx
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
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default darkTheme;
```

## Conclusion

This application flow document serves as a reference for understanding how the ImagN application is structured and how its components interact. The application combines the reactive programming paradigm with Material-UI to create a responsive, accessible, and visually consistent user interface.