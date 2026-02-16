import React from 'react'
import { Box, Button, Card, CardContent, Divider, Grid, Stack, Typography } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AssignmentIcon from '@mui/icons-material/Assignment'
import WarningIcon from '@mui/icons-material/Warning'
import PieChartIcon from '@mui/icons-material/PieChart'
import EuroIcon from '@mui/icons-material/Euro'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PeopleIcon from '@mui/icons-material/People'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import TimelineIcon from '@mui/icons-material/Timeline'
import { Link as RouterLink } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../components/AuthProvider'

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
  supportingText?: string
}

function KPICard({ label, value, icon, color, bgGradient, supportingText }: KPICardProps) {
  const colorMap = {
    primary: '#1d4ed8',
    success: '#0f9d58',
    warning: '#d97706',
    error: '#b91c1c',
    info: '#0369a1',
  }

  const bgColorMap = {
    primary: '#e0e7ff',
    success: '#e3fcec',
    warning: '#fef3c7',
    error: '#fee2e2',
    info: '#e0f2fe',
  }

  return (
    <Card sx={{ background: bgGradient, height: '100%', borderRadius: '12px' }} data-animate="rise">
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
        {supportingText && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2, color: 'text.secondary' }}>
            <NorthEastIcon sx={{ fontSize: 16, color: colorMap[color] }} />
            <Typography variant="caption">{supportingText}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [kpi, setKpi] = React.useState<KPI | null>(null)
  const { user } = useAuth()

  React.useEffect(() => {
    api.get('/api/v1/dashboard/kpi').then((r) => setKpi(r.data))
  }, [])

  const items: KPICardProps[] = [
    {
      label: 'Preventivi mese',
      value: kpi?.preventivi_mese ?? '—',
      icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
      color: 'primary' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0f9fa 100%)',
      supportingText: 'Aggiornato nelle ultime 24h',
    },
    {
      label: 'Job in corso',
      value: kpi?.job_in_corso ?? '—',
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: 'success' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
      supportingText: 'Include i job in stato attivo',
    },
    {
      label: 'Stock basso',
      value: kpi?.stock_basso ?? '—',
      icon: <WarningIcon sx={{ fontSize: 28 }} />,
      color: 'warning' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
      supportingText: 'Filamenti sotto soglia',
    },
    {
      label: 'Clienti attivi',
      value: kpi?.clienti_attivi ?? '—',
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: 'info' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0f9fa 100%)',
      supportingText: 'Clienti con job negli ultimi 90 giorni',
    },
    {
      label: 'Ricavi mese',
      value: kpi ? `€${kpi.ricavi_mese_eur.toFixed(2)}` : '—',
      icon: <EuroIcon sx={{ fontSize: 28 }} />,
      color: 'success' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #e3fcec 100%)',
      supportingText: 'Totale confermato',
    },
    {
      label: 'Costi mese',
      value: kpi ? `€${kpi.costi_mese_eur.toFixed(2)}` : '—',
      icon: <ReceiptIcon sx={{ fontSize: 28 }} />,
      color: 'error' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
      supportingText: 'Somma dei costi registrati',
    },
    {
      label: 'Utile mese',
      value: kpi ? `€${kpi.utile_mese_eur.toFixed(2)}` : '—',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />,
      color: (kpi && kpi.utile_mese_eur >= 0 ? 'primary' : 'error') as 'primary' | 'error',
      bgGradient:
        kpi && kpi.utile_mese_eur >= 0
          ? 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
      supportingText: 'Ricavi - costi nel mese corrente',
    },
    {
      label: 'Margine medio',
      value: kpi ? `${kpi.margine_medio_pct.toFixed(1)}%` : '—',
      icon: <PieChartIcon sx={{ fontSize: 28 }} />,
      color: 'info' as const,
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
      supportingText: 'Rapporto utile/ricavi',
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box
        data-animate="rise"
        sx={{
          borderRadius: 0,
          background: 'linear-gradient(135deg, #ffffff 0%, #e9f1ff 45%, #dbf7ff 100%)',
          color: '#0f172a',
          p: { xs: 3, md: 5 },
          overflow: 'hidden',
          position: 'relative',
          mt: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.15), transparent 50%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: -40,
            top: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(14,165,233,0.2)',
            filter: 'blur(60px)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" sx={{ letterSpacing: 2, color: '#94a3b8' }}>
              Control Room
            </Typography>
            <Typography variant="h3" sx={{ color: '#0f172a', mb: 1 }}>
              Ciao {user?.full_name?.split(' ')[0] ?? 'maker'}, ben tornato.
            </Typography>
            <Typography variant="body1" sx={{ color: '#475467', maxWidth: 520 }}>
              Controlla in tempo reale marginalità, job e saturazione macchine. Tutti i segnali del laboratorio in un unico luogo.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
              <Box
                sx={{
                  background: '#eef2ff',
                  borderRadius: '20px',
                  px: 3,
                  py: 1.25,
                  minWidth: 160,
                  boxShadow: '0 12px 30px -25px rgba(15,23,42,0.6)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#475467' }}>
                  Job attivi
                </Typography>
                <Typography variant="h5" sx={{ color: '#1d4ed8' }}>
                  {kpi?.job_in_corso ?? '—'}
                </Typography>
              </Box>
              <Box
                sx={{
                  background: '#e0f2fe',
                  borderRadius: '20px',
                  px: 3,
                  py: 1.25,
                  minWidth: 160,
                  boxShadow: '0 12px 30px -25px rgba(15,23,42,0.6)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#475467' }}>
                  Ricavi mese
                </Typography>
                <Typography variant="h5" sx={{ color: '#0369a1' }}>
                  {kpi ? `€${kpi.ricavi_mese_eur.toFixed(2)}` : '—'}
                </Typography>
              </Box>
              <Box
                sx={{
                  background: '#f0f9ff',
                  borderRadius: '20px',
                  px: 3,
                  py: 1.25,
                  minWidth: 160,
                  boxShadow: '0 12px 30px -25px rgba(15,23,42,0.6)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#475467' }}>
                  Margine medio
                </Typography>
                <Typography variant="h5" sx={{ color: '#0ea5e9' }}>
                  {kpi ? `${kpi.margine_medio_pct.toFixed(1)}%` : '—'}
                </Typography>
              </Box>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
              <Button
                component={RouterLink}
                to="/preventivi"
                variant="contained"
                color="primary"
                sx={{ boxShadow: 'none' }}
                endIcon={<NorthEastIcon />}
              >
                Apri area Preventivi
              </Button>
              <Button component={RouterLink} to="/job" variant="outlined" color="primary" startIcon={<TimelineIcon />}>
                Vai ai Job
              </Button>
            </Stack>
          </Box>
          <Box
            sx={{
              background: '#ffffff',
              borderRadius: '25px',
              p: 3,
              border: '1px solid rgba(15,23,42,0.08)',
              minWidth: { md: 320 },
              boxShadow: '0 14px 40px -32px rgba(15,23,42,0.5)',
            }}
          >
            <Typography variant="subtitle1" sx={{ color: '#0f172a', mb: 2 }}>
              Snapshot operativo
            </Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Margine medio
                </Typography>
                <Typography variant="h4" sx={{ color: '#1d4ed8' }}>
                  {kpi ? `${kpi.margine_medio_pct.toFixed(1)}%` : '—'}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(15,23,42,0.08)' }} />
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Preventivi mese
                </Typography>
                <Typography variant="h5" sx={{ color: '#0f172a' }}>
                  {kpi?.preventivi_mese ?? '—'}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(15,23,42,0.08)' }} />
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Clienti attivi
                </Typography>
                <Typography variant="h5" sx={{ color: '#0f172a' }}>
                  {kpi?.clienti_attivi ?? '—'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {items.map((it) => (
          <Grid item xs={12} sm={6} md={6} lg={3} key={it.label}>
            <KPICard {...it} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
