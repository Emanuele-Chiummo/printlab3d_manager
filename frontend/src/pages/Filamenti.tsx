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
  TableSortLabel,
  TableRow,
  TextField,
  Typography,
  Chip,
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
  tipo: '',
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

type Order = 'asc' | 'desc'
type FilamentOrderBy =
  | 'id'
  | 'materiale'
  | 'tipo'
  | 'marca'
  | 'colore'
  | 'ubicazione'
  | 'peso_residuo_g'
  | 'soglia_min_g'
  | 'costo_spool_eur'
  | 'eur_g'
  | 'stato'

function compareNullable(a: string | number | null, b: string | number | null) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'it', { sensitivity: 'base' })
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilized = array.map((el, index) => [el, index] as const)
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilized.map((el) => el[0])
}

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
  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<FilamentOrderBy | ''>('id')

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

  const locationNameById = React.useMemo(() => {
    const map = new Map<number, string>()
    locations.forEach((l) => {
      if (typeof l?.id === 'number') map.set(l.id, String(l.nome ?? ''))
    })
    return map
  }, [locations])

  const getSortValue = React.useCallback(
    (r: Filament, key: FilamentOrderBy): string | number | null => {
      switch (key) {
        case 'materiale':
          return r.materiale ?? ''
        case 'id':
          return r.id ?? 0
        case 'tipo':
          return r.tipo ?? ''
        case 'marca':
          return r.marca ?? ''
        case 'colore':
          return r.colore ?? ''
        case 'ubicazione':
          return r.ubicazione_id ? locationNameById.get(r.ubicazione_id) ?? '' : ''
        case 'peso_residuo_g':
          return r.peso_residuo_g ?? 0
        case 'soglia_min_g':
          return r.soglia_min_g ?? 0
        case 'costo_spool_eur':
          return r.costo_spool_eur ?? 0
        case 'eur_g':
          return r.peso_nominale_g > 0 ? r.costo_spool_eur / r.peso_nominale_g : null
        case 'stato':
          return statoOptions.find((s) => s.value === r.stato)?.label || r.stato
        default:
          return ''
      }
    },
    [locationNameById]
  )

  const handleRequestSort = (property: FilamentOrderBy) => {
    if (orderBy === property) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setOrderBy(property)
    setOrder('asc')
  }

  const filteredRows = React.useMemo(() => {
    return rows.filter(r => {
      // Hide finished filaments from the table by default.
      // They remain accessible by explicitly filtering Stato = FINITO.
      if (filterStato !== 'FINITO' && r.stato === 'FINITO') return false

      const searchLower = searchText.toLowerCase()
      const matchSearch = !searchText || 
        r.materiale.toLowerCase().includes(searchLower) ||
        r.tipo.toLowerCase().includes(searchLower) ||
        r.marca.toLowerCase().includes(searchLower) ||
        r.colore.toLowerCase().includes(searchLower)
      const matchStato = !filterStato || r.stato === filterStato
      const matchUbicazione = !filterUbicazione || String(r.ubicazione_id) === filterUbicazione
      return matchSearch && matchStato && matchUbicazione
    })
  }, [rows, searchText, filterStato, filterUbicazione])

  const visibleRows = React.useMemo(() => {
    if (!orderBy) return filteredRows
    const comparator = (a: Filament, b: Filament) => {
      const av = getSortValue(a, orderBy)
      const bv = getSortValue(b, orderBy)
      const cmp = compareNullable(av, bv)
      return order === 'asc' ? cmp : -cmp
    }
    return stableSort(filteredRows, comparator)
  }, [filteredRows, getSortValue, order, orderBy])

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
            Filamenti
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
            Gestisci materiali, scorte e ubicazioni con filtri avanzati.
          </Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" onClick={onNew} sx={{ width: { xs: '100%', sm: 'auto' }, fontWeight: 600 }}>
            Nuovo filamento
          </Button>
        )}
      </Box>

      <Stack direction="column" spacing={1.5} sx={{ mb: 2 }}>
        <TextField 
          size="small" 
          placeholder="Cerca materiale, tipo, marca, colore..." 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          fullWidth
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <FormControl size="small" fullWidth sx={{ sm: { maxWidth: 200 } }}>
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
          <FormControl size="small" fullWidth sx={{ sm: { maxWidth: 200 } }}>
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
            <Button size="small" onClick={() => { setSearchText(''); setFilterStato(''); setFilterUbicazione('') }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Reset filtri
            </Button>
          )}
        </Stack>
      </Stack>

      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', md: '1rem' } }}>
              Inventario filamenti
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.8rem' } }}>
              {filteredRows.length} filamenti visualizzati
            </Typography>
          </Box>
        </Stack>
        <TableContainer sx={{ maxHeight: { xs: '60vh', md: '520px' }, overflowX: { xs: 'auto', md: 'hidden' }, overflowY: 'auto' }}>
          <Table size="small" stickyHeader sx={{ tableLayout: { xs: 'auto', md: 'fixed' }, width: '100%' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableCell sx={{ fontWeight: 600, width: 90 }} sortDirection={orderBy === 'id' ? order : false}>
                  <TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleRequestSort('id')}>
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} sortDirection={orderBy === 'materiale' ? order : false}>
                  <TableSortLabel active={orderBy === 'materiale'} direction={orderBy === 'materiale' ? order : 'asc'} onClick={() => handleRequestSort('materiale')}>
                    Materiale
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }} sortDirection={orderBy === 'tipo' ? order : false}>
                  <TableSortLabel active={orderBy === 'tipo'} direction={orderBy === 'tipo' ? order : 'asc'} onClick={() => handleRequestSort('tipo')}>
                    Tipo
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }} sortDirection={orderBy === 'marca' ? order : false}>
                  <TableSortLabel active={orderBy === 'marca'} direction={orderBy === 'marca' ? order : 'asc'} onClick={() => handleRequestSort('marca')}>
                    Marca
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }} sortDirection={orderBy === 'colore' ? order : false}>
                  <TableSortLabel active={orderBy === 'colore'} direction={orderBy === 'colore' ? order : 'asc'} onClick={() => handleRequestSort('colore')}>
                    Colore
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }} sortDirection={orderBy === 'ubicazione' ? order : false}>
                  <TableSortLabel active={orderBy === 'ubicazione'} direction={orderBy === 'ubicazione' ? order : 'asc'} onClick={() => handleRequestSort('ubicazione')}>
                    Ubicazione
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={orderBy === 'peso_residuo_g' ? order : false}>
                  <TableSortLabel active={orderBy === 'peso_residuo_g'} direction={orderBy === 'peso_residuo_g' ? order : 'asc'} onClick={() => handleRequestSort('peso_residuo_g')}>
                    Residuo (g)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }} sortDirection={orderBy === 'costo_spool_eur' ? order : false}>
                  <TableSortLabel active={orderBy === 'costo_spool_eur'} direction={orderBy === 'costo_spool_eur' ? order : 'asc'} onClick={() => handleRequestSort('costo_spool_eur')}>
                    Costo
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: { xs: 110, sm: 180 } }} sortDirection={orderBy === 'stato' ? order : false}>
                  <TableSortLabel active={orderBy === 'stato'} direction={orderBy === 'stato' ? order : 'asc'} onClick={() => handleRequestSort('stato')}>
                    Stato
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }} />
              </TableRow>
            </TableHead>
        <TableBody>
          {visibleRows.map((r) => {
            const low = r.peso_residuo_g <= r.soglia_min_g
            const isFinito = r.stato === 'FINITO'
            const idLabel = `${(r.materiale || 'FIL').toUpperCase()}-${String(r.id).padStart(3, '0')}`
            return (
              <TableRow key={r.id} hover>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => canWrite && onEdit(r)}
                    disabled={!canWrite}
                    sx={{ minWidth: 0, px: 0, textTransform: 'none', fontWeight: 600 }}
                  >
                    {idLabel}
                  </Button>
                </TableCell>
                <TableCell>{r.materiale}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{r.tipo}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{r.marca}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
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
                      {locationNameById.get(r.ubicazione_id) || `ID ${r.ubicazione_id}`}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', fontStyle: 'italic' }}>—</Typography>
                  )}
                </TableCell>
                <TableCell align="right">{r.peso_residuo_g}</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>€ {r.costo_spool_eur.toFixed(2)}</TableCell>
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    useFlexGap
                    flexWrap="nowrap"
                    sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}
                  >
                    <Chip
                      label={statoOptions.find(s => s.value === r.stato)?.label || r.stato}
                      color={(statoOptions.find(s => s.value === r.stato)?.color as any) || 'default'}
                      size="small"
                      sx={{
                        height: 'auto',
                        maxWidth: 'none',
                        py: 0.25,
                        '& .MuiChip-label': { whiteSpace: 'nowrap' },
                      }}
                    />
                    {low && !isFinito && <Chip label="Stock basso" color="warning" size="small" />}
                  </Stack>
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
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>{editing ? 'Modifica filamento' : 'Nuovo filamento'}</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField label="Materiale" value={form.materiale || ''} onChange={(e) => setForm((s) => ({ ...s, materiale: e.target.value }))} />
            <TextField label="Tipo" value={form.tipo || ''} onChange={(e) => setForm((s) => ({ ...s, tipo: e.target.value }))} placeholder="es. Basic, Plus, Matter" />
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
            <TextField
              label="€/g"
              value={
                form.peso_nominale_g && form.peso_nominale_g > 0
                  ? (Number(form.costo_spool_eur ?? 0) / Number(form.peso_nominale_g)).toFixed(3)
                  : '—'
              }
              InputProps={{ readOnly: true }}
            />
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
