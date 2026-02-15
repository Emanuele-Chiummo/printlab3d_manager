import React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import api from '../api/client'
import { Filament } from '../api/types'
import { useAuth } from '../components/AuthProvider'

const empty: Partial<Filament> = {
  materiale: 'PLA',
  marca: '',
  colore: '',
  diametro_mm: 1.75,
  peso_nominale_g: 1000,
  costo_spool_eur: 0,
  peso_residuo_g: 0,
  soglia_min_g: 100,
  note: '',
  ubicazione_id: null,
}

export default function FilamentiPage() {
  const { user } = useAuth()
  const [rows, setRows] = React.useState<Filament[]>([])
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Filament | null>(null)
  const [form, setForm] = React.useState<Partial<Filament>>(empty)

  const load = () => api.get('/api/v1/filaments/').then((r) => setRows(r.data))
  React.useEffect(() => {
    void load()
  }, [])

  const canWrite = user?.role === 'ADMIN' || user?.role === 'OPERATORE'
  const canDelete = user?.role === 'ADMIN'

  const onNew = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }

  const onEdit = (f: Filament) => {
    setEditing(f)
    setForm({ ...f })
    setOpen(true)
  }

  const onSave = async () => {
    const payload = { ...form }
    if (editing) {
      await api.put(`/api/v1/filaments/${editing.id}/`, payload)
    } else {
      await api.post('/api/v1/filaments/', payload)
    }
    setOpen(false)
    await load()
  }

  const onDelete = async (f: Filament) => {
    if (!confirm('Eliminare il filamento?')) return
    await api.delete(`/api/v1/filaments/${f.id}/`)
    await load()
  }

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Filamenti</Typography>
        {canWrite && (
          <Button variant="contained" onClick={onNew}>
            Nuovo
          </Button>
        )}
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Materiale</TableCell>
            <TableCell>Marca</TableCell>
            <TableCell>Colore</TableCell>
            <TableCell align="right">Residuo (g)</TableCell>
            <TableCell align="right">Soglia (g)</TableCell>
            <TableCell align="right">Costo bobina (€)</TableCell>
            <TableCell>Stato</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => {
            const low = r.peso_residuo_g <= r.soglia_min_g
            return (
              <TableRow key={r.id} hover>
                <TableCell>{r.materiale}</TableCell>
                <TableCell>{r.marca}</TableCell>
                <TableCell>{r.colore}</TableCell>
                <TableCell align="right">{r.peso_residuo_g}</TableCell>
                <TableCell align="right">{r.soglia_min_g}</TableCell>
                <TableCell align="right">{r.costo_spool_eur}</TableCell>
                <TableCell>{low ? <Chip label="Basso" color="warning" size="small" /> : <Chip label="OK" size="small" />}</TableCell>
                <TableCell align="right">
                  {canWrite && (
                    <IconButton onClick={() => onEdit(r)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {canDelete && (
                    <IconButton onClick={() => onDelete(r)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Modifica filamento' : 'Nuovo filamento'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField label="Materiale" value={form.materiale || ''} onChange={(e) => setForm((s) => ({ ...s, materiale: e.target.value }))} />
            <TextField label="Marca" value={form.marca || ''} onChange={(e) => setForm((s) => ({ ...s, marca: e.target.value }))} />
            <TextField label="Colore" value={form.colore || ''} onChange={(e) => setForm((s) => ({ ...s, colore: e.target.value }))} />
            <TextField label="Diametro (mm)" type="number" value={form.diametro_mm ?? 1.75} onChange={(e) => setForm((s) => ({ ...s, diametro_mm: Number(e.target.value) }))} />
            <TextField label="Peso nominale (g)" type="number" value={form.peso_nominale_g ?? 1000} onChange={(e) => setForm((s) => ({ ...s, peso_nominale_g: Number(e.target.value) }))} />
            <TextField label="Costo bobina (€)" type="number" value={form.costo_spool_eur ?? 0} onChange={(e) => setForm((s) => ({ ...s, costo_spool_eur: Number(e.target.value) }))} />
            <TextField label="Peso residuo (g)" type="number" value={form.peso_residuo_g ?? 0} onChange={(e) => setForm((s) => ({ ...s, peso_residuo_g: Number(e.target.value) }))} />
            <TextField label="Soglia minima (g)" type="number" value={form.soglia_min_g ?? 100} onChange={(e) => setForm((s) => ({ ...s, soglia_min_g: Number(e.target.value) }))} />
            <TextField label="Note" value={form.note || ''} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} multiline minRows={2} sx={{ gridColumn: { md: '1 / -1' } }} />
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
