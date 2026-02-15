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
  MenuItem,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { loadLocations, createLocation, updateLocation, deleteLocation } from '../services/locations'
import { Location } from '../api/types'
import { useAuth } from '../components/AuthProvider'

const empty: Partial<Location> = { nome: '', tipo: 'SLOT', parent_id: null }

export default function UbicazioniPage() {
  const { user } = useAuth()
  const [rows, setRows] = React.useState<Location[]>([])
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Location | null>(null)
  const [form, setForm] = React.useState<Partial<Location>>(empty)

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

  const tipoOptions = ['MAGAZZINO', 'SCAFFALE', 'RIPIANO', 'SLOT']

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Ubicazioni</Typography>
        {canWrite && (
          <Button variant="contained" onClick={onNew}>
            Nuova
          </Button>
        )}
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Parent ID</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>{r.nome}</TableCell>
              <TableCell>{r.tipo}</TableCell>
              <TableCell>{r.parent_id ?? '-'}</TableCell>
              <TableCell align="right">
                {canWrite && (
                  <IconButton onClick={() => onEdit(r)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Modifica ubicazione' : 'Nuova ubicazione'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField label="Nome" value={form.nome || ''} onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))} />
            <TextField select label="Tipo" value={form.tipo || 'SLOT'} onChange={(e) => setForm((s) => ({ ...s, tipo: e.target.value }))}>
              {tipoOptions.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Parent ID"
              type="number"
              value={form.parent_id ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, parent_id: e.target.value ? Number(e.target.value) : null }))}
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
