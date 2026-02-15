import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0055cc', light: '#3b82f6', dark: '#003d99' },
    secondary: { main: '#10b981', light: '#34d399', dark: '#059669' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#0891b2' },
    background: { default: '#f9fafb', paper: '#ffffff' },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: '\"Inter\", \"Helvetica\", \"Arial\", sans-serif',
    h5: { fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, fontSize: '1.1rem' },
    body1: { fontSize: '0.95rem', color: '#374151' },
    body2: { fontSize: '0.875rem', color: '#6b7280' },
  },
  spacing: 8,
  shape: { borderRadius: 12 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#f9fafb',
            '&:hover fieldset': { borderColor: '#0055cc' },
            '&.Mui-focused fieldset': { borderColor: '#0055cc' },
          },
        },
      },
    },
  },
})
