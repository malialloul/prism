import { styled } from '@mui/material/styles'
import { Box, TableHead, TableRow, TableCell, Avatar, Paper } from '@mui/material'
import { motion } from 'motion/react'
import { authColors } from '../../../styles/theme'

export const ComparisonWrapper = styled(Box)(({ theme }) => ({
  padding: '3rem 0',
  backgroundColor: theme.palette.background.default,
}))

export const HeaderBox = styled(Box)({
  textAlign: 'center',
  marginBottom: '2rem',
})

export const MotionPaper = styled(motion(Paper))({
  overflow: 'hidden',
})

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}))

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td': {
    border: 'none',
  },
}))

export const StyledTableCell = styled(TableCell)({
  fontWeight: 500,
})

export const HeaderTableCell = styled(TableCell)({
  fontWeight: 600,
  fontSize: '0.875rem',
  minWidth: '100px',
})

export const PrismAvatarBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
})

export const PrismAvatar = styled(Avatar)({
  width: '40px',
  height: '40px',
  background: `linear-gradient(135deg, ${authColors.primary} 0%, ${authColors.secondary} 100%)`,
  fontWeight: 700,
})
