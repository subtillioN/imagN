# Frontend Development Guidelines

## Core Principles

### 1. Component-Based Architecture with Material-UI
- **Material Design**: Follow Google's Material Design guidelines
- **MUI Components**: Use Material-UI components for UI elements
- **Theme Customization**: Use the theme system for consistent styling
- **Multiple Themes**: Support theme variants (dark, high contrast, neon, minimal)
- **Responsive Design**: Implement responsive layouts using MUI Grid system
- **Accessibility**: Ensure all components meet accessibility standards

### 2. Model-View-Intent (MVI) Architecture
- **Model**: Pure state management through streams
  - Single source of truth
  - Immutable state updates
  - State history management

- **View**: Pure render functions with Material-UI
  - Declarative UI components using MUI
  - State-driven rendering
  - Composable view logic

- **Intent**: User action handlers
  - Action stream creation
  - Side effect management through drivers
  - Pure action-to-state transformations

### 3. Functional Reactive Programming
- Use Cycle.js for implementing MVI pattern
- Use callbags exclusively for reactive streams (no RxJS)
- Maintain pure functions throughout
- Handle side effects only through drivers
- Keep state management in streams

### 4. Material-UI Best Practices
- Use MUI theme system for consistent styling
- Leverage CSS-in-JS with Emotion
- Use the sx prop for component-specific styling
- Extend theme for custom components
- Maintain consistent spacing using theme.spacing
- Implement dark theme with appropriate contrast

### 5. JavaScript/TypeScript Best Practices
- Use TypeScript for type safety
- ES6+ features for clean code
- JSDoc for documentation
- Consistent naming conventions
- Proper error handling

## Component Architecture

### 1. Material-UI Component Structure
```jsx
// Example of a properly structured MUI component
function CustomCard({ title, content, actions }) {
  return (
    <Card sx={{ maxWidth: 345, mb: 2 }}>
      <CardHeader title={title} />
      <CardContent>
        <Typography variant="body2">{content}</Typography>
      </CardContent>
      <CardActions>
        {actions}
      </CardActions>
    </Card>
  );
}
```

### 2. Theme Usage
```jsx
// Accessing theme in components
import { useTheme } from '@mui/material/styles';

function ThemedComponent() {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        p: theme.spacing(2),
        borderRadius: theme.shape.borderRadius
      }}
    >
      Content
    </Box>
  );
}
```

### 3. Responsive Design
```jsx
// Grid system for responsive layouts
<Grid container spacing={2}>
  <Grid item xs={12} md={6} lg={4}>
    <ComponentA />
  </Grid>
  <Grid item xs={12} md={6} lg={4}>
    <ComponentB />
  </Grid>
  <Grid item xs={12} md={6} lg={4}>
    <ComponentC />
  </Grid>
</Grid>
```

## Code Organization

### 1. Project Structure
```
src/
  components/     # Reusable UI components
    common/       # Shared components
    image/        # Image generation components
    video/        # Video generation components
    DevTools/     # Developer tools components
  drivers/        # Cycle.js drivers
  streams/        # Stream utilities
  types/          # TypeScript definitions
  utils/          # Pure utility functions
  constants/      # Application constants
  theme/          # Material-UI theme configuration
  styles/         # Global styles
```

### 2. File Naming
- Component files: PascalCase.tsx
- Stream files: camelCase.stream.ts
- Driver files: camelCase.driver.ts
- Test files: *.test.tsx
- Theme files: camelCase.theme.ts

## Styling Guidelines

### 1. Theme-Based Styling
```jsx
// Use theme-based styling for consistency
<Button 
  variant="contained" 
  color="primary"
  sx={{
    mt: 2,
    mb: 2,
    borderRadius: 1
  }}
>
  Submit
</Button>
```

### 2. Multiple Theme Support
```jsx
// src/components/ThemeProvider.tsx
import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme, contrastTheme, neonTheme, minimalTheme } from '../theme';

export const AppThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(darkTheme);
  
  // Theme context provides theme switching functionality
  
  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
```

### 3. Responsive Styling
```jsx
// Responsive styling with breakpoints
<Box
  sx={{
    width: '100%',
    p: 2,
    [theme.breakpoints.up('md')]: {
      width: '75%',
      p: 3,
    },
    [theme.breakpoints.up('lg')]: {
      width: '50%',
      p: 4,
    },
  }}
>
  Content
</Box>
```

