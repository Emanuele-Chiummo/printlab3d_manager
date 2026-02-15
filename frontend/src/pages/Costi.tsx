import React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Stack,
  MenuItem,
  Paper,
  Chip,
} from '@mui/material'
import api from '../api/client'
import { useAuth } from '../components/AuthProvider'
import { CostCategory, CostEntry, CostMonthly, CostByJob, CostByCustomer, Job, Customer } from '../api/types'

function yyyymmNow(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${d.getFullYear()}-${m}`
}

export default function CostiPage() {
  const { user } = useAuth()
  const canWriteCategories = user?.role === 'ADMIN'
  const canWriteEntries = user?.role === 'ADMIN' || user?.role === 'OPERATORE'

  const [tab, setTab] = React.useState(0)

  const [categories, setCategories] = React.useState<CostCategory[]>([])
  const [entries, setEntries] = React.useState<CostEntry[]>([])
  const [jobs, setJobs] = React.useState<Job[]>([])
  const [customers, setCustomers] = React.useState<Customer[]>([])

  const [catDialog, setCatDialog] = React.useState(false)
  const [newCat, setNewCat] = React.useState({ nome: '', descrizione: '' })

  const [entryDialog, setEntryDialog] = React.useState(false)
  const [newEntry, setNewEntry] = React.useState({ categoria_id: 0, importo_eur: 0, periodo_yyyymm: yyyymmNow(), job_id: '' as any, note: '' })

  const [filterFrom, setFilterFrom] = React.useState('')
  const [filterTo, setFilterTo] = React.useState('')
  const [filterCategory, setFilterCategory] = React.useState('')
  const [filterSearch, setFilterSearch] = React.useState('')

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)

  const [monthly, setMonthly] = React.useState<CostMonthly[]>([])
  const [byJob, setByJob] = React.useState<CostByJob[]>([])
  const [byCustomer, setByCustomer] = React.useState<CostByCustomer[]>([])

  const loadCategories = () => api.get('/api/v1/costs/categories').then((r) => setCategories(r.data))
  const loadEntries = () => {
    const params: any = {}
    if (filterFrom) params.periodo_from = filterFrom
    if (filterTo) params.periodo_to = filterTo
    if (filterCategory) params.categoria_id = Number(filterCategory)
    return api.get('/api/v1/costs/entries', { params }).then((r) => setEntries(r.data))
  }
  const loadJobs = () => api.get('/api/v1/jobs/').then((r) => setJobs(r.data))
  const loadCustomers = () => api.get('/api/v1/customers/').then((r) => setCustomers(r.data))

  const loadReports = async () => {
    const params: any = {}
    if (filterFrom) params.periodo_from = filterFrom
    if (filterTo) params.periodo_to = filterTo
    const [m, bj, bc] = await Promise.all([
      api.get('/api/v1/costs/reports/monthly', { params }),
      api.get('/api/v1/costs/reports/by-job', { params }),
      api.get('/api/v1/costs/reports/by-customer', { params }),
    ])
    setMonthly(m.data)
    setByJob(bj.data)
    setByCustomer(bc.data)
  }

  React.useEffect(() => {
    void loadCategories()
    void loadJobs()
    void loadCustomers()
  }, [])

  React.useEffect(() => {
    void loadEntries()
    void loadReports()
  }, [filterFrom, filterTo, filterCategory])

  const createCategory = async () => {
    if (!newCat.nome.trim()) return alert('Inserisci un nome categoria')
    await api.post('/api/v1/costs/categories', newCat)
    setCatDialog(false)
    setNewCat({ nome: '', descrizione: '' })
    await loadCategories()
  }

  const createEntry = async () => {
    const payload: any = {
      categoria_id: Number(newEntry.categoria_id),
      importo_eur: Number(newEntry.importo_eur),
      periodo_yyyymm: newEntry.periodo_yyyymm,
      job_id: newEntry.job_id ? Number(newEntry.job_id) : null,
      note: newEntry.note,
    }
    if (!payload.categoria_id) return alert('Seleziona una categoria')
    if (!payload.periodo_yyyymm) return alert('Periodo obbligatorio (YYYY-MM)')
    await api.post('/api/v1/costs/entries', payload)
    setEntryDialog(false)
    setNewEntry({ categoria_id: categories[0]?.id ?? 0, importo_eur: 0, periodo_yyyymm: yyyymmNow(), job_id: '', note: '' })
    await loadEntries()
    await loadReports()
  }

  const catName = (id: number) => categories.find((c) => c.id === id)?.nome || `#${id}`

  const filtered = entries.filter((e) => {
    if (!filterSearch.trim()) return true
    const s = filterSearch.toLowerCase()
    return (e.note || '').toLowerCase().includes(s) || catName(e.categoria_id).toLowerCase().includes(s) || (e.periodo_yyyymm || '').toLowerCase().includes(s)
  })

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Costi
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            label="Periodo da (YYYY-MM)"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            placeholder="2026-02"
            sx={{ width: 220 }}
          />
          <TextField
            label="Periodo a (YYYY-MM)"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            placeholder="2026-03"
            sx={{ width: 220 }}
          />
          <TextField
            select
            label="Categoria"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            sx={{ width: 260 }}
          >
            <MenuItem value="">Tutte</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.nome}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ flex: 1 }} />
          <TextField
            label="Ricerca"
            value={filterSearch}
            onChange={(e) => {
              setFilterSearch(e.target.value)
              setPage(0)
            }}
            sx={{ width: { xs: '100%', md: 320 } }}
          />
        </Stack>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Registrazioni" />
        <Tab label="Categorie" />
        <Tab label="Report" />
      </Tabs>

      {tab === 0 && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6">Registrazioni costi</Typography>
            {canWriteEntries && (
              <Button variant="contained" onClick={() => {
                setNewEntry((s) => ({ ...s, categoria_id: categories[0]?.id ?? 0 }))
                setEntryDialog(true)
              }}>
                Nuovo costo
              </Button>
            )}
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Periodo</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Job</TableCell>
                <TableCell align="right">Importo (€)</TableCell>
                <TableCell>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>{e.periodo_yyyymm}</TableCell>
                  <TableCell>{catName(e.categoria_id)}</TableCell>
                  <TableCell>{e.job_id ? `#${e.job_id}` : '-'}</TableCell>
                  <TableCell align="right">{Number(e.importo_eur).toFixed(2)}</TableCell>
                  <TableCell>{e.note || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />

          <Dialog open={entryDialog} onClose={() => setEntryDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Nuovo costo</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                <TextField
                  select
                  label="Categoria"
                  value={newEntry.categoria_id || ''}
                  onChange={(e) => setNewEntry((s) => ({ ...s, categoria_id: Number(e.target.value) }))}
                >
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nome}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Periodo (YYYY-MM)"
                  value={newEntry.periodo_yyyymm}
                  onChange={(e) => setNewEntry((s) => ({ ...s, periodo_yyyymm: e.target.value }))}
                />
                <TextField
                  label="Importo (€)"
                  type="number"
                  value={newEntry.importo_eur}
                  onChange={(e) => setNewEntry((s) => ({ ...s, importo_eur: Number(e.target.value) }))}
                />
                <TextField
                  select
                  label="Job (opzionale)"
                  value={newEntry.job_id}
                  onChange={(e) => setNewEntry((s) => ({ ...s, job_id: e.target.value }))}
                >
                  <MenuItem value="">Nessuno</MenuItem>
                  {jobs.map((j) => (
                    <MenuItem key={j.id} value={String(j.id)}>
                      #{j.id} ({j.status})
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Note"
                  value={newEntry.note}
                  onChange={(e) => setNewEntry((s) => ({ ...s, note: e.target.value }))}
                  multiline
                  minRows={2}
                  sx={{ gridColumn: { md: '1 / -1' } }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEntryDialog(false)}>Annulla</Button>
              <Button variant="contained" onClick={createEntry}>Salva</Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {tab === 1 && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6">Categorie costo</Typography>
            {canWriteCategories && (
              <Button variant="contained" onClick={() => setCatDialog(true)}>
                Nuova categoria
              </Button>
            )}
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrizione</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.nome}</TableCell>
                  <TableCell>{c.descrizione}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Dialog open={catDialog} onClose={() => setCatDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Nuova categoria</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                <TextField label="Nome" value={newCat.nome} onChange={(e) => setNewCat((s) => ({ ...s, nome: e.target.value }))} />
                <TextField label="Descrizione" value={newCat.descrizione} onChange={(e) => setNewCat((s) => ({ ...s, descrizione: e.target.value }))} multiline minRows={2} />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCatDialog(false)}>Annulla</Button>
              <Button variant="contained" onClick={createCategory}>Salva</Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {tab === 2 && (
        <>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Costi per mese</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Periodo</TableCell>
                    <TableCell align="right">Totale (€)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthly.map((r) => (
                    <TableRow key={r.periodo_yyyymm}>
                      <TableCell>{r.periodo_yyyymm}</TableCell>
                      <TableCell align="right">{Number(r.totale_eur).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Costi per cliente (top)</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell align="right">Totale (€)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {byCustomer.map((r) => (
                    <TableRow key={r.customer_id}>
                      <TableCell>{r.ragione_sociale}</TableCell>
                      <TableCell align="right">{Number(r.totale_eur).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Stack>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Costi per job</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Job</TableCell>
                  <TableCell>Preventivo</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell align="right">Totale (€)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {byJob.map((r) => (
                  <TableRow key={r.job_id} hover>
                    <TableCell>#{r.job_id}</TableCell>
                    <TableCell>{r.quote_code}</TableCell>
                    <TableCell>{r.customer_name}</TableCell>
                    <TableCell align="right">{Number(r.totale_eur).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ mt: 1, color: 'text.secondary', fontSize: 12 }}>
              <Chip size="small" label="Suggerimento" sx={{ mr: 1 }} />
              Associa le registrazioni costo a un job per avere ripartizione più accurata.
            </Box>
          </Paper>
        </>
      )}
    </>
  )
}
