import { styled } from '@mui/material/styles'
import { Box, Card, CardContent } from '@mui/material'
import { motion } from 'motion/react'

export const FeaturesWrapper = styled(Box)(({ theme }) => ({
  padding: '3rem 0',
  backgroundColor: theme.palette.background.default,
}))

export const HeaderBox = styled(Box)({
  textAlign: 'center',
  marginBottom: '2rem',
})

export const MotionCard = styled(motion(Card))(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.palette.mode === 'dark'
      ? `0 8px 24px rgba(139, 92, 246, 0.2)`
      : `0 8px 24px rgba(139, 92, 246, 0.15)`,
    transform: 'translateY(-4px)',
  },
}))

export const StyledCardContent = styled(CardContent)({
  padding: '2rem',
})

export const IconBox = styled(Box)({
  width: '56px',
  height: '56px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.5rem',
})
