import React from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
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

type TrendPoint = {
  periodo: string
  ricavi: number
  costi: number
  job_completati: number
}

interface KPICardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'error' | 'info'
  bgGradient: string
  bgGradientDark: string
  supportingText?: string
}

function KPICard({ label, value, icon, color, bgGradient, bgGradientDark, supportingText }: KPICardProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const colorMap = {
    primary: theme.palette.primary.dark,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.dark,
  }
  const bgColorMap = {
    primary: isDark ? 'rgba(37,99,235,0.2)' : '#e0e7ff',
    success: isDark ? 'rgba(15,157,88,0.2)' : '#e3fcec',
    warning: isDark ? 'rgba(245,158,11,0.2)' : '#fef3c7',
    error: isDark ? 'rgba(239,68,68,0.2)' : '#fee2e2',
    info: isDark ? 'rgba(14,165,233,0.2)' : '#e0f2fe',
  }

  return (
    <Card sx={{ background: isDark ? bgGradientDark : bgGradient, height: '100%', borderRadius: '12px' }} data-animate="rise">
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colorMap[color], fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ background: bgColorMap[color], p: 1, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colorMap[color], flexShrink: 0, '& svg': { fontSize: { xs: 20, sm: 24 } } }}>
            {icon}
          </Box>
        </Box>
        {supportingText && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2, color: 'text.secondary' }}>
            <NorthEastIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: colorMap[color] }} />
            <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>{supportingText}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

