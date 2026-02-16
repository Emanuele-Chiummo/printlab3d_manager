import React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Menu,
  MenuItem,
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
import api from '../api/client'
import { Customer } from '../api/types'
import { useAuth } from '../components/AuthProvider'

const empty: Partial<Customer> = {
  tipo_cliente: 'DITTA',
  ragione_sociale: '',
  nome: '',
  cognome: '',
  codice_fiscale: '',
  piva: '',
  email: '',
  telefono: '',
  indirizzo: '',
  note: ''
}

export default function ClientiPage() {
  const { user } = useAuth()
  const [rows, setRows] = React.useState<Customer[]>([])
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Customer | null>(null)
  const [form, setForm] = React.useState<Partial<Customer>>(empty)
  const [anchorEl, setAnchorEl] = React.useState<{ [key: number]: HTMLElement | null }>({})

  const load = () => api.get('/api/v1/customers/').then((r) => setRows(r.data))
  React.useEffect(() => {
    void load()
  }, [])

  const canWrite = user?.role === 'ADMIN' || user?.role === 'OPERATORE' || user?.role === 'COMMERCIALE'
  const canDelete = user?.role === 'ADMIN'

  const onNew = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }
  const onEdit = (c: Customer) => {
    setEditing(c)
    setForm({ ...c })
    setOpen(true)
  }
  const onSave = async () => {
    if (editing) await api.put(`/api/v1/customers/${editing.id}`, form)
    else await api.post('/api/v1/customers/', form)
    setOpen(false)
    await load()
  }
  const onDelete = async (c: Customer) => {
    if (!confirm('Eliminare il cliente?')) return
    await api.delete(`/api/v1/customers/${c.id}`)
    await load()
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
            Clienti
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Gestisci clienti privati e aziende con dettagli completi.
          </Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" onClick={onNew}>
            Nuovo cliente
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Elenco clienti
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {rows.length} clienti registrati
            </Typography>
          </Box>
        </Stack>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ragione sociale / Nome</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Telefono</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Indirizzo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }} />
              </TableRow>
            </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>{r.tipo_cliente}</TableCell>
              <TableCell>
                {r.tipo_cliente === 'DITTA' ? r.ragione_sociale : `${r.nome} ${r.cognome}`}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{r.email}</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{r.telefono}</TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{r.indirizzo}</TableCell>
              <TableCell align="right">
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
                  {canWrite && (
                    <MenuItem onClick={() => { onEdit(r); setAnchorEl({ ...anchorEl, [r.id]: null }) }}>
                      <EditIcon fontSize="small" sx={{ mr: 1 }} /> Modifica
                    </MenuItem>
                  )}
                  {canDelete && (
                    <MenuItem onClick={() => { onDelete(r); setAnchorEl({ ...anchorEl, [r.id]: null }) }}>
                      <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" /> Elimina
                    </MenuItem>
                  )}
                </Menu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Modifica cliente' : 'Nuovo cliente'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField
              select
              label="Tipo cliente"
              value={form.tipo_cliente || 'DITTA'}
              onChange={(e) => setForm((s) => ({ ...s, tipo_cliente: e.target.value }))}
              SelectProps={{ native: true }}
              sx={{ gridColumn: { md: '1 / -1' } }}
            >
              <option value="DITTA">Ditta</option>
              <option value="PERSONA">Persona</option>
            </TextField>
            {form.tipo_cliente === 'DITTA' ? (
              <>
                <TextField label="Ragione sociale" value={form.ragione_sociale || ''} onChange={(e) => setForm((s) => ({ ...s, ragione_sociale: e.target.value }))} sx={{ gridColumn: { md: '1 / -1' } }} />
                <TextField label="P.IVA" value={form.piva || ''} onChange={(e) => setForm((s) => ({ ...s, piva: e.target.value }))} />
              </>
            ) : (
              <>
                <TextField label="Nome" value={form.nome || ''} onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))} />
                <TextField label="Cognome" value={form.cognome || ''} onChange={(e) => setForm((s) => ({ ...s, cognome: e.target.value }))} />
                <TextField label="Codice fiscale" value={form.codice_fiscale || ''} onChange={(e) => setForm((s) => ({ ...s, codice_fiscale: e.target.value }))} />
              </>
            )}
            <TextField label="Email" value={form.email || ''} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
            <TextField label="Telefono" value={form.telefono || ''} onChange={(e) => setForm((s) => ({ ...s, telefono: e.target.value }))} />
            <TextField label="Indirizzo" value={form.indirizzo || ''} onChange={(e) => setForm((s) => ({ ...s, indirizzo: e.target.value }))} sx={{ gridColumn: { md: '1 / -1' } }} />
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
