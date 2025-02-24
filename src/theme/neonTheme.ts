import { createTheme } from '@mui/material/styles';

const neonTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f0abfc',
      light: '#f5d0fe',
      dark: '#d946ef',
      contrastText: '#000000',
    },
    secondary: {
      main: '#34d399',
      light: '#a7f3d0',
      dark: '#059669',
      contrastText: '#000000',
    },
    background: {
      default: '#0f0f1a',
      paper: '#14142b',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#a5a5a5',
    },
    divider: '#2e2e45',
    error: {
      main: '#fb7185',
    },
    warning: {
      main: '#fdba74',
    },
    info: {
      main: '#7dd3fc',
    },
    success: {
      main: '#86efac',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '0.05em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '0.05em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.05em',
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.025em',
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.025em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(20, 20, 43, 0.8)',
          backgroundImage: 'none',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 15px rgba(240, 171, 252, 0.3)',
          borderBottom: '1px solid rgba(240, 171, 252, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: '0 0 10px rgba(240, 171, 252, 0.3)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(240, 171, 252, 0.5)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #d946ef 30%, #f0abfc 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #f0abfc 30%, #d946ef 90%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #059669 30%, #34d399 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #34d399 30%, #059669 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(20, 20, 43, 0.8)',
          boxShadow: '0 0 15px rgba(240, 171, 252, 0.2)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(240, 171, 252, 0.2)',
          boxShadow: '0 0 15px rgba(240, 171, 252, 0.2)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(240, 171, 252, 0.3)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(20, 20, 43, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(240, 171, 252, 0.3)',
          boxShadow: '0 0 20px rgba(240, 171, 252, 0.3)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#f0abfc',
          '&:hover': {
            backgroundColor: 'rgba(240, 171, 252, 0.1)',
            boxShadow: '0 0 15px rgba(240, 171, 252, 0.5)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(20, 20, 43, 0.9)',
          color: '#f0abfc',
          fontSize: '0.75rem',
          border: '1px solid rgba(240, 171, 252, 0.3)',
          boxShadow: '0 0 10px rgba(240, 171, 252, 0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(240, 171, 252, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(240, 171, 252, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#f0abfc',
              boxShadow: '0 0 10px rgba(240, 171, 252, 0.3)',
            },
          },
        },
      },
    },
  },
});

export default neonTheme; 