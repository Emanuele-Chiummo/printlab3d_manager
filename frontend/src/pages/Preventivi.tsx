import React from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
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
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import WorkIcon from '@mui/icons-material/Work'
import api from '../api/client'
import { Customer, Filament, Quote, QuoteVersion } from '../api/types'
import { showSuccess, showError } from '../utils/toast'
// ...existing code...
import { useAuth } from '../components/AuthProvider'

export default function PreventiviPage() {
  const { user } = useAuth()
  const [quotes, setQuotes] = React.useState<Quote[]>([])
  const [selected, setSelected] = React.useState<Quote | null>(null)
  const [versions, setVersions] = React.useState<QuoteVersion[]>([])
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [filaments, setFilaments] = React.useState<Filament[]>([])
  const [printers, setPrinters] = React.useState<any[]>([])
  const [anchorEl, setAnchorEl] = React.useState<{ [key: number]: HTMLElement | null }>({})
  const [detailVersion, setDetailVersion] = React.useState<QuoteVersion | null>(null)

  const canWrite = user?.role === 'ADMIN' || user?.role === 'OPERATORE' || user?.role === 'COMMERCIALE'
  const canCreateJob = user?.role === 'ADMIN' || user?.role === 'OPERATORE'

  const loadQuotes = () => api.get('/api/v1/quotes/').then((r) => setQuotes(r.data))
  const loadCustomers = () => api.get('/api/v1/customers/').then((r) => {
    setCustomers(r.data)
  })
  const loadFilaments = () => api.get('/api/v1/filaments/').then((r) => setFilaments(r.data))
  const loadPrinters = () => api.get('/api/v1/printers').then((r) => setPrinters(r.data))
  const loadVersions = (qid: number) => api.get(`/api/v1/quotes/${qid}/versions`).then((r) => setVersions(r.data))

  React.useEffect(() => {
    void loadQuotes()
    void loadCustomers()
    void loadFilaments()
    void loadPrinters()
  }, [])

  React.useEffect(() => {
    if (selected) void loadVersions(selected.id)
  }, [selected])

  // create quote
  const [openQ, setOpenQ] = React.useState(false)
  const [qCode, setQCode] = React.useState('PRV-' + String(Date.now()).slice(-4))
  const [qCust, setQCust] = React.useState<number | ''>('')

  const createQuote = async () => {
    await api.post('/api/v1/quotes/', { codice: qCode, customer_id: Number(qCust), note: '' })
    setOpenQ(false)
    await loadQuotes()
  }

  // create version
  const [openV, setOpenV] = React.useState(false)
  
  // Righe del preventivo (array)
  const [lines, setLines] = React.useState<Array<{
    descrizione: string
    filament_id: number | ''
    quantita: number
    peso_materiale_g: number
    tempo_stimato_min: number
    ore_manodopera_min: number
  }>>([
    {
      descrizione: 'Stampa 3D',
      filament_id: '',
      quantita: 1,
      peso_materiale_g: 0,
      tempo_stimato_min: 60,
      ore_manodopera_min: 0,
    }
  ])
  
  const addLine = () => {
    setLines([...lines, {
      descrizione: 'Stampa 3D',
      filament_id: '',
      quantita: 1,
      peso_materiale_g: 0,
      tempo_stimato_min: 60,
      ore_manodopera_min: 0,
    }])
  }
  
  const removeLine = (idx: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== idx))
    }
  }
  
  const updateLine = (idx: number, field: string, value: any) => {
    setLines(lines.map((line, i) => i === idx ? { ...line, [field]: value } : line))
  }
  
  const [params, setParams] = React.useState<any>(null)
  const [loadingParams, setLoadingParams] = React.useState(true)
  React.useEffect(() => {
    import('../api/settings').then(({ getPreventivoSettings }) => {
      getPreventivoSettings().then((s) => {
        setParams({
          printer_id: null,
          costo_macchina_eur_h: 0.08,
          costo_manodopera_eur_h: 0.0,
          potenza_w: 200.0,
          costo_energia_kwh: s.costo_kwh_eur,
          consumabili_fissi_eur: 0.0,
          overhead_pct: s.overhead_pct,
          rischio_pct: s.fattore_rischio_pct,
          margine_pct: s.margine_pct,
          sconto_eur: 0,
          iva_pct: 22,
          applica_iva: true,
          prezzo_unitario_vendita: null,
        })
        setLoadingParams(false)
      })
    })
  }, [])

  const createVersion = async () => {
    if (!selected || !params) return
    const payload = {
      printer_id: params.printer_id || null,
      costo_macchina_eur_h: Number(params.costo_macchina_eur_h),
      costo_manodopera_eur_h: Number(params.costo_manodopera_eur_h),
      potenza_w: Number(params.potenza_w),
      costo_energia_kwh: Number(params.costo_energia_kwh),
      consumabili_fissi_eur: Number(params.consumabili_fissi_eur),
      overhead_pct: Number(params.overhead_pct),
      rischio_pct: Number(params.rischio_pct),
      margine_pct: Number(params.margine_pct),
      sconto_eur: Number(params.sconto_eur),
      iva_pct: Number(params.iva_pct),
      applica_iva: params.applica_iva,
      prezzo_unitario_vendita: params.prezzo_unitario_vendita ? Number(params.prezzo_unitario_vendita) : null,
      righe: lines.map(line => ({
        descrizione: line.descrizione,
        filament_id: line.filament_id ? Number(line.filament_id) : null,
        quantita: Number(line.quantita),
        peso_materiale_g: Number(line.peso_materiale_g),
        tempo_stimato_min: Number(line.tempo_stimato_min),
        ore_manodopera_min: Number(line.ore_manodopera_min),
      })),
    }
    try {
      await api.post(`/api/v1/quotes/${selected.id}/versions`, payload)
      setOpenV(false)
      // Reset righe
      setLines([{
        descrizione: 'Stampa 3D',
        filament_id: '',
        quantita: 1,
        peso_materiale_g: 0,
        tempo_stimato_min: 60,
        ore_manodopera_min: 0,
      }])
      await loadVersions(selected.id)
    } catch (error: any) {
      showError('Errore nella creazione della versione: ' + (error.response?.data?.detail || error.message))
    }
  }

  const statusColor = (s: string) => {
    if (s === 'ACCETTATO') return 'success'
    if (s === 'RIFIUTATO') return 'error'
    if (s === 'INVIATO') return 'info'
    return 'default'
  }

  const setStatus = async (vid: number, status: string) => {
    await api.post(`/api/v1/quotes/versions/${vid}/set-status`, null, { params: { status_in: status } })
    if (selected) await loadVersions(selected.id)
  }

  const deleteQuote = async () => {
    if (!selected) return
    if (!confirm(`Confermi l'eliminazione del preventivo ${selected.codice}?`)) return
    try {
      await api.delete(`/api/v1/quotes/${selected.id}`)
      setSelected(null)
      setVersions([])
      await loadQuotes()
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Errore durante l\'eliminazione'
      showError(detail)
    }
  }

  const createJob = async (versionId: number) => {
    try {
      await api.post('/api/v1/jobs/from-quote', { quote_version_id: versionId })
      showSuccess('Job creato con successo!')
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Errore durante la creazione del job'
      showError(detail)
    }
  }


  // Scarica PDF con nome corretto
  const downloadPdf = async (vid: number) => {
    try {
      const response = await api.get(`/api/v1/quotes/versions/${vid}/pdf`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      // Estrai filename dall'header Content-Disposition
      let filename = 'preventivo.pdf';
      const cd = response.headers['content-disposition'];
      if (cd) {
        const match = cd.match(/filename="?([^";]+)"?/);
        if (match) filename = match[1];
      }
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      showError('Errore nel download del PDF');
    }
  }

  // Anteprima PDF (sempre untitled)
  const previewPdf = async (vid: number) => {
    try {
      const response = await api.get(`/api/v1/quotes/versions/${vid}/pdf`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (err) {
      showError('Errore nella preview del PDF')
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
            Preventivi
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Gestisci offerte, versioni e conversione in job da un’unica vista.
          </Typography>
        </Box>
        {canWrite && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" onClick={() => setOpenV(true)} disabled={!selected}>
              Nuova versione
            </Button>
            <Button variant="contained" onClick={() => setOpenQ(true)}>
              Nuovo preventivo
            </Button>
          </Stack>
        )}
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr' } }}>
        <Paper sx={{ p: { xs: 1.5, md: 2.5 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Elenco preventivi
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Ultimi {quotes.length} preventivi inseriti
              </Typography>
            </Box>
          </Stack>
          <TableContainer sx={{ maxHeight: 520, overflowX: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Codice</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.map((q) => (
                  <TableRow
                    key={q.id}
                    hover
                    selected={selected?.id === q.id}
                    onClick={() => setSelected(q)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: selected?.id === q.id ? 600 : 500 }}>{q.codice}</TableCell>
                    <TableCell>{(() => {
                      const cust = customers.find((c) => c.id === q.customer_id)
                      if (!cust) return q.customer_id
                      if (cust.ragione_sociale && cust.ragione_sociale.trim() !== '') return cust.ragione_sociale
                      return `${cust.nome} ${cust.cognome}`.trim()
                    })()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper sx={{ p: { xs: 1.5, md: 2.5 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Versioni e stato
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Aggiorna stato, genera PDF e crea job
              </Typography>
            </Box>
            {canWrite && selected && (
              <Button variant="text" color="error" size="small" onClick={deleteQuote}>
                Elimina
              </Button>
            )}
          </Stack>
          {!selected ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">Seleziona un preventivo per vedere i dettagli.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 520, overflowX: 'auto' }}>
              <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Versione</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Stato</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Imponibile</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Totale</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {versions.map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell 
                        sx={{ fontWeight: 600, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => setDetailVersion(v)}
                      >
                        v{v.version_number}
                      </TableCell>
                      <TableCell>
                        <Chip label={v.status} color={statusColor(v.status) as any} size="small" variant="filled" />
                      </TableCell>
                      <TableCell align="right">€ {v.totale_imponibile_eur.toFixed(2)}</TableCell>
                      <TableCell align="right">€ {v.totale_lordo_eur.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => setAnchorEl({ ...anchorEl, [v.id]: e.currentTarget })}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl[v.id]}
                          open={Boolean(anchorEl[v.id])}
                          onClose={() => setAnchorEl({ ...anchorEl, [v.id]: null })}
                        >
                          <MenuItem onClick={() => { previewPdf(v.id); setAnchorEl({ ...anchorEl, [v.id]: null }) }}>
                            <PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} /> Anteprima PDF
                          </MenuItem>
                          <MenuItem onClick={() => { downloadPdf(v.id); setAnchorEl({ ...anchorEl, [v.id]: null }) }}>
                            <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Scarica PDF
                          </MenuItem>
                          {canWrite && (
                            <>
                              <MenuItem onClick={() => { setStatus(v.id, 'INVIATO'); setAnchorEl({ ...anchorEl, [v.id]: null }) }}>
                                <SendIcon fontSize="small" sx={{ mr: 1 }} /> Segna come Inviato
                              </MenuItem>
                              <MenuItem onClick={() => { setStatus(v.id, 'ACCETTATO'); setAnchorEl({ ...anchorEl, [v.id]: null }) }}>
                                <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} color="success" /> Segna come Accettato
                              </MenuItem>
                              <MenuItem onClick={() => { setStatus(v.id, 'RIFIUTATO'); setAnchorEl({ ...anchorEl, [v.id]: null }) }}>
                                <CancelIcon fontSize="small" sx={{ mr: 1 }} color="error" /> Segna come Rifiutato
                              </MenuItem>
                            </>
                          )}
                          {canCreateJob && v.status === 'ACCETTATO' && (
                            <MenuItem onClick={() => { createJob(v.id); setAnchorEl({ ...anchorEl, [v.id]: null }) }}>
                              <WorkIcon fontSize="small" sx={{ mr: 1 }} color="success" /> Crea Job
                            </MenuItem>
                          )}
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <Dialog open={openQ} onClose={() => setOpenQ(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuovo preventivo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField label="Codice" value={qCode} onChange={(e) => setQCode(e.target.value)} />
            <TextField select label="Cliente" value={qCust} onChange={(e) => setQCust(e.target.value as any)}>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.ragione_sociale && c.ragione_sociale.trim() !== ''
                    ? c.ragione_sociale
                    : `${c.nome} ${c.cognome}`.trim()}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQ(false)}>Annulla</Button>
          <Button variant="contained" onClick={createQuote} disabled={!qCust}>
            Crea
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openV} onClose={() => setOpenV(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nuova versione</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Stampante
          </Typography>
          {loadingParams || !params ? (
            <Typography color="text.secondary">Caricamento parametri...</Typography>
          ) : (
            <>
              <Box sx={{ mt: 1, mb: 2 }}>
                <TextField
                  select
                  label="Seleziona stampante"
                  value={params.printer_id || ''}
                  onChange={(e) => {
                    const printerId = e.target.value ? Number(e.target.value) : null
                    const printer = printers.find(p => p.id === printerId)
                    setParams((s: any) => ({
                      ...s,
                      printer_id: printerId,
                      costo_macchina_eur_h: printer ? printer.totale_macchina_eur_h : 0.08,
                      potenza_w: printer ? printer.potenza_w : 200.0,
                    }))
                  }}
                  fullWidth
                  helperText={params.printer_id ? `Costo macchina: €${params.costo_macchina_eur_h.toFixed(4)}/h | Potenza: ${params.potenza_w}W` : 'Seleziona una stampante per calcolare automaticamente i costi'}
                >
                  <MenuItem value="">(Nessuna - valori manuali)</MenuItem>
                  {printers.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nome} - {p.modello} (€{p.totale_macchina_eur_h.toFixed(4)}/h)
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Parametri
              </Typography>
              <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                {Object.entries(params)
                  .filter(([k]) => k !== 'prezzo_unitario_vendita' && k !== 'applica_iva' && k !== 'printer_id')
                  .map(([k, v]) => (
                    <TextField 
                      key={k} 
                      label={k} 
                      type="number" 
                      value={v} 
                      onChange={(e) => setParams((s: any) => ({ ...s, [k]: Number(e.target.value) }))} 
                      disabled={params.printer_id && (k === 'costo_macchina_eur_h' || k === 'potenza_w')}
                      helperText={params.printer_id && (k === 'costo_macchina_eur_h' || k === 'potenza_w') ? 'Valore dalla stampante' : ''}
                    />
                  ))}
              </Box>
            </>
          )}
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={params?.applica_iva || false}
                  onChange={(e) => setParams((s: any) => ({ ...s, applica_iva: e.target.checked }))}
                />
              }
              label="Applica IVA"
            />
            {params?.applica_iva && (
              <TextField
                label="IVA %"
                type="number"
                value={params.iva_pct}
                onChange={(e) => setParams((s: any) => ({ ...s, iva_pct: Number(e.target.value) }))}
                sx={{ width: 120 }}
              />
            )}
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Prezzo di vendita (opzionale)</Typography>
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Prezzo unitario vendita (€/pz)"
              type="number"
              value={params?.prezzo_unitario_vendita || ''}
              onChange={(e) => setParams((s: any) => ({ ...s, prezzo_unitario_vendita: e.target.value ? Number(e.target.value) : null }))}
              helperText="Se impostato, sostituisce il prezzo calcolato con margine"
              fullWidth
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Righe preventivo</Typography>
            <Button size="small" onClick={addLine}>+ Aggiungi riga</Button>
          </Stack>
          
          {lines.map((line, idx) => (
            <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Riga {idx + 1} {idx === 0 && '(costi macchina/energia calcolati qui)'}
                </Typography>
                {lines.length > 1 && (
                  <Button size="small" color="error" onClick={() => removeLine(idx)}>Rimuovi</Button>
                )}
              </Stack>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' } }}>
                <TextField 
                  label="Descrizione" 
                  value={line.descrizione} 
                  onChange={(e) => updateLine(idx, 'descrizione', e.target.value)} 
                  sx={{ gridColumn: { md: '1 / span 2' } }} 
                />
                <TextField 
                  select 
                  label="Filamento" 
                  value={line.filament_id} 
                  onChange={(e) => updateLine(idx, 'filament_id', e.target.value)}
                >
                  <MenuItem value="">(nessuno)</MenuItem>
                  {filaments
                    .filter((f) => f.stato !== 'FINITO' || String(f.id) === String(line.filament_id))
                    .map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.materiale}{f.tipo ? ` ${f.tipo}` : ''} {f.marca} {f.colore} - {f.stato}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField 
                  label="Quantità" 
                  type="number" 
                  value={line.quantita} 
                  onChange={(e) => updateLine(idx, 'quantita', Math.max(1, Number(e.target.value)))} 
                />
                <TextField 
                  label="Materiale (g/pz)" 
                  type="number" 
                  value={line.peso_materiale_g} 
                  onChange={(e) => updateLine(idx, 'peso_materiale_g', Number(e.target.value))} 
                />
                <TextField 
                  label="Tempo stampa (min/pz)" 
                  type="number" 
                  value={line.tempo_stimato_min} 
                  onChange={(e) => updateLine(idx, 'tempo_stimato_min', Number(e.target.value))} 
                />
                <TextField 
                  label="Ore manodopera (min totali)" 
                  type="number" 
                  value={line.ore_manodopera_min} 
                  onChange={(e) => updateLine(idx, 'ore_manodopera_min', Number(e.target.value))}
                  helperText="Lavoro manuale totale"
                />
              </Box>
            </Box>
          ))}
          
          {params && lines.some(l => l.peso_materiale_g > 0 && l.tempo_stimato_min > 0) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Stima Costi Totale
                </Typography>
                {(() => {
                  // Somma costi per tutte le righe
                  let costoMateriale = 0
                  let costoEnergia = 0
                  let costoMacchina = 0
                  let costoManodopera = 0
                  let costoConsumabili = 0
                  let totalQty = 0
                  
                  lines.forEach((line, idx) => {
                    const qty = line.quantita || 1
                    totalQty += qty
                    
                    // Materiale (ogni riga)
                    const selectedFilament = filaments.find(f => f.id === line.filament_id)
                    const costoPerG = selectedFilament 
                      ? selectedFilament.costo_spool_eur / (selectedFilament.peso_nominale_g || 1000)
                      : 0
                    costoMateriale += line.peso_materiale_g * costoPerG * qty
                    
                    // Energia e macchina SOLO PRIMA RIGA
                    if (idx === 0) {
                      const printHours = line.tempo_stimato_min / 60
                      const energiaKwh = (params.potenza_w / 1000) * printHours
                      costoEnergia += energiaKwh * params.costo_energia_kwh * qty
                      costoMacchina += printHours * params.costo_macchina_eur_h * qty
                    }
                    
                    // Manodopera (ogni riga, NON moltiplicata per qty)
                    const laborHours = line.ore_manodopera_min / 60
                    costoManodopera += laborHours * params.costo_manodopera_eur_h
                    
                    // Consumabili (ogni riga)
                    costoConsumabili += params.consumabili_fissi_eur * qty
                  })
                  
                  // Subtotale diretti
                  const subtotaleDiretti = costoMateriale + costoEnergia + costoMacchina + costoManodopera + costoConsumabili
                  
                  // Overhead e rischio
                  const overhead = subtotaleDiretti * params.overhead_pct / 100
                  const rischio = subtotaleDiretti * params.rischio_pct / 100
                  
                  // Costo totale netto
                  const costoTotaleNetto = subtotaleDiretti + overhead + rischio
                  
                  // Prezzo con margine o override
                  const hasPrezzoVendita = params.prezzo_unitario_vendita && params.prezzo_unitario_vendita > 0
                  const prezzoVenditaTotale = hasPrezzoVendita ? params.prezzo_unitario_vendita * totalQty : 0
                  const prezzoNetto = hasPrezzoVendita ? prezzoVenditaTotale : costoTotaleNetto * (1 + params.margine_pct / 100)
                  const margineEffettivo = hasPrezzoVendita ? ((prezzoVenditaTotale - costoTotaleNetto) / costoTotaleNetto * 100) : params.margine_pct
                  
                  // Sconto
                  const prezzoScontato = Math.max(0, prezzoNetto - params.sconto_eur)
                  
                  // IVA (solo se applica_iva è true)
                  const iva = params.applica_iva ? (prezzoScontato * params.iva_pct / 100) : 0
                  const totale = prezzoScontato + iva
                  
                  return (
                    <Box sx={{ display: 'grid', gap: 1, fontSize: '0.875rem' }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Materiale:</Typography>
                        <Typography variant="body2">€ {costoMateriale.toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Energia (prima riga):</Typography>
                        <Typography variant="body2">€ {costoEnergia.toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Macchina (prima riga):</Typography>
                        <Typography variant="body2">€ {costoMacchina.toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Manodopera:</Typography>
                        <Typography variant="body2">€ {costoManodopera.toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Consumabili:</Typography>
                        <Typography variant="body2">€ {costoConsumabili.toFixed(2)}</Typography>
                      </Stack>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Subtotale diretti:</Typography>
                        <Typography variant="body2" fontWeight="bold">€ {subtotaleDiretti.toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Overhead ({params.overhead_pct}%):</Typography>
                        <Typography variant="body2">€ {overhead.toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Rischio ({params.rischio_pct}%):</Typography>
                        <Typography variant="body2">€ {rischio.toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Costo totale:</Typography>
                        <Typography variant="body2" fontWeight="bold">€ {costoTotaleNetto.toFixed(2)}</Typography>
                      </Stack>
                      <Divider />
                      {hasPrezzoVendita ? (
                        <>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Prezzo vendita ({totalQty > 1 ? `${params.prezzo_unitario_vendita.toFixed(2)} × ${totalQty}` : 'unitario'}):</Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary">€ {prezzoVenditaTotale.toFixed(2)}</Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Margine effettivo:</Typography>
                            <Typography variant="body2" color={margineEffettivo > 0 ? 'success.main' : 'error.main'}>
                              {margineEffettivo > 0 ? '+' : ''}{margineEffettivo.toFixed(1)}% (€ {(prezzoVenditaTotale - costoTotaleNetto).toFixed(2)})
                            </Typography>
                          </Stack>
                        </>
                      ) : (
                        <>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">+ Margine ({params.margine_pct}%):</Typography>
                            <Typography variant="body2">€ {(prezzoNetto - costoTotaleNetto).toFixed(2)}</Typography>
                          </Stack>
                        </>
                      )}
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Prezzo netto:</Typography>
                        <Typography variant="body2" fontWeight="bold">€ {prezzoNetto.toFixed(2)}</Typography>
                      </Stack>
                      {params.sconto_eur > 0 && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">- Sconto:</Typography>
                          <Typography variant="body2" color="error">€ {params.sconto_eur.toFixed(2)}</Typography>
                        </Stack>
                      )}
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">{params.applica_iva ? 'Imponibile' : 'Totale'}:</Typography>
                        <Typography variant="body2" fontWeight="bold">€ {prezzoScontato.toFixed(2)}</Typography>
                      </Stack>
                      {params.applica_iva && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">IVA ({params.iva_pct}%):</Typography>
                          <Typography variant="body2">€ {iva.toFixed(2)}</Typography>
                        </Stack>
                      )}
                      <Divider />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          {params.applica_iva ? 'Totale IVA inclusa' : 'Totale'}:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="primary">€ {totale.toFixed(2)}</Typography>
                      </Stack>
                    </Box>
                  )
                })()}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenV(false)}>Annulla</Button>
          <Button variant="contained" onClick={createVersion} disabled={loadingParams || !params}>
            Crea versione
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog dettaglio versione */}
      <Dialog open={Boolean(detailVersion)} onClose={() => setDetailVersion(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          Dettaglio versione {detailVersion?.version_number}
          {detailVersion && (
            <Chip 
              label={detailVersion.status} 
              color={statusColor(detailVersion.status) as any} 
              size="small" 
              sx={{ ml: 2 }} 
            />
          )}
        </DialogTitle>
        <DialogContent>
          {detailVersion && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Riepilogo generale */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Riepilogo economico
                </Typography>
                <Box sx={{ display: 'grid', gap: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Totale imponibile:</Typography>
                    <Typography variant="body2" fontWeight="bold">€ {detailVersion.totale_imponibile_eur.toFixed(2)}</Typography>
                  </Stack>
                  {detailVersion.totale_iva_eur > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">IVA:</Typography>
                      <Typography variant="body2">€ {detailVersion.totale_iva_eur.toFixed(2)}</Typography>
                    </Stack>
                  )}
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1" fontWeight="bold" color="primary">Totale lordo:</Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">€ {detailVersion.totale_lordo_eur.toFixed(2)}</Typography>
                  </Stack>
                </Box>
              </Box>

              {/* Parametri */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Parametri di calcolo
                </Typography>
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Costo macchina (€/h):</Typography>
                    <Typography variant="caption">{detailVersion.costo_macchina_eur_h?.toFixed(2) || '-'}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Costo manodopera (€/h):</Typography>
                    <Typography variant="caption">{detailVersion.costo_manodopera_eur_h?.toFixed(2) || '-'}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Potenza (W):</Typography>
                    <Typography variant="caption">{detailVersion.potenza_w?.toFixed(0) || '-'}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Costo energia (€/kWh):</Typography>
                    <Typography variant="caption">{detailVersion.costo_energia_kwh?.toFixed(4) || '-'}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Overhead (%):</Typography>
                    <Typography variant="caption">{detailVersion.overhead_pct?.toFixed(1) || '-'}%</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Rischio (%):</Typography>
                    <Typography variant="caption">{detailVersion.rischio_pct?.toFixed(1) || '-'}%</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Margine (%):</Typography>
                    <Typography variant="caption">{detailVersion.margine_pct?.toFixed(1) || '-'}%</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Sconto (€):</Typography>
                    <Typography variant="caption">{detailVersion.sconto_eur?.toFixed(2) || '-'}</Typography>
                  </Stack>
                  {detailVersion.applica_iva && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">IVA (%):</Typography>
                      <Typography variant="caption">{detailVersion.iva_pct?.toFixed(0) || '-'}%</Typography>
                    </Stack>
                  )}
                </Box>
              </Box>

              {/* Righe preventivo */}
              {detailVersion.righe && detailVersion.righe.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Righe preventivo
                  </Typography>
                  {detailVersion.righe.map((riga: any, idx: number) => (
                    <Paper key={idx} sx={{ p: 2, mb: 1.5, bgcolor: 'grey.50' }}>
                      <Stack spacing={1}>
                        <Typography variant="body2" fontWeight="bold">{riga.descrizione}</Typography>
                        <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">Filamento:</Typography>
                            <Typography variant="caption">
                              {riga.filament_id ? filaments.find(f => f.id === riga.filament_id)?.marca + ' ' + filaments.find(f => f.id === riga.filament_id)?.colore || `ID ${riga.filament_id}` : 'Nessuno'}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">Quantità:</Typography>
                            <Typography variant="caption">{riga.quantita} pz</Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">Peso materiale (g/pz):</Typography>
                            <Typography variant="caption">{riga.peso_materiale_g}g</Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">Tempo stampa (min/pz):</Typography>
                            <Typography variant="caption">{riga.tempo_stimato_min} min</Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">Manodopera (min tot):</Typography>
                            <Typography variant="caption">{riga.ore_manodopera_min} min</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Box>
              )}

              {/* Info versione */}
              <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  Versione #{detailVersion.version_number} - ID: {detailVersion.id}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailVersion(null)}>Chiudi</Button>
          {detailVersion && (
            <>
              <Button onClick={() => { previewPdf(detailVersion.id); setDetailVersion(null) }}>
                Anteprima PDF
              </Button>
              <Button variant="contained" onClick={() => { downloadPdf(detailVersion.id); setDetailVersion(null) }}>
                Scarica PDF
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
