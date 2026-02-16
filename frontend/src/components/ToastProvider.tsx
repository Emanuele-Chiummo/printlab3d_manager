import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#0f172a',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#0f9d58',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#b91c1c',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}
