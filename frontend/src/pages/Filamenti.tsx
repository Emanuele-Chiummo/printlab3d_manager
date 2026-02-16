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
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import api from '../api/client'
import { Filament } from '../api/types'
import { useAuth } from '../components/AuthProvider'

const empty: Partial<Filament> = {
  materiale: 'PLA',
  marca: '',
  colore: '',
  colore_hex: '#FFFFFF',
  diametro_mm: 1.75,
  peso_nominale_g: 1000,
  costo_spool_eur: 0,
  peso_residuo_g: 0,
  soglia_min_g: 100,
  stato: 'DISPONIBILE',
  data_acquisto: null,
  note: '',
  ubicazione_id: null,
}

const statoOptions = [
  { value: 'DISPONIBILE', label: 'Disponibile', color: 'success' },
  { value: 'IN_USO', label: 'In uso', color: 'info' },
  { value: 'FINITO', label: 'Finito', color: 'error' },
  { value: 'SECCO', label: 'Secco', color: 'warning' },
  { value: 'DA_ASCIUGARE', label: 'Da asciugare', color: 'default' },
] as const

export default function FilamentiPage() {
  const { user } = useAuth()
  const [rows, setRows] = React.useState<Filament[]>([])
  const [locations, setLocations] = React.useState<any[]>([])
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Filament | null>(null)
  const [form, setForm] = React.useState<Partial<Filament>>(empty)
  const [searchText, setSearchText] = React.useState('')
  const [filterStato, setFilterStato] = React.useState('')
  const [filterUbicazione, setFilterUbicazione] = React.useState('')
  const [anchorEl, setAnchorEl] = React.useState<{ [key: number]: HTMLElement | null }>({})

  const load = () => api.get('/api/v1/filaments/').then((r) => setRows(r.data))
  const loadLocations = () => api.get('/api/v1/locations/').then((r) => setLocations(r.data))
  
  React.useEffect(() => {
    void load()
    void loadLocations()
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

  const onDuplicate = (f: Filament) => {
    setEditing(null)
    const { id, ...rest } = f
    setForm({ ...rest, peso_residuo_g: f.peso_nominale_g })
    setOpen(true)
  }

  const onSave = async () => {
    const payload = { ...form }
    if (editing) {
      await api.put(`/api/v1/filaments/${editing.id}`, payload)
    } else {
      await api.post('/api/v1/filaments/', payload)
    }
    setOpen(false)
    await load()
  }

  const onDelete = async (f: Filament) => {
    if (!confirm('Eliminare il filamento?')) return
    await api.delete(`/api/v1/filaments/${f.id}`)
    await load()
  }

  const filteredRows = React.useMemo(() => {
    return rows.filter(r => {
      const searchLower = searchText.toLowerCase()
      const matchSearch = !searchText || 
        r.materiale.toLowerCase().includes(searchLower) ||
        r.marca.toLowerCase().includes(searchLower) ||
        r.colore.toLowerCase().includes(searchLower)
      const matchStato = !filterStato || r.stato === filterStato
      const matchUbicazione = !filterUbicazione || String(r.ubicazione_id) === filterUbicazione
      return matchSearch && matchStato && matchUbicazione
    })
  }, [rows, searchText, filterStato, filterUbicazione])

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
            Filamenti
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Gestisci materiali, scorte e ubicazioni con filtri avanzati.
          </Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" onClick={onNew}>
            Nuovo filamento
          </Button>
        )}
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField 
          size="small" 
          placeholder="Cerca materiale, marca, colore..." 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flex: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Stato</InputLabel>
          <Select
            value={filterStato}
            label="Stato"
            onChange={(e) => setFilterStato(e.target.value)}
          >
            <MenuItem value=""><em>Tutti</em></MenuItem>
            {statoOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Ubicazione</InputLabel>
          <Select
            value={filterUbicazione}
            label="Ubicazione"
            onChange={(e) => setFilterUbicazione(e.target.value)}
          >
            <MenuItem value=""><em>Tutte</em></MenuItem>
            {locations.map(loc => (
              <MenuItem key={loc.id} value={String(loc.id)}>{loc.nome}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {(searchText || filterStato || filterUbicazione) && (
          <Button size="small" onClick={() => { setSearchText(''); setFilterStato(''); setFilterUbicazione('') }}>
            Reset filtri
          </Button>
        )}
      </Stack>

      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Inventario filamenti
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {filteredRows.length} filamenti visualizzati
            </Typography>
          </Box>
        </Stack>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableCell sx={{ fontWeight: 600 }}>Materiale</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Marca</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Colore</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Ubicazione</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Data acquisto</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Residuo (g)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Soglia (g)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Costo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>€/g</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Stato</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }} />
              </TableRow>
            </TableHead>
        <TableBody>
          {filteredRows.map((r) => {
            const low = r.peso_residuo_g <= r.soglia_min_g
            return (
              <TableRow key={r.id} hover>
                <TableCell>{r.materiale}</TableCell>
                <TableCell>{r.marca}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {r.colore_hex && (
                      <Box 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          backgroundColor: r.colore_hex,
                          border: '1px solid #ddd',
                          borderRadius: 1,
                          flexShrink: 0
                        }} 
                      />
                    )}
                    <Typography variant="body2">{r.colore}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  {r.ubicazione_id ? (
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {locations.find(l => l.id === r.ubicazione_id)?.nome || `ID ${r.ubicazione_id}`}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', fontStyle: 'italic' }}>—</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                  {r.data_acquisto ? (
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {new Date(r.data_acquisto).toLocaleDateString('it-IT')}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', fontStyle: 'italic' }}>—</Typography>
                  )}
                </TableCell>
                <TableCell align="right">{r.peso_residuo_g}</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{r.soglia_min_g}</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>€ {r.costo_spool_eur.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                  {r.peso_nominale_g > 0 ? `€ ${(r.costo_spool_eur / r.peso_nominale_g).toFixed(3)}` : '—'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={statoOptions.find(s => s.value === r.stato)?.label || r.stato} 
                    color={(statoOptions.find(s => s.value === r.stato)?.color as any) || 'default'} 
                    size="small" 
                  />
                  {low && <Chip label="Stock basso" color="warning" size="small" sx={{ ml: 1 }} />}
                </TableCell>
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
                    {canWrite && (
                      <MenuItem onClick={() => { onDuplicate(r); setAnchorEl({ ...anchorEl, [r.id]: null }) }}>
                        <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Duplica
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
            )
          })}
        </TableBody>
        </Table>
      </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Modifica filamento' : 'Nuovo filamento'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField label="Materiale" value={form.materiale || ''} onChange={(e) => setForm((s) => ({ ...s, materiale: e.target.value }))} />
            <TextField label="Marca" value={form.marca || ''} onChange={(e) => setForm((s) => ({ ...s, marca: e.target.value }))} />
            <TextField label="Colore" value={form.colore || ''} onChange={(e) => setForm((s) => ({ ...s, colore: e.target.value }))} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Colore esadecimale
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input
                  type="color"
                  value={form.colore_hex || '#FFFFFF'}
                  onChange={(e) => setForm((s) => ({ ...s, colore_hex: e.target.value }))}
                  style={{ 
                    width: '60px', 
                    height: '40px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <TextField 
                  size="small"
                  value={form.colore_hex || '#FFFFFF'} 
                  onChange={(e) => setForm((s) => ({ ...s, colore_hex: e.target.value }))}
                  placeholder="#FFFFFF"
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
            <TextField label="Diametro (mm)" type="number" value={form.diametro_mm ?? 1.75} onChange={(e) => setForm((s) => ({ ...s, diametro_mm: Number(e.target.value) }))} />
            <TextField label="Peso nominale (g)" type="number" value={form.peso_nominale_g ?? 1000} onChange={(e) => setForm((s) => ({ ...s, peso_nominale_g: Number(e.target.value) }))} />
            <TextField label="Costo bobina (€)" type="number" value={form.costo_spool_eur ?? 0} onChange={(e) => setForm((s) => ({ ...s, costo_spool_eur: Number(e.target.value) }))} />
            <TextField label="Peso residuo (g)" type="number" value={form.peso_residuo_g ?? 0} onChange={(e) => setForm((s) => ({ ...s, peso_residuo_g: Number(e.target.value) }))} />
            <TextField label="Soglia minima (g)" type="number" value={form.soglia_min_g ?? 100} onChange={(e) => setForm((s) => ({ ...s, soglia_min_g: Number(e.target.value) }))} />
            <FormControl fullWidth>
              <InputLabel>Ubicazione</InputLabel>
              <Select
                value={form.ubicazione_id ?? ''}
                label="Ubicazione"
                onChange={(e) => setForm((s) => ({ ...s, ubicazione_id: e.target.value ? Number(e.target.value) : null }))}
              >
                <MenuItem value=""><em>Nessuna</em></MenuItem>
                {locations.map(loc => (
                  <MenuItem key={loc.id} value={loc.id}>{loc.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Stato</InputLabel>
              <Select
                value={form.stato || 'DISPONIBILE'}
                label="Stato"
                onChange={(e) => setForm((s) => ({ ...s, stato: e.target.value }))}
              >
                {statoOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField 
              label="Data acquisto" 
              type="date" 
              value={form.data_acquisto || ''} 
              onChange={(e) => setForm((s) => ({ ...s, data_acquisto: e.target.value || null }))} 
              InputLabelProps={{ shrink: true }}
            />
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
