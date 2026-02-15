import React from 'react'
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Chip, MenuItem, Alert, CircularProgress } from '@mui/material'
import api from '../api/client'
import { User, Role } from '../types'

const roleOptions: Role[] = ['ADMIN', 'OPERATORE', 'COMMERCIALE', 'VIEWER']

export default function UtentiPage() {
  const [rows, setRows] = React.useState<User[]>([])
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<Partial<User> & { password?: string }>({ role: 'VIEWER' })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const load = () => api.get('/api/v1/users/').then(r => setRows(r.data))
  React.useEffect(() => { load() }, [])

  const onNew = () => {
    setForm({ role: 'VIEWER' })
    setOpen(true)
    setError(null)
  }

  const onSave = async () => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/v1/users/', {
        email: form.email,
        full_name: form.full_name,
        role: form.role,
        password: form.password,
        is_active: true,
      })
      setOpen(false)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Errore nella creazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Gestione Utenti</Typography>
        <Button variant="contained" onClick={onNew}>Nuovo Utente</Button>
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Ruolo</TableCell>
            <TableCell>Stato</TableCell>
            <TableCell>Reset Password</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((u) => (
            <TableRow key={u.id} hover>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.full_name}</TableCell>
              <TableCell>{u.role}</TableCell>
                <TableCell>{u.is_active ? <Chip label="Attivo" color="success" size="small" /> : <Chip label="Disattivo" color="default" size="small" />}</TableCell>
              <TableCell>{u.must_reset_password ? <Chip label="Da resettare" color="warning" size="small" /> : <Chip label="OK" color="success" size="small" />}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuovo Utente</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField label="Email" value={form.email || ''} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} />
            <TextField label="Nome completo" value={form.full_name || ''} onChange={e => setForm(s => ({ ...s, full_name: e.target.value }))} />
            <TextField select label="Ruolo" value={form.role || 'VIEWER'} onChange={e => setForm(s => ({ ...s, role: e.target.value as Role }))}>
              {roleOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <TextField label="Password temporanea" type="password" value={form.password || ''} onChange={e => setForm(s => ({ ...s, password: e.target.value }))} />
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={onSave} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Crea'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
