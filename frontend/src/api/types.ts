export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  must_reset_password: boolean;
}
export interface Filament {
  id: number
  materiale: string
  marca: string
  colore: string
  diametro_mm: number
  peso_nominale_g: number
  costo_spool_eur: number
  peso_residuo_g: number
  soglia_min_g: number
  note: string
  ubicazione_id: number | null
}

export interface Location {
  id: number
  nome: string
  tipo: string
  parent_id: number | null
}

export interface Customer {
  id: number
  tipo_cliente: string
  ragione_sociale: string
  nome: string
  cognome: string
  codice_fiscale: string
  piva: string
  email: string
  telefono: string
  indirizzo: string
  note: string
}

export interface Quote {
  id: number
  codice: string
  customer_id: number
  note: string
}

export interface QuoteVersion {
  id: number
  quote_id: number
  version_number: number
  status: string
  totale_imponibile_eur: number
  totale_iva_eur: number
  totale_lordo_eur: number
  righe: any[]
}

export interface Job {
  note: any;
  id: number
  quote_version_id: number
  status: string
  tempo_reale_min: number
  energia_kwh: number
  scarti_g: number
  costo_finale_eur: number
  margine_eur: number
  consumi: any[]
}

export interface CostCategory {
  id: number
  nome: string
  descrizione: string
}

export interface CostEntry {
  id: number
  categoria_id: number
  importo_eur: number
  periodo_yyyymm: string
  job_id: number | null
  note: string
}

export interface MonthlyCostReport {
  periodo_yyyymm: string
  totale_eur: number
}

export interface CostByJobReport {
  job_id: number
  quote_codice: string
  customer: string
  periodo_yyyymm: string
  totale_eur: number
}

export interface CostByCustomerReport {
  customer_id: number
  customer: string
  totale_eur: number
}
