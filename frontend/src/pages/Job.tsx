import React from 'react'
import {
  Box,
  Button,
  Chip,
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
import AddCircleIcon from '@mui/icons-material/AddCircle'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import api from '../api/client'
import { Filament, Job } from '../api/types'
import { useAuth } from '../components/AuthProvider'
import { showError } from '../utils/toast'

const statusOptions = ['PIANIFICATO', 'IN_CORSO', 'COMPLETATO', 'ANNULLATO']

export default function JobPage() {
  const { user } = useAuth()
  const canWrite = user?.role === 'ADMIN' || user?.role === 'OPERATORE'
  const [rows, setRows] = React.useState<Job[]>([])
  const [filaments, setFilaments] = React.useState<Filament[]>([])
  const [anchorEl, setAnchorEl] = React.useState<{ [key: number]: HTMLElement | null }>({})

  const load = () => api.get('/api/v1/jobs/').then((r) => setRows(r.data))
  const loadFil = () => api.get('/api/v1/filaments/').then((r) => setFilaments(r.data))

  React.useEffect(() => {
    void load()
    void loadFil()
  }, [])

  const deleteJob = async (id: number) => {
    if (!confirm('Confermi l\'eliminazione del job?')) return
    try {
      await api.delete(`/api/v1/jobs/${id}`)
      await load()
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Errore durante l\'eliminazione'
      showError(detail)
    }
  }

  // edit
  const [openEdit, setOpenEdit] = React.useState(false)
  const [editing, setEditing] = React.useState<Job | null>(null)
  const [form, setForm] = React.useState<any>({})

  const onEdit = (j: Job) => {
    setEditing(j)
    setForm({ status: j.status, quantita_prodotta: j.quantita_prodotta, tempo_reale_min: j.tempo_reale_min, energia_kwh: j.energia_kwh, scarti_g: j.scarti_g, note: j.note })
    setOpenEdit(true)
  }
  const onSave = async () => {
    if (!editing) return
    await api.put(`/api/v1/jobs/${editing.id}`, form)
    setOpenEdit(false)
    await load()
  }

  // consumption
  const [openCons, setOpenCons] = React.useState(false)
  const [consJob, setConsJob] = React.useState<Job | null>(null)
  const [consFil, setConsFil] = React.useState<number | ''>('')
  const [consG, setConsG] = React.useState(0)
  const addCons = async () => {
    if (!consJob) return
    await api.post(`/api/v1/jobs/${consJob.id}/consumi`, { filament_id: Number(consFil), peso_g: consG })
    setOpenCons(false)
    await load()
  }

  const chipColor = (s: string) => {
    if (s === 'COMPLETATO') return 'success'
    if (s === 'IN_CORSO') return 'info'
    if (s === 'ANNULLATO') return 'error'
    return 'default'
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          mt: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
          gap: { xs: 2, sm: 2 },
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
            Job
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
            Monitora lavori, consumi e margini operativi.
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              Elenco job
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.8rem' } }}>
              {rows.length} lavori registrati
            </Typography>
          </Box>
        </Stack>
        <TableContainer sx={{ maxHeight: { xs: '60vh', md: '520px' }, overflowX: 'auto', overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Preventivo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Stato</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Quantità</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Tempo/pz (min)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Costo finale</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Margine</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }} />
              </TableRow>
            </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>{r.id}</TableCell>
              <TableCell>{r.quote_code}</TableCell>
              <TableCell>
                <Chip label={r.status} color={chipColor(r.status) as any} size="small" />
              </TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{r.quantita_prodotta}</TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>{r.tempo_reale_min}</TableCell>
              <TableCell align="right">€ {r.costo_finale_eur.toFixed(2)}</TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>€ {r.margine_eur.toFixed(2)}</TableCell>
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
                      <MenuItem onClick={() => {
                        setConsJob(r);
                        setConsFil('');
                        setConsG(0);
                        setOpenCons(true);
                        setAnchorEl({ ...anchorEl, [r.id]: null });
                      }}>
                        <AddCircleIcon fontSize="small" sx={{ mr: 1 }} /> Aggiungi consumo
                      </MenuItem>
                      <MenuItem onClick={() => { deleteJob(r.id); setAnchorEl({ ...anchorEl, [r.id]: null }) }}>
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
      </Paper>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Modifica Job (valori per pezzo)</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField
              select
              label="Stato"
              value={form.status || 'PIANIFICATO'}
              onChange={(e) => setForm((s: any) => ({ ...s, status: e.target.value }))}
              size="small"
            >
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Quantità prodotta"
              type="number"
              value={form.quantita_prodotta ?? 1}
              onChange={(e) => setForm((s: any) => ({ ...s, quantita_prodotta: Number(e.target.value) }))}
              helperText="Numero di pezzi"
              size="small"
            />
            <TextField
              label="Tempo per pezzo (min)"
              type="number"
              value={form.tempo_reale_min ?? 0}
              onChange={(e) => setForm((s: any) => ({ ...s, tempo_reale_min: Number(e.target.value) }))}
              helperText="Minuti per pezzo"
              size="small"
            />
            <TextField
              label="Energia per pezzo (kWh)"
              type="number"
              inputProps={{ step: 0.001 }}
              value={form.energia_kwh ?? 0}
              onChange={(e) => setForm((s: any) => ({ ...s, energia_kwh: Number(e.target.value) }))}
              size="small"
            />
            <TextField label="Scarti (g)" type="number" value={form.scarti_g ?? 0} onChange={(e) => setForm((s: any) => ({ ...s, scarti_g: Number(e.target.value) }))} size="small" />
            <TextField
              label="Note"
              value={form.note || ''}
              onChange={(e) => setForm((s: any) => ({ ...s, note: e.target.value }))}
              sx={{ gridColumn: { md: '1 / -1' } }}
              multiline
              minRows={2}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, md: 2 } }}>
          <Button onClick={() => setOpenEdit(false)}>Annulla</Button>
          <Button variant="contained" onClick={onSave}>
            Salva
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCons} onClose={() => setOpenCons(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Aggiungi consumo</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Filamento"
              value={consFil}
              onChange={(e) => setConsFil(e.target.value as any)}
              size="small"
            >
              {filaments
                .filter((f) => f.stato !== 'FINITO' || (consFil && f.id === Number(consFil)))
                .map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.materiale} {f.marca} {f.colore}
                  </MenuItem>
                ))}
            </TextField>
            <TextField label="Peso (g)" type="number" value={consG} onChange={(e) => setConsG(Number(e.target.value))} size="small" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, md: 2 } }}>
          <Button onClick={() => setOpenCons(false)}>Annulla</Button>
          <Button variant="contained" onClick={addCons} disabled={!consFil}>
            Aggiungi
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
