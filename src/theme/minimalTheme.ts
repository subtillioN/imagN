import { createTheme } from '@mui/material/styles';

const minimalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#94a3b8',
      light: '#cbd5e1',
      dark: '#64748b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#94a3b8',
      light: '#cbd5e1',
      dark: '#64748b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
    divider: '#334155',
    error: {
      main: '#f87171',
    },
    warning: {
      main: '#fbbf24',
    },
    info: {
      main: '#60a5fa',
    },
    success: {
      main: '#4ade80',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 300,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 300,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 400,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 400,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: '1px solid #334155',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 400,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          borderRadius: 2,
        },
        contained: {
          backgroundColor: '#334155',
          '&:hover': {
            backgroundColor: '#475569',
          },
        },
        outlined: {
          borderColor: '#475569',
          '&:hover': {
            backgroundColor: 'rgba(71, 85, 105, 0.1)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(148, 163, 184, 0.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1e293b',
          boxShadow: 'none',
          borderRadius: 2,
        },
        outlined: {
          border: '1px solid #334155',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          boxShadow: 'none',
          transition: 'border-color 0.2s ease-in-out',
          '&:hover': {
            borderColor: '#475569',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b',
          borderRight: '1px solid #334155',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          '&:hover': {
            backgroundColor: 'rgba(148, 163, 184, 0.05)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#334155',
          color: '#e2e8f0',
          fontSize: '0.75rem',
          boxShadow: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#334155',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#334155',
              borderRadius: 2,
            },
            '&:hover fieldset': {
              borderColor: '#475569',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#94a3b8',
            },
          },
        },
      },
    },
  },
});

export default minimalTheme; 