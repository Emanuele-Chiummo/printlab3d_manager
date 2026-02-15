import React from 'react'
import { Box, Button, Card, TextField, Typography, Alert, CircularProgress } from '@mui/material'
import api from '../api/client'

export default function ResetPassword({ userId, onSuccess }: { userId: number, onSuccess: () => void }) {
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post(`/api/v1/users/${userId}/reset-password`, { password })
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Errore nel reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)' }}>
      <Card sx={{ maxWidth: 480, p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Reset Password</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>Imposta una nuova password per il tuo account.</Typography>
        <Box component="form" onSubmit={onSubmit}>
          <TextField fullWidth placeholder="Nuova password" type="password" value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 2 }} disabled={loading} />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)', p: 1.5, mb: 2 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Salva nuova password'}
          </Button>
        </Box>
      </Card>
    </Box>
  )
}
