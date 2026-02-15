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
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import api from '../api/client'
import { Customer, Filament, Quote, QuoteVersion } from '../api/types'
// ...existing code...
import { useAuth } from '../components/AuthProvider'

export default function PreventiviPage() {
  const { user } = useAuth()
  const [quotes, setQuotes] = React.useState<Quote[]>([])
  const [selected, setSelected] = React.useState<Quote | null>(null)
  const [versions, setVersions] = React.useState<QuoteVersion[]>([])
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [filaments, setFilaments] = React.useState<Filament[]>([])

  const canWrite = user?.role === 'ADMIN' || user?.role === 'OPERATORE' || user?.role === 'COMMERCIALE'

  const loadQuotes = () => api.get('/api/v1/quotes/').then((r) => setQuotes(r.data))
  const loadCustomers = () => api.get('/api/v1/customers/').then((r) => {
    setCustomers(r.data)
  })
  const loadFilaments = () => api.get('/api/v1/filaments/').then((r) => setFilaments(r.data))
  const loadVersions = (qid: number) => api.get(`/api/v1/quotes/${qid}/versions`).then((r) => setVersions(r.data))

  React.useEffect(() => {
    void loadQuotes()
    void loadCustomers()
    void loadFilaments()
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
    await api.post(`/api/v1/quotes/${selected.id}/versions`, {
      ...params,
      righe: lines.map(line => ({
        descrizione: line.descrizione,
        filament_id: line.filament_id ? Number(line.filament_id) : null,
        quantita: Number(line.quantita),
        peso_materiale_g: Number(line.peso_materiale_g),
        tempo_stimato_min: Number(line.tempo_stimato_min),
        ore_manodopera_min: Number(line.ore_manodopera_min),
      })),
    })
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
      alert('Errore nel download del PDF');
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
      alert('Errore nella preview del PDF')
    }
  }

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Preventivi</Typography>
        {canWrite && (
          <Button variant="contained" onClick={() => setOpenQ(true)}>
            Nuovo preventivo
          </Button>
        )}
      </Stack>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' } }}>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Elenco
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Codice</TableCell>
                <TableCell>Cliente</TableCell>
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
                  <TableCell>{q.codice}</TableCell>
                  <TableCell>{(() => {
                    const cust = customers.find((c) => c.id === q.customer_id);
                    if (!cust) return q.customer_id;
                    if (cust.ragione_sociale && cust.ragione_sociale.trim() !== '') return cust.ragione_sociale;
                    return `${cust.nome} ${cust.cognome}`.trim();
                  })()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1">Versioni</Typography>
            {canWrite && selected && (
              <Button variant="outlined" onClick={() => setOpenV(true)}>
                Nuova versione
              </Button>
            )}
          </Stack>
          {!selected ? (
            <Typography color="text.secondary">Seleziona un preventivo</Typography>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>v</TableCell>
                    <TableCell>Stato</TableCell>
                    <TableCell align="right">Imponibile</TableCell>
                    <TableCell align="right">Totale</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {versions.map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell>{v.version_number}</TableCell>
                      <TableCell>
                        <Chip label={v.status} color={statusColor(v.status) as any} size="small" />
                      </TableCell>
                      <TableCell align="right">€ {v.totale_imponibile_eur.toFixed(2)}</TableCell>
                      <TableCell align="right">€ {v.totale_lordo_eur.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => previewPdf(v.id)}>
                          Anteprima PDF
                        </Button>
                        <Button size="small" onClick={() => downloadPdf(v.id)}>
                          Scarica PDF
                        </Button>
                        {canWrite && (
                          <>
                            <Button size="small" onClick={() => setStatus(v.id, 'INVIATO')}>
                              Invia
                            </Button>
                            <Button size="small" onClick={() => setStatus(v.id, 'ACCETTATO')}>
                              Accetta
                            </Button>
                            <Button size="small" onClick={() => setStatus(v.id, 'RIFIUTATO')}>
                              Rifiuta
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </Box>
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
            Parametri
          </Typography>
          {loadingParams || !params ? (
            <Typography color="text.secondary">Caricamento parametri...</Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
              {Object.entries(params)
                .filter(([k]) => k !== 'prezzo_unitario_vendita' && k !== 'applica_iva')
                .map(([k, v]) => (
                  <TextField key={k} label={k} type="number" value={v} onChange={(e) => setParams((s: any) => ({ ...s, [k]: Number(e.target.value) }))} />
                ))}
            </Box>
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
                  {filaments.map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.materiale} {f.marca} {f.colore}
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
    </>
  )
}
