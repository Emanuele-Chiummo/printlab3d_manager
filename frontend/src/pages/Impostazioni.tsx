import React from 'react'
import { Box, Typography, TextField, Button, Paper, Tabs, Tab, Grid, Divider } from '@mui/material'
import { getPreventivoSettings, setPreventivoSettings, PreventivoSettings } from '../api/settings'
import { showSuccess } from '../utils/toast'

export default function ImpostazioniPage() {
  const [settings, setSettings] = React.useState<PreventivoSettings | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [tabIndex, setTabIndex] = React.useState(0)

  React.useEffect(() => {
    getPreventivoSettings().then((s) => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  const handleChange = (key: keyof PreventivoSettings, value: string | number) => {
    if (!settings) return
    // Text fields use string type
    if (['company_name', 'company_address', 'company_email', 'company_phone'].includes(key)) {
      setSettings((s) => s ? { ...s, [key]: value } : s)
    } else {
      setSettings((s) => s ? { ...s, [key]: Number(value) } : s)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    await setPreventivoSettings(settings)
    setSaving(false)
    showSuccess('Impostazioni salvate!')
  }

  if (loading || !settings) return <Typography sx={{ mt: 4, textAlign: 'center' }}>Caricamento...</Typography>

  return (
    <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>Impostazioni</Typography>
      
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Parametri Preventivo" />
        <Tab label="Informazioni Aziendali" />
      </Tabs>

      {tabIndex === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Costi Base</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField 
                size="small"
                label="Costo kWh (€)" 
                type="number" 
                value={settings.costo_kwh_eur} 
                onChange={e => handleChange('costo_kwh_eur', e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                size="small"
                label="Costo Manodopera (€/h)" 
                type="number" 
                value={settings.costo_manodopera_eur_h} 
                onChange={e => handleChange('costo_manodopera_eur_h', e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                size="small"
                label="Consumabili (€ / stampa)" 
                type="number" 
                value={settings.consumabili_eur_stampa} 
                onChange={e => handleChange('consumabili_eur_stampa', e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                size="small"
                label="Soglia filamento basso (g)" 
                type="number" 
                value={settings.soglia_filamento_basso_g} 
                onChange={e => handleChange('soglia_filamento_basso_g', e.target.value)} 
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>Margini e Rischi</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                size="small"
                label="Margine (%)" 
                type="number" 
                value={settings.margine_pct} 
                onChange={e => handleChange('margine_pct', e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                size="small"
                label="Overhead (%)" 
                type="number" 
                value={settings.overhead_pct} 
                onChange={e => handleChange('overhead_pct', e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                size="small"
                label="Fattore Rischio (%)" 
                type="number" 
                value={settings.fattore_rischio_pct} 
                onChange={e => handleChange('fattore_rischio_pct', e.target.value)} 
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
            Queste informazioni verranno visualizzate nell'intestazione dei PDF dei preventivi
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                size="small"
                label="Nome Azienda" 
                value={settings.company_name} 
                onChange={e => handleChange('company_name', e.target.value)} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                size="small"
                label="Indirizzo" 
                value={settings.company_address} 
                onChange={e => handleChange('company_address', e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                size="small"
                label="Email" 
                type="email" 
                value={settings.company_email} 
                onChange={e => handleChange('company_email', e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                size="small"
                label="Telefono" 
                value={settings.company_phone} 
                onChange={e => handleChange('company_phone', e.target.value)} 
              />
            </Grid>
          </Grid>
        </Box>
      )}

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
      </Box>
    </Paper>
  )
}
