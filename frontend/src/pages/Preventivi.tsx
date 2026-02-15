import React from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
  const [lineDesc, setLineDesc] = React.useState('Stampa 3D')
  const [lineFil, setLineFil] = React.useState<number | ''>('')
  const [lineG, setLineG] = React.useState(0)
  const [lineMin, setLineMin] = React.useState(60)
  const [params, setParams] = React.useState<any>(null)
  const [loadingParams, setLoadingParams] = React.useState(true)
  React.useEffect(() => {
    import('../api/settings').then(({ getPreventivoSettings }) => {
      getPreventivoSettings().then((s) => {
        setParams({
          costo_macchina_eur_h: s.costo_kwh_eur,
          costo_manodopera_eur_h: s.costo_manodopera_eur_h,
          overhead_pct: s.overhead_pct,
          margine_pct: s.margine_pct,
          sconto_eur: 0,
          iva_pct: 22,
        })
        setLoadingParams(false)
      })
    })
  }, [])

  const createVersion = async () => {
    if (!selected || !params) return
    await api.post(`/api/v1/quotes/${selected.id}/versions`, {
      ...params,
      righe: [
        {
          descrizione: lineDesc,
          filament_id: lineFil ? Number(lineFil) : null,
          peso_materiale_g: Number(lineG),
          tempo_stimato_min: Number(lineMin),
        },
      ],
    })
    setOpenV(false)
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
              {Object.entries(params).map(([k, v]) => (
                <TextField key={k} label={k} type="number" value={v} onChange={(e) => setParams((s: any) => ({ ...s, [k]: Number(e.target.value) }))} />
              ))}
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Riga (MVP: 1 riga)</Typography>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' } }}>
            <TextField label="Descrizione" value={lineDesc} onChange={(e) => setLineDesc(e.target.value)} sx={{ gridColumn: { md: '1 / span 2' } }} />
            <TextField select label="Filamento" value={lineFil} onChange={(e) => setLineFil(e.target.value as any)}>
              <MenuItem value="">(nessuno)</MenuItem>
              {filaments.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.materiale} {f.marca} {f.colore}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Materiale (g)" type="number" value={lineG} onChange={(e) => setLineG(Number(e.target.value))} />
            <TextField label="Tempo (min)" type="number" value={lineMin} onChange={(e) => setLineMin(Number(e.target.value))} />
          </Box>
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
