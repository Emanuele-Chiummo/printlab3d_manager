import React from 'react'
import { Box, Button, Typography } from '@mui/material'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: 'rgba(37,99,235,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main',
          '& svg': { fontSize: 36 },
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340, mx: 'auto' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} size="small">
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
