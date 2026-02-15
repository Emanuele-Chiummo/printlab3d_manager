import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { RequireAuth } from './components/RequireAuth'
import { AppLayout } from './layouts/AppLayout'

import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import FilamentiPage from './pages/Filamenti'
import UbicazioniPage from './pages/Ubicazioni'
import ClientiPage from './pages/Clienti'
import PreventiviPage from './pages/Preventivi'
import JobPage from './pages/Job'
import CostiPage from './pages/Costi'
import UtentiPage from './pages/Utenti'
import ImpostazioniPage from './pages/Impostazioni'

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppLayout>{children}</AppLayout>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/filamenti" element={<Protected><FilamentiPage /></Protected>} />
      <Route path="/ubicazioni" element={<Protected><UbicazioniPage /></Protected>} />
      <Route path="/clienti" element={<Protected><ClientiPage /></Protected>} />
      <Route path="/preventivi" element={<Protected><PreventiviPage /></Protected>} />
      <Route path="/job" element={<Protected><JobPage /></Protected>} />
      <Route path="/costi" element={<Protected><CostiPage /></Protected>} />

      <Route path="/utenti" element={<Protected><UtentiPage /></Protected>} />
      <Route path="/impostazioni" element={<Protected><ImpostazioniPage /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
