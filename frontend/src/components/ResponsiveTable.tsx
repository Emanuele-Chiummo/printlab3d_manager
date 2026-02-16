import React from 'react'
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

export interface Column<T> {
  key: string
  label: string
  render: (row: T) => React.ReactNode
  align?: 'left' | 'right' | 'center'
  hideOnMobile?: boolean
  hideOnTablet?: boolean
  primary?: boolean
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[]
  data: T[]
  getRowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

export function ResponsiveTable<T>({ columns, data, getRowKey, onRowClick, emptyMessage }: ResponsiveTableProps<T>) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
            {emptyMessage || 'Nessun dato disponibile'}
          </Typography>
        ) : (
          data.map((row) => {
            const visibleCols = columns.filter((c) => !c.hideOnMobile)
            return (
              <Card
                key={getRowKey(row)}
                sx={{
                  p: 2,
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:active': onRowClick ? { bgcolor: 'action.selected' } : {},
                }}
                onClick={() => onRowClick?.(row)}
              >
                {visibleCols.map((col, idx) => (
                  <Box
                    key={col.key}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: idx < visibleCols.length - 1 ? 1.5 : 0,
                      gap: 2,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, minWidth: '35%' }}>
                      {col.label}
                    </Typography>
                    <Box sx={{ textAlign: col.align || 'left', flex: 1 }}>{col.render(row)}</Box>
                  </Box>
                ))}
              </Card>
            )
          })
        )}
      </Box>
    )
  }

  const visibleColumns = columns.filter((c) => !(isTablet && c.hideOnTablet))

  return (
    <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {visibleColumns.map((col) => (
              <TableCell key={col.key} align={col.align} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length} align="center">
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 4 }}>
                  {emptyMessage || 'Nessun dato disponibile'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={getRowKey(row)}
                hover
                onClick={() => onRowClick?.(row)}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {visibleColumns.map((col) => (
                  <TableCell key={col.key} align={col.align}>
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
