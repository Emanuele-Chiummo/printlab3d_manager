import React from 'react'
import { Box, Button, Card, TextField, Typography, Alert, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PrintIcon from '@mui/icons-material/Print'
import { login } from '../api/auth'
import { useAuth } from '../components/AuthProvider'
import AdminOnboarding from './AdminOnboarding'
import api from '../api/client'
import ResetPassword from './ResetPassword'

export default function LoginPage() {
  const nav = useNavigate()
  const { setToken, refresh } = useAuth()
  const [email, setEmail] = React.useState('admin@printlab.local')
  const [password, setPassword] = React.useState('admin123')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [userCount, setUserCount] = React.useState<number | null>(null)
  const [userIdToReset, setUserIdToReset] = React.useState<number | null>(null)

  React.useEffect(() => {
    api.get('/api/v1/users/count').then(r => setUserCount(r.data)).catch(() => setUserCount(1))
  }, [])

  if (userCount === 0) {
    return <AdminOnboarding />
  }

  if (userIdToReset) {
    return <ResetPassword userId={userIdToReset} onSuccess={() => { setUserIdToReset(null); refresh(); nav('/'); }} />
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await login(email, password)
      setToken(res.access_token)
      // fetch user info
      const me = await api.get('/api/v1/auth/me')
      if (me.data.must_reset_password) {
        setUserIdToReset(me.data.id)
      } else {
        nav('/')
      }
    } catch {
      setError('Credenziali non valide. Verifica email e password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: 3,
          backgroundColor: '#ffffff',
          zIndex: 1,
        }}
      >
        <Box sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)',
                mb: 2,
                color: '#fff',
              }}
            >
              <PrintIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
              PrintLab
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Gestionale Stampa 3D
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={onSubmit}>
            <TextField
              fullWidth
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
              variant="outlined"
              size="medium"
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)',
                p: 1.5,
                mb: 2,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Accedi'}
            </Button>
          </Box>

          {/* Helper Text */}
          <Box sx={{ p: 2, backgroundColor: '#f0f9fa', borderRadius: 1.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              <strong>Account demo:</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: '#0055cc', fontFamily: 'monospace', display: 'block', fontSize: '0.8rem' }}>
              admin@printlab.local / admin123
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
              Ruoli: ADMIN × OPERATORE × COMMERCIALE × VIEWER
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}
