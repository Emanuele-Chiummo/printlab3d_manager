import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PeopleIcon from '@mui/icons-material/People'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PrintIcon from '@mui/icons-material/Print'
import EuroIcon from '@mui/icons-material/Euro'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../components/AuthProvider'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'

const drawerWidth = 260

type NavItem = { label: string; icon: React.ReactNode; to: string }

const items: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, to: '/' },
  { label: 'Filamenti', icon: <Inventory2Icon />, to: '/filamenti' },
  { label: 'Ubicazioni', icon: <LocationOnIcon />, to: '/ubicazioni' },
  { label: 'Clienti', icon: <PeopleIcon />, to: '/clienti' },
  { label: 'Preventivi', icon: <ReceiptLongIcon />, to: '/preventivi' },
  { label: 'Job', icon: <PrintIcon />, to: '/job' },
  { label: 'Costi', icon: <EuroIcon />, to: '/costi' },
  { label: 'Impostazioni', icon: <SettingsIcon />, to: '/impostazioni' },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const isMobile = useMediaQuery('(max-width:900px)')
  const [open, setOpen] = React.useState(!isMobile)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

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

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ p: 2, background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)', color: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PrintIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            PrintLab
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1 }}>
        {React.useMemo(() => {
          let nav = [...items]
          if (user?.role === 'ADMIN') {
            nav.push({ label: 'Utenti', icon: <SupervisorAccountIcon />, to: '/utenti' })
          }
          return nav
        }, [user]).map((item) => (
          <ListItemButton
            key={item.to}
            component={Link}
            to={item.to}
            selected={location.pathname === item.to}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 1,
              color: location.pathname === item.to ? '#0055cc' : 'text.primary',
              backgroundColor: location.pathname === item.to ? '#eff6ff' : 'transparent',
              fontWeight: location.pathname === item.to ? 600 : 400,
              '&:hover': {
                backgroundColor: location.pathname === item.to ? '#eff6ff' : '#f3f4f6',
              },
            }}
          >
            <ListItemIcon
              sx={{ color: location.pathname === item.to ? '#0055cc' : 'inherit', minWidth: 40 }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, background: '#f9fafb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #0055cc 0%, #003d99 100%)' }}>
            {(user?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name || user?.email}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {user?.role === 'ADMIN' ? 'Amministratore' : user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={() => setOpen((s) => !s)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ ml: isMobile ? 1 : 0, fontWeight: 600 }}>
            Gestionale Stampa 3D
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
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
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
