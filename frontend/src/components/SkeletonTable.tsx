import { Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

interface SkeletonTableProps {
  columns: number
  rows?: number
}

export default function SkeletonTable({ columns, rows = 6 }: SkeletonTableProps) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableCell key={i}>
                <Skeleton variant="text" width="70%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, ri) => (
            <TableRow key={ri}>
              {Array.from({ length: columns }).map((_, ci) => (
                <TableCell key={ci}>
                  <Skeleton variant="text" width={ci === 0 ? '40%' : ci === columns - 1 ? '60%' : '80%'} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
