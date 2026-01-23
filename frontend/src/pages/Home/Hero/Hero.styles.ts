import { styled } from '@mui/material/styles'
import { Box, Typography, Button } from '@mui/material'
import { motion } from 'motion/react'
import { authColors } from '../../../styles/theme'

export const HeroWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  paddingTop: '2.5rem',
  paddingBottom: '2rem',
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.1) 100%)'
    : 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(59,130,246,0.05) 100%)',
}))

export const GridBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  backgroundImage: theme.palette.mode === 'dark'
    ? 'linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)'
    : 'linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)',
  backgroundSize: '4rem 4rem',
  maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)',
}))

export const HeroContent = styled(motion.div)({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
})  

export const HeroTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem !important',
  fontWeight: '700 !important',
  marginBottom: '1.5rem !important',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #93c5fd 100%)'
    : `linear-gradient(135deg, #1f2937 0%, ${authColors.primaryHover} 50%, #2563eb 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  lineHeight: 1.2,
  [theme.breakpoints.up('md')]: {
    fontSize: '4.5rem !important',
  },
}))

export const HeroSubtitle = styled(Typography)(({ theme }) => ({
  marginBottom: '1.5rem !important',
  maxWidth: '800px',
  marginLeft: 'auto !important',
  marginRight: 'auto !important',
  color: `${theme.palette.text.secondary} !important`,
  lineHeight: '1.6 !important',
}))

export const CTAButtonsContainer = styled(Box)({
  display: 'flex',
  gap: '1rem',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: '2rem',
})

export const PrimaryButton = styled(Button)({
  padding: '1.5rem 2rem !important',
  background: `linear-gradient(135deg, ${authColors.primary} 0%, ${authColors.secondary} 100%) !important`,
  '&:hover': {
    background: `linear-gradient(135deg, ${authColors.primaryHover} 0%, #2563eb 100%) !important`,
    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3) !important',
  },
})

export const SecondaryButton = styled(Button)(({ theme }) => ({
  padding: '1.5rem 2rem !important',
  borderColor: `${theme.palette.divider} !important`,
  '&:hover': {
    borderColor: `${theme.palette.primary.main} !important`,
    backgroundColor: `${authColors.accentLight} !important`,
  },
}))

export const HeroPaper = styled(motion(Box))({
  maxWidth: '1000px',
  marginLeft: 'auto',
  marginRight: 'auto',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-4px',
    background: `linear-gradient(135deg, ${authColors.primary} 0%, ${authColors.secondary} 100%)`,
    opacity: 0.2,
    filter: 'blur(40px)',
    zIndex: -1,
  },
})
