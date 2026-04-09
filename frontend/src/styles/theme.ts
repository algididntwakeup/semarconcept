import { createTheme, Shadows } from '@mui/material/styles';

// 🎨 Semar Dashboard Theme Configuration
declare module '@mui/material/styles' {
  interface Palette {
    gradient: {
      primary: string;
      success: string;
      warning: string;
      danger: string;
      purple: string;
      pink: string;
      cyan: string;
      animated: string;
    };
    glass: {
      light: string;
      medium: string;
      dark: string;
    };
  }

  interface PaletteOptions {
    gradient?: {
      primary?: string;
      success?: string;
      warning?: string;
      danger?: string;
      purple?: string;
      pink?: string;
      cyan?: string;
      animated?: string;
    };
    glass?: {
      light?: string;
      medium?: string;
      dark?: string;
    };
  }
}

// Create a theme instance with Semar Dashboard styling
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6', // Modern blue
      light: '#63a4ff',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981', // Success green
      light: '#50d4aa',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#047857',
    },
    background: {
      default: '#f8fafc', // Light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
    divider: '#e5e7eb',
    // 🎨 Custom gradient colors
    gradient: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      purple: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      pink: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      cyan: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      animated: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
    },
    // 🌟 Glass morphism effects
    glass: {
      light: 'rgba(255, 255, 255, 0.7)',
      medium: 'rgba(255, 255, 255, 0.8)',
      dark: 'rgba(255, 255, 255, 0.9)',
    },
  },
  typography: {
    fontFamily: [
      '"Plus Jakarta Sans"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 24, // 1.5rem based on 16px root
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)', // Enhanced shadows
    '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
    '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
    '0 20px 40px rgba(0, 0, 0, 0.2)',
    // Standard MUI shadows for remaining indexes
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
    '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
  ] as unknown as Shadows,
  components: {
    // 🎨 Enhanced CssBaseline with Premium Aesthetics
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        html {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          scroll-behavior: smooth;
        }
        
        *, *::before, *::after {
          box-sizing: border-box;
        }
        
        body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          display: block;
          font-family: '"Plus Jakarta Sans"', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: #f4f7fe;
          color: #2b3674;
        }
        
        #root {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
        }
        
        /* 🎨 Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #a3aed1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }
        
        /* 🌟 Glass morphism utility class */
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
        }
      `,
    },
    
    // 🎨 Paper component - Beautiful Soft Shadows
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '1.5rem',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    
    // 🎨 Card component - Premium Lift Effects
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1.5rem',
          border: 'none',
          boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          width: '100%', // Ensure cards fill their container
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 14px 28px rgba(0,0,0,0.06), 0 10px 10px rgba(0,0,0,0.04)',
          },
        },
      },
    },
    
    // 🎨 Button component - Vibrant interactive elements
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.2s ease',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          '&:hover': {
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(59, 130, 246, 0.3)',
          },
        },
      },
    },
    
    // 🎨 IconButton component - Smooth fades
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    
    // 🎨 ListItemButton component - Modern highlights
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '4px 8px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            borderLeft: '4px solid #3b82f6',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.16)',
            },
          },
        },
      },
    },
    
    // 🎨 Enhanced AppBar - Glassmorphic top bar
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        color: '#2b3674',
        borderBottom: 'none',
        boxShadow: '0 1px 12px rgba(0, 0, 0, 0.03)',
        borderRadius: 0,
      },
    },
  },
    
    // 🎨 Enhanced Drawer - Premium Side Navigation
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: 'none',
          boxShadow: '2px 0 24px rgba(0, 0, 0, 0.02)',
        },
      },
    },
    
    // 🎨 Enhanced TextField & Inputs
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease',
          backgroundColor: '#f8fafc',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3b82f6',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
            backgroundColor: '#ffffff',
          },
        },
        notchedOutline: {
          borderColor: '#e2e8f0',
        },
      },
    },
    
    // 🎨 Enhanced Chip component
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          },
        },
      },
    },
    
    // 🎨 Modern Dialogs
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '1.5rem',
          padding: 8,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 700,
          padding: '24px 24px 16px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '8px 24px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
          gap: 12,
        },
      },
    },
    
    // 🎨 Backdrop styling for modals
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: '1.5rem',
          padding: '1.5rem',
        },
      },
    },
  },
});

export default theme;