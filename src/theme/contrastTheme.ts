import { createTheme } from '@mui/material/styles';

const contrastTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4ade80',
      light: '#86efac',
      dark: '#22c55e',
      contrastText: '#000000',
    },
    secondary: {
      main: '#fcd34d',
      light: '#fde68a',
      dark: '#fbbf24',
      contrastText: '#000000',
    },
    background: {
      default: '#000000',
      paper: '#18181b',
    },
    text: {
      primary: '#ffffff',
      secondary: '#d4d4d8',
    },
    divider: '#3f3f46',
    error: {
      main: '#f87171',
      contrastText: '#000000',
    },
    warning: {
      main: '#facc15',
      contrastText: '#000000',
    },
    info: {
      main: '#38bdf8',
      contrastText: '#000000',
    },
    success: {
      main: '#4ade80',
      contrastText: '#000000',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#18181b',
          backgroundImage: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
          border: '1px solid #3f3f46',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          },
          border: '2px solid',
          borderColor: 'currentColor',
        },
        containedPrimary: {
          backgroundColor: '#4ade80',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#22c55e',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#18181b',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
          border: '1px solid #3f3f46',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '2px solid #3f3f46',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#18181b',
          border: '2px solid #3f3f46',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          border: '2px solid currentColor',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#ffffff',
          color: '#000000',
          fontSize: '0.85rem',
          fontWeight: 600,
          border: '2px solid #000000',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        thumb: {
          border: '2px solid currentColor',
        },
        track: {
          backgroundColor: '#3f3f46',
          opacity: 1,
        },
      },
    },
  },
});

export default contrastTheme; 