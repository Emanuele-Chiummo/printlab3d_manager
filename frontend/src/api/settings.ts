import api from './client'

export type PreventivoSettings = {
  costo_kwh_eur: number
  costo_manodopera_eur_h: number
  margine_pct: number
  overhead_pct: number
  fattore_rischio_pct: number
  consumabili_eur_stampa: number
  soglia_filamento_basso_g: number
  company_name: string
  company_address: string
  company_email: string
  company_phone: string
}

export async function getPreventivoSettings(): Promise<PreventivoSettings> {
  const { data } = await api.get('/api/v1/settings/preventivo')
  return data
}

export async function setPreventivoSettings(settings: PreventivoSettings): Promise<PreventivoSettings> {
  const { data } = await api.post('/api/v1/settings/preventivo', settings)
  return data
}
