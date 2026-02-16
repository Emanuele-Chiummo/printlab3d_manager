import React from 'react'
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Chip, MenuItem, Alert, CircularProgress, Paper, IconButton, Menu } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import api from '../api/client'
import { User, Role } from '../types'
import { showError } from '../utils/toast'

const roleOptions: Role[] = ['ADMIN', 'OPERATORE', 'COMMERCIALE', 'VIEWER']

export default function UtentiPage() {
  const [rows, setRows] = React.useState<User[]>([])
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<Partial<User> & { password?: string }>({ role: 'VIEWER' })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [anchorEl, setAnchorEl] = React.useState<{ [key: number]: HTMLElement | null }>({})

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

  const handleMenuOpen = (userId: number, event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl({ ...anchorEl, [userId]: event.currentTarget })
  }

  const handleMenuClose = (userId: number) => {
    setAnchorEl({ ...anchorEl, [userId]: null })
  }

  const toggleActive = async (userId: number) => {
    try {
      await api.post(`/api/v1/users/${userId}/toggle-active`)
      await load()
      handleMenuClose(userId)
    } catch (err: any) {
      showError('Errore: ' + (err?.response?.data?.detail || 'Impossibile modificare lo stato'))
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        mt: 3,
        mb: 3,
        gap: { xs: 2, md: 2 },
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
          Utenti
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
          Gestisci accessi, ruoli e permessi del sistema.
        </Typography>
      </Box>
      <Button variant="contained" onClick={onNew} sx={{ width: { xs: '100%', sm: 'auto' }, fontWeight: 600 }}>
        Nuovo utente
      </Button>
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              Elenco utenti
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.8rem' } }}>
              {rows.length} utenti registrati
            </Typography>
          </Box>
        </Stack>
        <TableContainer sx={{ maxHeight: { xs: '60vh', md: '520px' }, overflowX: 'auto', overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Ruolo</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Stato</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Reset Password</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.full_name}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{u.role}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{u.is_active ? <Chip label="Attivo" color="success" size="small" /> : <Chip label="Disattivo" color="default" size="small" />}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{u.must_reset_password ? <Chip label="Da resettare" color="warning" size="small" /> : <Chip label="OK" color="success" size="small" />}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(u.id, e)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl[u.id]}
                      open={Boolean(anchorEl[u.id])}
                      onClose={() => handleMenuClose(u.id)}
                    >
                      <MenuItem onClick={() => toggleActive(u.id)}>
                        {u.is_active ? (
                          <>
                            <ToggleOffIcon sx={{ mr: 1, color: 'error.main' }} />
                            Disattiva
                          </>
                        ) : (
                          <>
                            <ToggleOnIcon sx={{ mr: 1, color: 'success.main' }} />
                            Attiva
                          </>
                        )}
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Nuovo Utente</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField size="small" label="Email" value={form.email || ''} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} />
            <TextField size="small" label="Nome completo" value={form.full_name || ''} onChange={e => setForm(s => ({ ...s, full_name: e.target.value }))} />
            <TextField size="small" select label="Ruolo" value={form.role || 'VIEWER'} onChange={e => setForm(s => ({ ...s, role: e.target.value as Role }))}>
              {roleOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Password temporanea" type="password" value={form.password || ''} onChange={e => setForm(s => ({ ...s, password: e.target.value }))} />
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, md: 2 } }}>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={onSave} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Crea'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
