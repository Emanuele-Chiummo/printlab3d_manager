import { createTheme } from '@mui/material/styles'
import type { PaletteMode } from '@mui/material'

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: { main: '#2563eb', light: '#5a8bff', dark: '#1d4ed8' },
      secondary: { main: '#0ea5e9', light: '#67e8f9', dark: '#0369a1' },
      success: { main: '#0f9d58' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      info: { main: '#0ea5e9' },
      background: {
        default: isDark ? '#0d1117' : '#f4f7fb',
        paper: isDark ? '#161b22' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e6edf3' : '#0f172a',
        secondary: isDark ? '#8b949e' : '#5f6b80',
      },
      divider: isDark ? 'rgba(240,246,252,0.1)' : 'rgba(15, 23, 42, 0.07)',
    },
    typography: {
      fontFamily: '"Sora", "Space Grotesk", "Inter", sans-serif',
      h3: { fontWeight: 600, fontSize: '2.25rem', letterSpacing: '-0.04em' },
      h4: { fontWeight: 600, fontSize: '1.85rem', letterSpacing: '-0.03em' },
      h5: { fontWeight: 600, fontSize: '1.45rem', letterSpacing: '-0.01em' },
      h6: { fontWeight: 600, fontSize: '1.05rem' },
      subtitle1: { fontWeight: 500 },
      body1: { fontSize: '1rem' },
      body2: { fontSize: '0.92rem' },
      button: { fontWeight: 600 },
    },
    spacing: 8,
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0d1117' : '#f4f7fb',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(22,27,34,0.95)' : 'rgba(255,255,255,0.92)',
            color: isDark ? '#e6edf3' : '#0f172a',
            boxShadow: '0 1px 4px rgba(15,23,42,0.08)',
            borderBottom: isDark ? '1px solid rgba(240,246,252,0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
            backdropFilter: 'blur(12px)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: 'none',
            background: isDark
              ? 'linear-gradient(165deg, #161b22 0%, #1a2233 70%, #1e2a3a 100%)'
              : 'linear-gradient(165deg, #f8fafc 0%, #eef4ff 70%, #d9e7ff 100%)',
            color: isDark ? '#e6edf3' : '#0f172a',
            boxShadow: isDark
              ? 'inset -1px 0 0 rgba(240,246,252,0.08)'
              : 'inset -1px 0 0 rgba(15,23,42,0.06)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: isDark ? '1px solid rgba(240,246,252,0.08)' : '1px solid rgba(15,23,42,0.04)',
            boxShadow: isDark
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : '0 25px 55px -45px rgba(15,23,42,0.65)',
            background: isDark ? '#161b22' : '#ffffff',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark
                ? '0 8px 32px rgba(37,99,235,0.25)'
                : '0 35px 65px -40px rgba(37,99,235,0.35)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: isDark ? '1px solid rgba(240,246,252,0.08)' : '1px solid rgba(15,23,42,0.05)',
            boxShadow: isDark
              ? '0 2px 16px rgba(0,0,0,0.35)'
              : '0 20px 60px -45px rgba(15,23,42,0.35)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 999,
            padding: '10px 20px',
            fontSize: '0.95rem',
          },
          containedPrimary: {
            background: 'linear-gradient(115deg, #2f6bff 0%, #2563eb 55%, #0ea5e9 120%)',
            color: '#fff',
            boxShadow: '0 20px 40px -22px rgba(37, 99, 235, 0.65)',
            '&:hover': {
              background: 'linear-gradient(115deg, #1f54d6 0%, #1d4ed8 60%, #0284c7 120%)',
              boxShadow: '0 25px 60px -25px rgba(15, 23, 42, 0.5)',
            },
          },
          outlined: {
            borderWidth: 2,
            borderColor: 'rgba(37, 99, 235, 0.35)',
            '&:hover': {
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.05)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 14,
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fdfdfd',
              '& fieldset': {
                borderColor: isDark ? 'rgba(240,246,252,0.15)' : 'rgba(15,23,42,0.08)',
              },
              '&:hover fieldset': { borderColor: '#2563eb' },
              '&.Mui-focused fieldset': {
                borderColor: '#2563eb',
                boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.15)',
              },
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 48 },
          indicator: { height: 3, borderRadius: 2 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 48,
            '&.Mui-selected': { color: '#2563eb' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 999 },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(37,99,235,0.12)' : '#eef2ff',
            '& .MuiTableCell-root': {
              fontWeight: 600,
              borderBottom: 'none',
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              '&:hover': {
                backgroundColor: isDark
                  ? 'rgba(37, 99, 235, 0.08)'
                  : 'rgba(37, 99, 235, 0.04)',
              },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark
              ? '1px solid rgba(240,246,252,0.06)'
              : '1px solid rgba(15,23,42,0.05)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            border: isDark ? '1px solid rgba(240,246,252,0.1)' : '1px solid rgba(15,23,42,0.05)',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            margin: '4px 16px',
            fontWeight: 600,
            '&.Mui-selected': {
              backgroundColor: 'rgba(37,99,235,0.12)',
              '& .MuiListItemIcon-root': { color: '#2563eb' },
            },
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
            },
          },
        },
      },
    },
  })
}

// Legacy export for backward compat
export const theme = createAppTheme('light')
