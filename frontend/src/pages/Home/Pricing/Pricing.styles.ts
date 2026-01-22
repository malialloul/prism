import { styled } from '@mui/material/styles'
import { Box, Card, CardContent, ListItem } from '@mui/material'
import { motion } from 'motion/react'

export const PricingWrapper = styled(Box)(({ theme }) => ({
  padding: '3rem 0',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1a1f35 0%, #2d1b4e 30%)'
    : 'linear-gradient(135deg, #f9fafb 0%, #ede9fe 100%)',
}))

export const HeaderBox = styled(Box)({
  textAlign: 'center',
  marginBottom: '2rem',
})

export const PricingCardsContainer = styled(Box)({
  marginBottom: '2rem',
  maxWidth: '1000px',
  marginLeft: 'auto',
  marginRight: 'auto',
})

export const MotionCard = styled(motion(Card))(({ theme }) => ({
  height: '100%',
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
}))

export const StyledCardContent = styled(CardContent)({
  padding: '2rem',
})

export const PriceBox = styled(Box)({
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.5rem',
})

export const InfoBox = styled(Box)({
  marginBottom: '1.5rem',
})

export const StyledListItem = styled(ListItem)({
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: '0.5rem',
  paddingBottom: '0.5rem',
})

export const FeaturesContainer = styled(Box)({
  maxWidth: '800px',
  marginLeft: 'auto',
  marginRight: 'auto',
})

export const FeatureCheckbox = styled(Box)({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginTop: '0.25rem',
})

export const FeatureRow = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1.5rem',
})
