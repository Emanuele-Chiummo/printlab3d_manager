import React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Menu,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useAuth } from '../components/AuthProvider'
import api from '../api/client'

type Stampante = {
  id: number
  nome: string
  modello: string
  potenza_w: number
  costo_macchina_eur: number
  vita_stimata_h: number
  manutenzione_eur_h: number
  deprezzamento_eur_h: number
  totale_macchina_eur_h: number
  stato: 'ATTIVA' | 'MANUTENZIONE' | 'INATTIVA'
  note?: string
  created_at?: string
  updated_at?: string
}

const empty: Partial<Stampante> = {
  nome: '',
  modello: '',
  potenza_w: 0,
  costo_macchina_eur: 0,
  vita_stimata_h: 8000,
  manutenzione_eur_h: 0.20,
  stato: 'ATTIVA',
  note: '',
}

export default function StampantiPage() {
  const { user } = useAuth()
  const [rows, setRows] = React.useState<Stampante[]>([])
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Stampante | null>(null)
  const [form, setForm] = React.useState<Partial<Stampante>>(empty)
  const [anchorEl, setAnchorEl] = React.useState<{ [key: number]: HTMLElement | null }>({})

  const load = async () => {
    try {
      const res = await api.get('/api/v1/printers')
      setRows(res.data)
    } catch (err) {
      console.error('Errore nel caricamento delle stampanti', err)
    }
  }

  React.useEffect(() => {
    void load()
  }, [])

  const canWrite = user?.role === 'ADMIN' || user?.role === 'OPERATORE'

  const onNew = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }

  const onEdit = (s: Stampante) => {
    setEditing(s)
    setForm({ ...s })
    setOpen(true)
  }

  const onSave = async () => {
    try {
      if (editing && editing.id) {
        await api.put(`/api/v1/printers/${editing.id}`, form)
      } else {
        await api.post('/api/v1/printers', form)
      }
      setOpen(false)
      await load()
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Errore durante il salvataggio'
      alert(detail)
    }
  }

  const onDelete = async (s: Stampante) => {
    if (!confirm(`Eliminare la stampante "${s.nome}"?`)) return
    try {
      await api.delete(`/api/v1/printers/${s.id}`)
      await load()
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Errore durante l'eliminazione"
      alert(detail)
    }
  }

  const statoOptions: Array<'ATTIVA' | 'MANUTENZIONE' | 'INATTIVA'> = ['ATTIVA', 'MANUTENZIONE', 'INATTIVA']

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'ATTIVA':
        return '#0f9d58'
      case 'MANUTENZIONE':
        return '#d97706'
      case 'INATTIVA':
        return '#64748b'
      default:
        return '#64748b'
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          mt: 3,
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Stampanti
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Gestisci le tue stampanti 3D e monitora il loro stato.
          </Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" onClick={onNew}>
            Nuova stampante
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Parco macchine
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {rows.length} stampanti registrate
            </Typography>
          </Box>
        </Stack>
        {rows.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Non ci sono ancora stampanti registrate.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Modello</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Potenza (W)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Costo €/h</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Stato</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Note</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{r.nome}</TableCell>
                    <TableCell>{r.modello}</TableCell>
                    <TableCell>{r.potenza_w} W</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1d4ed8' }}>€{r.totale_macchina_eur_h.toFixed(4)}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          backgroundColor: `${getStatoColor(r.stato)}20`,
                          color: getStatoColor(r.stato),
                        }}
                      >
                        {r.stato}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.note || '-'}
                    </TableCell>
                    <TableCell align="right">
                      {canWrite && (
                        <>
                          <IconButton
                            size="small"
                            onClick={(e) => setAnchorEl({ ...anchorEl, [r.id]: e.currentTarget })}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl[r.id]}
                            open={Boolean(anchorEl[r.id])}
                            onClose={() => setAnchorEl({ ...anchorEl, [r.id]: null })}
                          >
                            <MenuItem
                              onClick={() => {
                                onEdit(r)
                                setAnchorEl({ ...anchorEl, [r.id]: null })
                              }}
                            >
                              <EditIcon fontSize="small" sx={{ mr: 1 }} color="primary" /> Modifica
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                onDelete(r)
                                setAnchorEl({ ...anchorEl, [r.id]: null })
                              }}
                            >
                              <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" /> Elimina
                            </MenuItem>
                          </Menu>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Modifica stampante' : 'Nuova stampante'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField
              label="Nome"
              value={form.nome || ''}
              onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Modello"
              value={form.modello || ''}
              onChange={(e) => setForm((s) => ({ ...s, modello: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Potenza (W)"
              type="number"
              value={form.potenza_w ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, potenza_w: Number(e.target.value) }))}
              fullWidth
            />
            <TextField
              label="Costo macchina (€)"
              type="number"
              value={form.costo_macchina_eur ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, costo_macchina_eur: Number(e.target.value) }))}
              fullWidth
            />
            <TextField
              label="Vita stimata (ore)"
              type="number"
              value={form.vita_stimata_h ?? 8000}
              onChange={(e) => setForm((s) => ({ ...s, vita_stimata_h: Number(e.target.value) }))}
              fullWidth
            />
            <TextField
              label="Manutenzione (€/h)"
              type="number"
              inputProps={{ step: '0.01' }}
              value={form.manutenzione_eur_h ?? 0.20}
              onChange={(e) => setForm((s) => ({ ...s, manutenzione_eur_h: Number(e.target.value) }))}
              fullWidth
            />
            <TextField
              label="Deprezzamento (€/h)"
              value={
                form.costo_macchina_eur && form.vita_stimata_h
                  ? (form.costo_macchina_eur / form.vita_stimata_h).toFixed(4)
                  : '0.0000'
              }
              InputProps={{ readOnly: true }}
              fullWidth
              helperText="Calcolato: Costo macchina / Vita stimata"
            />
            <TextField
              label="Totale macchina (€/h)"
              value={
                form.costo_macchina_eur && form.vita_stimata_h && form.manutenzione_eur_h !== undefined
                  ? ((form.costo_macchina_eur / form.vita_stimata_h) + form.manutenzione_eur_h).toFixed(4)
                  : '0.0000'
              }
              InputProps={{ readOnly: true }}
              fullWidth
              helperText="Calcolato: Deprezzamento + Manutenzione"
              sx={{ '& .MuiInputBase-root': { fontWeight: 600, color: '#1d4ed8' } }}
            />
            <TextField
              select
              label="Stato"
              value={form.stato || 'ATTIVA'}
              onChange={(e) => setForm((s) => ({ ...s, stato: e.target.value as any }))}
              fullWidth
            >
              {statoOptions.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Note"
              value={form.note || ''}
              onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
              multiline
              rows={3}
              fullWidth
              sx={{ gridColumn: { md: '1 / -1' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={onSave}>
            Salva
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
