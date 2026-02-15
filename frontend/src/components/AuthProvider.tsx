import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { me as apiMe } from '../api/auth'
import { User } from '../types'

type AuthCtx = {
  user: User | null
  loading: boolean
  setToken: (token: string | null) => void
  refresh: () => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const u = await apiMe()
      setUser(u as User)
    } catch {
      localStorage.removeItem('access_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const setToken = (token: string | null) => {
    if (token) localStorage.setItem('access_token', token)
    else localStorage.removeItem('access_token')
    setLoading(true)
    void refresh()
  }

  const logout = () => {
    setToken(null)
  }

  const value = useMemo(() => ({ user, loading, setToken, refresh, logout }), [user, loading])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
