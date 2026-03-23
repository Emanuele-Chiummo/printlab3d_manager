import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './theme/global.css'
import { ThemeContextProvider } from './components/ThemeContext'
import { AuthProvider } from './components/AuthProvider'
import ToastProvider from './components/ToastProvider'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <ToastProvider />
        </AuthProvider>
      </BrowserRouter>
    </ThemeContextProvider>
  </React.StrictMode>
)
