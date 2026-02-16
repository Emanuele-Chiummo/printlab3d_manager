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
import { loadLocations, createLocation, updateLocation, deleteLocation } from '../services/locations'
import { Location } from '../api/types'
import { useAuth } from '../components/AuthProvider'
import { showError } from '../utils/toast'

const empty: Partial<Location> = { nome: '', tipo: 'SLOT', parent_id: null }

export default function UbicazioniPage() {
  const { user } = useAuth()
  const [rows, setRows] = React.useState<Location[]>([])
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Location | null>(null)
  const [form, setForm] = React.useState<Partial<Location>>(empty)
  const [anchorEl, setAnchorEl] = React.useState<{ [key: number]: HTMLElement | null }>({})

  const load = async () => {
    const data = await loadLocations()
    setRows(data)
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

  const onEdit = (l: Location) => {
    setEditing(l)
    setForm({ ...l })
    setOpen(true)
  }

  const onSave = async () => {
    if (editing && editing.id) await updateLocation(editing.id, form)
    else await createLocation(form)
    setOpen(false)
    await load()
  }

  const onDelete = async (l: Location) => {
    if (!confirm(`Eliminare l'ubicazione "${l.nome}"?`)) return
    try {
      await deleteLocation(l.id)
      await load()
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Errore durante l\'eliminazione'
      showError(detail)
    }
  }

  const tipoOptions = ['MAGAZZINO', 'SCAFFALE', 'RIPIANO', 'SLOT']

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
          Ubicazioni
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
          Traccia magazzini, scaffali e slot con una vista ordinata.
        </Typography>
      </Box>
      {canWrite && (
        <Button variant="contained" onClick={onNew} sx={{ width: { xs: '100%', sm: 'auto' }, fontWeight: 600 }}>
          Nuova ubicazione
        </Button>
      )}
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              Mappa ubicazioni
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.8rem' } }}>
              {rows.length} elementi sincronizzati
            </Typography>
          </Box>
        </Stack>
        {rows.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Non ci sono ancora ubicazioni registrate.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: { xs: '60vh', md: '520px' }, overflowX: 'auto', overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Parent ID</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{r.nome}</TableCell>
                    <TableCell>{r.tipo}</TableCell>
                    <TableCell>{r.parent_id ?? '-'}</TableCell>
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
                            <MenuItem onClick={() => { onEdit(r); setAnchorEl({ ...anchorEl, [r.id]: null }) }}>
                              <EditIcon fontSize="small" sx={{ mr: 1 }} /> Modifica
                            </MenuItem>
                            <MenuItem onClick={() => { onDelete(r); setAnchorEl({ ...anchorEl, [r.id]: null }) }}>
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>{editing ? 'Modifica ubicazione' : 'Nuova ubicazione'}</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField size="small" label="Nome" value={form.nome || ''} onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))} />
            <TextField size="small" select label="Tipo" value={form.tipo || 'SLOT'} onChange={(e) => setForm((s) => ({ ...s, tipo: e.target.value }))}>
              {tipoOptions.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Parent ID"
              type="number"
              value={form.parent_id ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, parent_id: e.target.value ? Number(e.target.value) : null }))}
              sx={{ gridColumn: { md: '1 / -1' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, md: 2 } }}>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={onSave}>
            Salva
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
