import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PeopleIcon from '@mui/icons-material/People'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PrintIcon from '@mui/icons-material/Print'
import EuroIcon from '@mui/icons-material/Euro'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { useAuth } from '../components/AuthProvider'

const drawerWidth = 260
const contentMaxWidth = 1320

type NavItem = { label: string; icon: React.ReactNode; to: string }

const items: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, to: '/' },
  { label: 'Filamenti', icon: <Inventory2Icon />, to: '/filamenti' },
  { label: 'Stampanti', icon: <PrecisionManufacturingIcon />, to: '/stampanti' },
  { label: 'Ubicazioni', icon: <LocationOnIcon />, to: '/ubicazioni' },
  { label: 'Clienti', icon: <PeopleIcon />, to: '/clienti' },
  { label: 'Preventivi', icon: <ReceiptLongIcon />, to: '/preventivi' },
  { label: 'Job', icon: <PrintIcon />, to: '/job' },
  { label: 'Costi', icon: <EuroIcon />, to: '/costi' },
]

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Panoramica generale', subtitle: 'Controlla performance e produzione' },
  '/filamenti': { title: 'Magazzino filamenti', subtitle: 'Gestisci materiali e scorte' },  '/stampanti': { title: 'Stampanti 3D', subtitle: 'Gestisci il parco macchine' },  '/ubicazioni': { title: 'Ubicazioni', subtitle: 'Traccia shelf e posizioni' },
  '/clienti': { title: 'Clienti', subtitle: 'Gestisci relazioni e attività' },
  '/preventivi': { title: 'Preventivi', subtitle: 'Crea e monitora le offerte' },
  '/job': { title: 'Job di stampa', subtitle: 'Supervisiona produzione e costi' },
  '/costi': { title: 'Costi operativi', subtitle: 'Controlla analisi e movimenti' },
  '/utenti': { title: 'Team & permessi', subtitle: 'Amministra gli accessi' },
  '/impostazioni': { title: 'Impostazioni', subtitle: 'Configura l’esperienza PrintLab' },
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const isMobile = useMediaQuery('(max-width:900px)')
  const [open, setOpen] = React.useState(!isMobile)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const currentMeta = pageMeta[location.pathname] ?? {
    title: 'Gestionale PrintLab',
    subtitle: 'Controlla produzione e margini',
  }

  const todayLabel = React.useMemo(
    () => new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()),
    []
  )

  React.useEffect(() => {
    setOpen(!isMobile)
  }, [isMobile])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    logout()
  }

  const navItems = React.useMemo(() => {
    const nav = [...items]
    if (user?.role === 'ADMIN') {
      nav.push({ label: 'Utenti', icon: <SupervisorAccountIcon />, to: '/utenti' })
    }
    nav.push({ label: 'Impostazioni', icon: <SettingsIcon />, to: '/impostazioni' })
    return nav
  }, [user])

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(160deg, rgba(255,255,255,0.6) 0%, rgba(148, 207, 255, 0.25) 100%)',
          pointerEvents: 'none',
        }}
      />
      <Toolbar sx={{ p: 2.5, alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
              }}
            >
              <PrintIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
                PrintLab OS
              </Typography>
              <Typography variant="caption" sx={{ color: '#52607c', letterSpacing: 1 }}>
                Manufacturing Hub
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Produzione 3D"
            size="small"
            sx={{ alignSelf: 'flex-start', background: 'rgba(37,99,235,0.12)', color: '#1d4ed8', fontWeight: 600 }}
          />
        </Box>
      </Toolbar>
      <Box sx={{ px: 3, py: 1 }}>
        <Typography variant="overline" sx={{ color: '#94a3b8', letterSpacing: 1 }}>
          Navigazione
        </Typography>
      </Box>
      <List sx={{ flex: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.to
          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              selected={selected}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                '&::before': selected
                  ? {
                      content: '""',
                      position: 'absolute',
                      left: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: 24,
                      borderRadius: 999,
                      background: 'linear-gradient(180deg, #2563eb 0%, #0ea5e9 100%)',
                    }
                  : undefined,
              }}
            >
              <ListItemIcon sx={{ color: selected ? '#2563eb' : '#52607c', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: selected ? 700 : 500, color: selected ? '#0f172a' : '#1f2937' }}
              />
            </ListItemButton>
          )
        })}
      </List>
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderTop: '1px solid rgba(15,23,42,0.08)',
          position: 'relative',
        }}
      >
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
          PrintLab 3D Manager
        </Typography>
        <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
          v{__APP_VERSION__}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          backgroundColor: '#ffffffeb',
          color: '#0f172a',
          boxShadow: '0 1px 4px rgba(15,23,42,0.08)',
          borderBottom: '1px solid rgba(15,23,42,0.05)',
          backdropFilter: 'blur(14px)',
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ minHeight: 'auto', py: { xs: 0.5, md: 1 } }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: contentMaxWidth,
              mx: 'auto',
              px: { xs: 2, md: 4 },
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={() => setOpen((s) => !s)}>
                <MenuIcon />
              </IconButton>
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {currentMeta.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {currentMeta.subtitle}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <CalendarTodayIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                  {todayLabel}
                </Typography>
              </Box>
              <Chip
                label={user?.role === 'ADMIN' ? 'Admin' : user?.role || 'Utente'}
                color="primary"
                sx={{ fontWeight: 600, background: 'rgba(37,99,235,0.12)', color: '#1d4ed8' }}
              />
            </Box>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Avatar sx={{ width: 40, height: 40, background: '#2563eb', fontSize: '0.9rem' }}>
                {(user?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem disabled>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.full_name || user?.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {!isMobile && <Toolbar sx={{ minHeight: 'auto', py: { xs: 0.5, md: 1 } }} />}
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          background: 'radial-gradient(circle at top, rgba(148,163,255,0.18), transparent 55%)',
        }}
      >
        <Toolbar sx={{ minHeight: 'auto', py: { xs: 0.5, md: 1 } }} />
        <Box sx={{ width: '100%', maxWidth: contentMaxWidth, mx: 'auto', px: { xs: 1.5, sm: 2, md: 4 }, pb: 4 }}>{children}</Box>
      </Box>
    </Box>
  )
}
