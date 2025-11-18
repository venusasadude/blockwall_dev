import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3B82FF', // electric blue
      light: '#90C2FF',
      dark: '#1E40AF',
    },
    secondary: {
      main: '#FF6AC1', // pink accent
    },
    background: {
      default: '#F4F7FF', // very light bluish
      paper: 'rgba(255,255,255,0.92)',
    },
    text: {
      primary: '#020617', // almost-black
      secondary: '#4B5563',
    },
    divider: 'rgba(148,163,184,0.3)',
  },

  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      fontSize: '3.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.05em',
    },
  },

  shape: {
    borderRadius: 20,
  },

  components: {
    // global background gradient like in the hero
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at 0% 0%, #F9FAFB 0, #F4F7FF 35%, #FDE2FF 55%, #DBEAFE 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9))',
          boxShadow: '0 24px 80px rgba(15,23,42,0.16)',
          border: '1px solid rgba(148,163,184,0.35)',
          backdropFilter: 'blur(20px)', // glassy feel
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999, // pill shape
          paddingInline: '1.5rem',
          paddingBlock: '0.55rem',
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          boxShadow: '0 12px 30px rgba(37,99,235,0.35)',
        },
        outlinedPrimary: {
          borderWidth: 1.5,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