### 4. Custom Component Styling
```jsx
// Creating styled components
import { styled } from '@mui/material/styles';

const CustomBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));
```

## Stream Integration with React Components

### 1. Component with Stream Integration
```jsx
function StreamComponent(props) {
  // Use React state for UI
  const [data, setData] = React.useState(initialState);
  
  // Setup streams for data flow
  React.useEffect(() => {
    const subscription = stream$.subscribe({
      next: newData => setData(newData)
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Render with Material-UI
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{data.title}</Typography>
        <Typography variant="body2">{data.content}</Typography>
      </CardContent>
    </Card>
  );
}
```

## Performance Guidelines

### 1. MUI Component Optimization
- Use React.memo for pure components
- Avoid inline style objects
- Use proper keys for lists
- Implement virtualization for long lists with `react-window`
- Use `Box` component instead of divs for theme integration

### 2. Stream Optimization
- Use appropriate operators
- Implement proper cleanup
- Handle memory management
- Optimize re-renders

## Accessibility

### 1. Material-UI Accessibility
```jsx
// Proper accessibility with Material-UI
<Button
  aria-label="Add new item"
  startIcon={<AddIcon />}
>
  Add Item
</Button>

<IconButton
  aria-label="Developer Tools"
  tooltip="Developer Tools - Task & Feature Analysis"
>
  <SettingsIcon />
</IconButton>
```

### 2. Color Contrast
- Ensure sufficient contrast in the theme
- Use accessible color combinations
- Test with assistive technologies

## Development Workflow

### 1. Component Development Process
1. Define component requirements
2. Create TypeScript interfaces
3. Implement component using Material-UI
4. Add stream integration (if needed)
5. Write tests
6. Document component usage

### 2. Best Practices
- Keep components focused and reusable
- Maintain consistent styling with theme
- Document component props with JSDoc
- Include examples in documentation
- Test edge cases and accessibility

## Form Handling and Validation

### Form State Management

For form handling within class components:

1. Maintain form field values in component state
2. Use controlled components (where form value is controlled by React state)
3. Implement handlers for onChange, onBlur, and other relevant events
4. Track form "touched" state for each field to display errors at appropriate times

### Validation Patterns

Form validation should follow these patterns:

1. **Field-level validation**: Create a method like `validateField(fieldName, value)` that returns validation errors for a specific field
2. **Form-level validation**: Implement a `validateForm()` method that validates all fields before submission
3. **Error display**: Show errors only after a field has been touched or when form submission is attempted
4. **Real-time validation**: Update errors as the user types, but only display them after the field has been touched
5. **Name uniqueness**: When validating names (project names, filenames, etc.), check against existing items in the collection to prevent duplicates

Example validation implementation:
```tsx
validateField(field: 'projectName' | 'projectType', value: string) {
  const errors: { [key: string]: string } = {};
  const { projects } = this.state;

  switch(field) {
    case 'projectName':
      if (!value.trim()) {
        errors.projectName = 'Project name is required';
      } else if (value.trim().length > 50) {
        errors.projectName = 'Project name must be less than 50 characters';
      } else if (projects.some(project => project.name.toLowerCase() === value.trim().toLowerCase())) {
        errors.projectName = 'Project name already exists';
      }
      break;
    case 'projectType':
      if (!value) {
        errors.projectType = 'Please select a project type';
      }
      break;
  }

  return errors;
}
```

## Focus Management

Proper focus management improves the user experience and accessibility of the application.

### Dialog Focus

When opening dialogs or modal windows:

1. Automatically focus the first interactive element (usually the primary input field)
2. Use React refs to access the DOM element directly
3. Use `componentDidUpdate` to detect when a dialog opens and set focus appropriately
4. Add a small delay (with `setTimeout`) when necessary to ensure the DOM is fully rendered

Example focus management:
```tsx
private inputRef = React.createRef<HTMLInputElement>();

componentDidUpdate(prevProps: Props, prevState: State) {
  // If the dialog just opened
  if (!prevState.dialogOpen && this.state.dialogOpen) {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      if (this.inputRef.current) {
        this.inputRef.current.focus();
      }
    }, 100);
  }
}

render() {
  return (
    <Dialog open={this.state.dialogOpen}>
      <TextField 
        inputRef={this.inputRef}
        autoFocus // Backup method
      />
    </Dialog>
  );
}
```

### Focus Restoration

When closing dialogs or navigating between screens:

1. Return focus to the element that opened the dialog when it closes
2. Maintain a reference to the element that should receive focus after an action