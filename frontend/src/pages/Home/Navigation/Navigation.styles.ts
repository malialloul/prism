import { styled } from '@mui/material/styles'
import { AppBar, Toolbar, Box } from '@mui/material'

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  boxShadow: theme.shadows[1],
}))

export const StyledToolbar = styled(Toolbar)({
  justifyContent: 'space-between',
})

export const LogoBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
})

export const LogoIcon = styled(Box)({
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const NavLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '2rem',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))

export const RightBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
})
