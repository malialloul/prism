import { styled } from '@mui/material/styles'
import { Box, Card, CardContent, Avatar } from '@mui/material'
import { motion } from 'motion/react'

export const HowItWorksWrapper = styled(Box)(({ theme }) => ({
  padding: '3rem 0',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1a1f35 0%, #2d1b4e 30%)'
    : 'linear-gradient(135deg, #f9fafb 0%, #ede9fe 100%)',
}))

export const HeaderBox = styled(Box)({
  textAlign: 'center',
  marginBottom: '2rem',
})

export const MotionCard = styled(motion(Card))(({ theme }) => ({
  height: '100%',
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}))

export const StyledCardContent = styled(CardContent)({
  padding: '2rem',
})

export const IconBox = styled(Box)({
  width: '64px',
  height: '64px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.5rem',
})

export const NumberAvatar = styled(Avatar)(({ theme }) => ({
  position: 'absolute',
  top: '-16px',
  right: '16px',
  width: '48px',
  height: '48px',
  backgroundColor: theme.palette.text.primary,
  color: theme.palette.background.paper,
  fontWeight: 700,
  fontSize: '1.25rem',
}))

export const ActionButton = styled(motion.button)(({ theme }) => ({
  padding: '1.5rem',
  fontSize: '1rem',
  fontWeight: 600,
  color: 'white',
  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  boxShadow: theme.shadows[3],
  transition: 'all 0.3s',
  '&:hover': {
    background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
    transform: 'translateY(-2px)',
  },
}))

export const CtaBox = styled(Box)({
  textAlign: 'center',
  marginTop: '2rem',
})
