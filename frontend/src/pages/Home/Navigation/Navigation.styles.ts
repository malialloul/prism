import { styled } from '@mui/material/styles'
import { AppBar, Toolbar, Box } from '@mui/material'
import { authColors } from '../../../styles/theme'

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
  width: '50px',
  height: '50px',
  borderRadius: '8px',
  background: 'white',
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
