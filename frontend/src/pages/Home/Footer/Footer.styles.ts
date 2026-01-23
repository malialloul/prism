import { styled } from '@mui/material/styles'
import { Box, IconButton, Paper } from '@mui/material'
import { authColors } from '../../../styles/theme'

export const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}))

export const LinksContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
})

export const BrandBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '1rem',
})

export const LogoBox = styled(Box)({
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  background: `linear-gradient(135deg, ${authColors.primary} 0%, ${authColors.secondary} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const SocialIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: `${theme.palette.action.hover} !important`,
  '&:hover': {
    backgroundColor: `${theme.palette.action.selected} !important`,
    color: `${theme.palette.primary.main} !important`,
  },
}))

export const PrivacyPromiseBox = styled(Paper)(({ theme }) => ({
  padding: '1.5rem',
  marginBottom: '1.5rem',
  backgroundColor: `${theme.palette.mode === 'dark'
    ? 'rgba(139, 92, 246, 0.1)'
    : 'rgba(139, 92, 246, 0.05)'} !important`,
  border: `1px solid ${theme.palette.mode === 'dark'
    ? 'rgba(139, 92, 246, 0.3)'
    : 'rgba(139, 92, 246, 0.2)'} !important`,
}))

export const BottomBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  paddingTop: '2rem',
  borderTop: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}))

export const SocialBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
})
