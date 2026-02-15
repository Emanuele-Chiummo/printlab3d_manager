import React from 'react'
import { Card, CardContent, Grid, Typography, Box } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AssignmentIcon from '@mui/icons-material/Assignment'
import WarningIcon from '@mui/icons-material/Warning'
import PieChartIcon from '@mui/icons-material/PieChart'
import EuroIcon from '@mui/icons-material/Euro'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PeopleIcon from '@mui/icons-material/People'
import api from '../api/client'

type KPI = { 
  preventivi_mese: number
  job_in_corso: number
  stock_basso: number
  margine_medio_pct: number
  ricavi_mese_eur: number
  costi_mese_eur: number
  utile_mese_eur: number
  clienti_attivi: number
}

interface KPICardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'error' | 'info'
  bgGradient: string
}

function KPICard({ label, value, icon, color, bgGradient }: KPICardProps) {
  const colorMap = {
    primary: '#0055cc',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0891b2',
  }
  const bgColorMap = {
    primary: '#eff6ff',
    success: '#f0fdf4',
    warning: '#fffbeb',
    error: '#fef2f2',
    info: '#f0f9fa',
  }

  return (
    <Card sx={{ background: bgGradient, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colorMap[color] }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              background: bgColorMap[color],
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colorMap[color],
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [kpi, setKpi] = React.useState<KPI | null>(null)

  React.useEffect(() => {
    api.get('/api/v1/dashboard/kpi').then((r) => setKpi(r.data))
  }, [])

  const items = [
    {
      label: 'Preventivi mese',
      value: kpi?.preventivi_mese ?? '—',
      icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
      color: 'primary' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0f9fa 100%)',
    },
    {
      label: 'Job in corso',
      value: kpi?.job_in_corso ?? '—',
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: 'success' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
    },
    {
      label: 'Stock basso',
      value: kpi?.stock_basso ?? '—',
      icon: <WarningIcon sx={{ fontSize: 28 }} />,
      color: 'warning' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
    },
    {
      label: 'Clienti attivi',
      value: kpi?.clienti_attivi ?? '—',
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: 'info' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0f9fa 100%)',
    },
    {
      label: 'Ricavi mese',
      value: kpi ? `€${kpi.ricavi_mese_eur.toFixed(2)}` : '—',
      icon: <EuroIcon sx={{ fontSize: 28 }} />,
      color: 'success' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
    },
    {
      label: 'Costi mese',
      value: kpi ? `€${kpi.costi_mese_eur.toFixed(2)}` : '—',
      icon: <ReceiptIcon sx={{ fontSize: 28 }} />,
      color: 'error' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
    },
    {
      label: 'Utile mese',
      value: kpi ? `€${kpi.utile_mese_eur.toFixed(2)}` : '—',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />,
      color: kpi && kpi.utile_mese_eur >= 0 ? 'primary' as const : 'error' as const,
      bgGradient: kpi && kpi.utile_mese_eur >= 0 
        ? 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
    },
    {
      label: 'Margine medio',
      value: kpi ? `${kpi.margine_medio_pct.toFixed(1)}%` : '—',
      icon: <PieChartIcon sx={{ fontSize: 28 }} />,
      color: 'info' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0f9fa 100%)',
    },
  ]

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Panoramica delle metriche principali
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {items.map((it) => (
          <Grid item xs={12} sm={6} md={6} lg={3} key={it.label}>
            <KPICard {...it} />
          </Grid>
        ))}
      </Grid>
    </>
  )
}