function KPICardSkeleton() {
  return (
    <Card sx={{ height: '100%', borderRadius: '12px' }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={48} />
          </Box>
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 1.5 }} />
        </Box>
        <Skeleton variant="text" width="70%" sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [kpi, setKpi] = React.useState<KPI | null>(null)
  const [trends, setTrends] = React.useState<TrendPoint[]>([])
  const [loadingKpi, setLoadingKpi] = React.useState(true)
  const [loadingTrends, setLoadingTrends] = React.useState(true)
  const { user } = useAuth()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  React.useEffect(() => {
    api.get('/api/v1/dashboard/kpi')
      .then((r) => setKpi(r.data))
      .finally(() => setLoadingKpi(false))
    api.get('/api/v1/dashboard/trends')
      .then((r) => setTrends(r.data.points ?? []))
      .finally(() => setLoadingTrends(false))
  }, [])

  const kpiItems: KPICardProps[] = [
    {
      label: 'Preventivi mese',
      value: kpi?.preventivi_mese ?? '—',
      icon: <AssignmentIcon />,
      color: 'primary',
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0f9fa 100%)',
      bgGradientDark: 'linear-gradient(135deg, #161b22 0%, #1a2535 100%)',
      supportingText: 'Aggiornato nelle ultime 24h',
    },
    {
      label: 'Job in corso',
      value: kpi?.job_in_corso ?? '—',
      icon: <TrendingUpIcon />,
      color: 'success',
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
      bgGradientDark: 'linear-gradient(135deg, #161b22 0%, #162518 100%)',
      supportingText: 'Job in stato attivo',
    },
    {
      label: 'Stock basso',
      value: kpi?.stock_basso ?? '—',
      icon: <WarningIcon />,
      color: 'warning',
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
      bgGradientDark: 'linear-gradient(135deg, #161b22 0%, #251e10 100%)',
      supportingText: 'Filamenti sotto soglia',
    },
    {
      label: 'Clienti attivi',
      value: kpi?.clienti_attivi ?? '—',
      icon: <PeopleIcon />,
      color: 'info',
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0f9fa 100%)',
      bgGradientDark: 'linear-gradient(135deg, #161b22 0%, #101e28 100%)',
      supportingText: 'Con job negli ultimi 90gg',
    },
    {
      label: 'Ricavi mese',
      value: kpi ? `€${kpi.ricavi_mese_eur.toFixed(2)}` : '—',
      icon: <EuroIcon />,
      color: 'success',
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #e3fcec 100%)',
      bgGradientDark: 'linear-gradient(135deg, #161b22 0%, #152218 100%)',
      supportingText: 'Totale preventivi accettati',
    },
    {
      label: 'Costi mese',
      value: kpi ? `€${kpi.costi_mese_eur.toFixed(2)}` : '—',
      icon: <ReceiptIcon />,
      color: 'error',
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
      bgGradientDark: 'linear-gradient(135deg, #161b22 0%, #251515 100%)',
      supportingText: 'Somma dei costi registrati',
    },
    {
      label: 'Utile mese',
      value: kpi ? `€${kpi.utile_mese_eur.toFixed(2)}` : '—',
      icon: <AccountBalanceWalletIcon />,
      color: kpi && kpi.utile_mese_eur >= 0 ? 'primary' : 'error',
      bgGradient: kpi && kpi.utile_mese_eur >= 0
        ? 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
      bgGradientDark: kpi && kpi.utile_mese_eur >= 0
        ? 'linear-gradient(135deg, #161b22 0%, #111a2e 100%)'
        : 'linear-gradient(135deg, #161b22 0%, #251515 100%)',
      supportingText: 'Ricavi − costi del mese',
    },
    {
      label: 'Margine medio',
      value: kpi ? `${kpi.margine_medio_pct.toFixed(1)}%` : '—',
      icon: <PieChartIcon />,
      color: 'info',
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
      bgGradientDark: 'linear-gradient(135deg, #161b22 0%, #0f1e2a 100%)',
      supportingText: 'Rapporto utile/ricavi',
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Hero */}
      <Box
        data-animate="rise"
        sx={{
          borderRadius: 0,
          background: isDark
            ? 'linear-gradient(135deg, #161b22 0%, #1a2233 45%, #1e2a3a 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #e9f1ff 45%, #dbf7ff 100%)',
          color: 'text.primary',
          p: { xs: 2, sm: 3, md: 5 },
          overflow: 'hidden',
          position: 'relative',
          mt: { xs: 1, md: 4 },
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.15), transparent 50%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', right: -40, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(14,165,233,0.2)', filter: 'blur(60px)' }} />
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 2, color: 'text.secondary', fontSize: '0.75rem' }}>Control Room</Typography>
            <Typography variant="h4" sx={{ mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.2rem' }, fontWeight: 700 }}>
              Ciao {user?.full_name?.split(' ')[0] ?? 'maker'}, ben tornato.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: '100%', lineHeight: 1.6, fontSize: { xs: '0.9rem', md: '1rem' } }}>
              Controlla in tempo reale marginalità, job e saturazione macchine. Tutti i segnali del laboratorio in un unico luogo.
            </Typography>
          </Box>

          {/* Quick Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {[
              { label: 'Job attivi', value: kpi?.job_in_corso ?? '—', bg: isDark ? 'rgba(37,99,235,0.15)' : '#eef2ff', color: 'primary.main' },
              { label: 'Ricavi mese', value: kpi ? `€${kpi.ricavi_mese_eur.toFixed(2)}` : '—', bg: isDark ? 'rgba(14,165,233,0.12)' : '#e0f2fe', color: 'info.dark' },
              { label: 'Margine medio', value: kpi ? `${kpi.margine_medio_pct.toFixed(1)}%` : '—', bg: isDark ? 'rgba(14,165,233,0.08)' : '#f0f9ff', color: 'secondary.main' },
            ].map((s) => (
              <Box key={s.label} sx={{ background: s.bg, borderRadius: '20px', px: { xs: 2, sm: 2.5 }, py: 2, boxShadow: '0 8px 20px -15px rgba(15,23,42,0.4)' }}>
                {loadingKpi
                  ? <Skeleton variant="text" width="60%" height={32} />
                  : <>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>{s.label}</Typography>
                      <Typography variant="h5" sx={{ color: s.color, fontWeight: 700 }}>{s.value}</Typography>
                    </>
                }
              </Box>
            ))}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button component={RouterLink} to="/preventivi" variant="contained" color="primary" sx={{ boxShadow: 'none', fontWeight: 600, flex: { xs: 1, sm: 'none' } }} endIcon={<NorthEastIcon />}>
              Apri area Preventivi
            </Button>
            <Button component={RouterLink} to="/job" variant="outlined" color="primary" sx={{ fontWeight: 600, flex: { xs: 1, sm: 'none' } }} startIcon={<TimelineIcon />}>
              Vai ai Job
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* KPI Grid */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {loadingKpi
          ? Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={i}>
                <KPICardSkeleton />
              </Grid>
            ))
          : kpiItems.map((it) => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={it.label}>
                <KPICard {...it} />
              </Grid>
            ))
        }
      </Grid>

      {/* Trend Chart */}
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Andamento ultimi 6 mesi</Typography>
        <Typography variant="caption" color="text.secondary">Ricavi vs Costi operativi</Typography>
        <Box sx={{ mt: 3, height: { xs: 220, sm: 280 } }}>
          {loadingTrends ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
              {[100, 80, 90, 70, 85, 60].map((w, i) => (
                <Skeleton key={i} variant="rectangular" width={`${w}%`} height={28} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRicavi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradCosti" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'} />
                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} width={55} />
                <RechartsTooltip
                  contentStyle={{
                    background: isDark ? '#1e293b' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'}`,
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [`€${value.toFixed(2)}`, name === 'ricavi' ? 'Ricavi' : 'Costi']}
                />
                <Legend formatter={(v) => v === 'ricavi' ? 'Ricavi' : 'Costi'} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="ricavi" stroke="#2563eb" strokeWidth={2} fill="url(#gradRicavi)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="costi" stroke="#ef4444" strokeWidth={2} fill="url(#gradCosti)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Paper>

      {/* Mobile snapshot */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Card sx={{ background: 'background.paper', borderRadius: '20px' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>Snapshot operativo</Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              {[
                { label: 'Margine medio', value: kpi ? `${kpi.margine_medio_pct.toFixed(1)}%` : '—' },
                { label: 'Preventivi mese', value: kpi?.preventivi_mese ?? '—' },
                { label: 'Clienti attivi', value: kpi?.clienti_attivi ?? '—' },
              ].map((item, i) => (
                <React.Fragment key={item.label}>
                  {i > 0 && <Divider sx={{ borderColor: 'divider' }} />}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{item.label}</Typography>
                    {loadingKpi
                      ? <Skeleton variant="text" width="40%" height={36} />
                      : <Typography variant="h5" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                    }
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
