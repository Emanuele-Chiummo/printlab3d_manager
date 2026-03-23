import React, { createContext, useContext, useMemo, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { type PaletteMode } from '@mui/material'
import { createAppTheme } from '../theme/theme'

type ThemeCtx = { mode: PaletteMode; toggleTheme: () => void }

const ThemeCtx = createContext<ThemeCtx>({ mode: 'light', toggleTheme: () => {} })

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem('theme') as PaletteMode | null
    return saved === 'dark' ? 'dark' : 'light'
  })

  const toggleTheme = () => {
    setMode((m) => {
      const next = m === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      return next
    })
  }

  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ThemeCtx.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeCtx.Provider>
  )
}

export function useThemeMode() {
  return useContext(ThemeCtx)
}
