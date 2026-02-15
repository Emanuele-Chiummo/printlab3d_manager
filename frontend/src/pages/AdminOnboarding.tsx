import React from 'react'
import { Box, Button, Card, TextField, Typography, Alert, CircularProgress } from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import api from '../api/client'

export default function AdminOnboarding() {
  const [email, setEmail] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/api/v1/users/first-admin', {
        email,
        full_name: fullName,
        password,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Errore nella creazione')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)' }}>
        <Card sx={{ maxWidth: 480, p: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Admin creato!</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>Ora puoi effettuare il login come admin.</Typography>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)' }}>
      <Card sx={{ maxWidth: 480, p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)', mb: 2, color: '#fff' }}>
            <PrintIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            Prima configurazione Admin
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Crea il primo utente amministratore
          </Typography>
        </Box>
        <Box component="form" onSubmit={onSubmit}>
          <TextField fullWidth placeholder="Nome completo" value={fullName} onChange={e => setFullName(e.target.value)} sx={{ mb: 2 }} disabled={loading} />
          <TextField fullWidth placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} disabled={loading} />
          <TextField fullWidth placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 2 }} disabled={loading} />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)', p: 1.5, mb: 2 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Crea Admin'}
          </Button>
        </Box>
      </Card>
    </Box>
  )
}
