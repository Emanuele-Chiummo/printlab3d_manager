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
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'
import { useAuth } from '../components/AuthProvider'
import EmptyState from '../components/EmptyState'
import SkeletonTable from '../components/SkeletonTable'
import api from '../api/client'
import { showError } from '../utils/toast'

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

const statoChipColor = (stato: string): 'success' | 'warning' | 'default' => {
  if (stato === 'ATTIVA') return 'success'
  if (stato === 'MANUTENZIONE') return 'warning'
  return 'default'
}

export default function StampantiPage() {
  const { user } = useAuth()
  const [rows, setRows] = React.useState<Stampante[]>([])
  const [loading, setLoading] = React.useState(true)
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
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { void load() }, [])

  const canWrite = user?.role === 'ADMIN' || user?.role === 'OPERATORE'

  const onNew = () => { setEditing(null); setForm(empty); setOpen(true) }
  const onEdit = (s: Stampante) => { setEditing(s); setForm({ ...s }); setOpen(true) }

  const onSave = async () => {
    try {
      if (editing?.id) {
        await api.put(`/api/v1/printers/${editing.id}`, form)
      } else {
        await api.post('/api/v1/printers', form)
      }
      setOpen(false)
      await load()
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Errore durante il salvataggio')
    }
  }

  const onDelete = async (s: Stampante) => {
    if (!confirm(`Eliminare la stampante "${s.nome}"?`)) return
    try {
      await api.delete(`/api/v1/printers/${s.id}`)
      await load()
    } catch (err: any) {
      showError(err.response?.data?.detail || "Errore durante l'eliminazione")
    }
  }

  const statoOptions: Array<'ATTIVA' | 'MANUTENZIONE' | 'INATTIVA'> = ['ATTIVA', 'MANUTENZIONE', 'INATTIVA']

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
            Stampanti
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
            Gestisci le tue stampanti 3D e monitora il loro stato.
          </Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" onClick={onNew} sx={{ width: { xs: '100%', sm: 'auto' }, fontWeight: 600 }}>
            Nuova stampante
          </Button>
        )}
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              Parco macchine
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.8rem' } }}>
              {rows.length} stampanti registrate
            </Typography>
          </Box>
        </Stack>

        {loading ? (
          <SkeletonTable columns={7} rows={4} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<PrecisionManufacturingIcon />}
            title="Nessuna stampante registrata"
            subtitle="Aggiungi la tua prima stampante per iniziare a tracciare produzione e costi macchina."
            actionLabel={canWrite ? '+ Aggiungi stampante' : undefined}
            onAction={canWrite ? onNew : undefined}
          />
        ) : (
          <TableContainer sx={{ maxHeight: { xs: '60vh', md: '520px' }, overflowX: 'auto', overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
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
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      bgcolor: editing?.id === r.id && open
                        ? 'rgba(37,99,235,0.08) !important'
                        : undefined,
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{r.nome}</TableCell>
                    <TableCell>{r.modello}</TableCell>
                    <TableCell>{r.potenza_w} W</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                      €{r.totale_macchina_eur_h.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.stato}
                        color={statoChipColor(r.stato)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.note || '—'}
                    </TableCell>
                    <TableCell align="right">
                      {canWrite && (
                        <>
                          <IconButton size="small" onClick={(e) => setAnchorEl({ ...anchorEl, [r.id]: e.currentTarget })}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl[r.id]}
                            open={Boolean(anchorEl[r.id])}
                            onClose={() => setAnchorEl({ ...anchorEl, [r.id]: null })}
                          >
                            <MenuItem onClick={() => { onEdit(r); setAnchorEl({ ...anchorEl, [r.id]: null }) }}>
                              <EditIcon fontSize="small" sx={{ mr: 1 }} color="primary" /> Modifica
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

      <Dialog open={open} onClose={() => { setOpen(false); setEditing(null) }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          {editing ? 'Modifica stampante' : 'Nuova stampante'}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField label="Nome" value={form.nome || ''} onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))} size="small" />
            <TextField label="Modello" value={form.modello || ''} onChange={(e) => setForm((s) => ({ ...s, modello: e.target.value }))} size="small" />
            <TextField label="Potenza (W)" type="number" value={form.potenza_w ?? ''} onChange={(e) => setForm((s) => ({ ...s, potenza_w: Number(e.target.value) }))} size="small" inputProps={{ min: 0 }} />
            <TextField label="Costo macchina (€)" type="number" value={form.costo_macchina_eur ?? ''} onChange={(e) => setForm((s) => ({ ...s, costo_macchina_eur: Number(e.target.value) }))} size="small" inputProps={{ min: 0 }} />
            <TextField label="Vita stimata (ore)" type="number" value={form.vita_stimata_h ?? 8000} onChange={(e) => setForm((s) => ({ ...s, vita_stimata_h: Number(e.target.value) }))} size="small" inputProps={{ min: 1 }} />
            <TextField label="Manutenzione (€/h)" type="number" inputProps={{ step: '0.01', min: 0 }} value={form.manutenzione_eur_h ?? 0.20} onChange={(e) => setForm((s) => ({ ...s, manutenzione_eur_h: Number(e.target.value) }))} size="small" />
            <TextField
              label="Deprezzamento (€/h)"
              value={form.costo_macchina_eur && form.vita_stimata_h ? (form.costo_macchina_eur / form.vita_stimata_h).toFixed(4) : '0.0000'}
              InputProps={{ readOnly: true }}
              helperText="Calcolato: Costo macchina / Vita"
              size="small"
            />
            <TextField
              label="Totale macchina (€/h)"
              value={form.costo_macchina_eur && form.vita_stimata_h && form.manutenzione_eur_h !== undefined
                ? ((form.costo_macchina_eur / form.vita_stimata_h) + form.manutenzione_eur_h).toFixed(4)
                : '0.0000'}
              InputProps={{ readOnly: true }}
              helperText="Calcolato: Deprezzamento + Manutenzione"
              sx={{ '& .MuiInputBase-root': { fontWeight: 600, color: 'primary.main' } }}
              size="small"
            />
            <TextField select label="Stato" value={form.stato || 'ATTIVA'} onChange={(e) => setForm((s) => ({ ...s, stato: e.target.value as any }))} size="small">
              {statoOptions.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField label="Note" value={form.note || ''} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} multiline rows={3} sx={{ gridColumn: { md: '1 / -1' } }} size="small" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, md: 2 } }}>
          <Button onClick={() => { setOpen(false); setEditing(null) }}>Annulla</Button>
          <Button variant="contained" onClick={onSave}>Salva</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
