import React from 'react'
import { Box, Typography, TextField, Button, Paper } from '@mui/material'
import { getPreventivoSettings, setPreventivoSettings, PreventivoSettings } from '../api/settings'

export default function ImpostazioniPage() {
  const [settings, setSettings] = React.useState<PreventivoSettings | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    getPreventivoSettings().then((s) => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  const handleChange = (key: keyof PreventivoSettings, value: string | number) => {
    if (!settings) return
    setSettings((s) => s ? { ...s, [key]: Number(value) } : s)
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    await setPreventivoSettings(settings)
    setSaving(false)
    alert('Impostazioni salvate!')
  }

  if (loading || !settings) return <Typography sx={{ mt: 4, textAlign: 'center' }}>Caricamento...</Typography>

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Impostazioni Preventivo</Typography>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <TextField label="Costo kWh (€)" type="number" value={settings.costo_kwh_eur} onChange={e => handleChange('costo_kwh_eur', e.target.value)} />
        <TextField label="Costo Manodopera (€/h)" type="number" value={settings.costo_manodopera_eur_h} onChange={e => handleChange('costo_manodopera_eur_h', e.target.value)} />
        <TextField label="Margine (%)" type="number" value={settings.margine_pct} onChange={e => handleChange('margine_pct', e.target.value)} />
        <TextField label="Overhead (%)" type="number" value={settings.overhead_pct} onChange={e => handleChange('overhead_pct', e.target.value)} />
        <TextField label="Fattore Rischio (%)" type="number" value={settings.fattore_rischio_pct} onChange={e => handleChange('fattore_rischio_pct', e.target.value)} />
        <TextField label="Consumabili (€ / stampa)" type="number" value={settings.consumabili_eur_stampa} onChange={e => handleChange('consumabili_eur_stampa', e.target.value)} />
        <TextField label="Soglia filamento basso (g)" type="number" value={settings.soglia_filamento_basso_g} onChange={e => handleChange('soglia_filamento_basso_g', e.target.value)} />
      </Box>
      <Button variant="contained" sx={{ mt: 3 }} onClick={handleSave} disabled={saving}>Salva</Button>
    </Paper>
  )
}
