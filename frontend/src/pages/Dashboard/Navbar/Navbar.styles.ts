import { styled } from '@mui/material/styles';
import { Box, IconButton } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const NavbarWrapper = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.5rem',
    backgroundColor: colors.backgroundSecondary,
    borderBottom: `1px solid ${colors.border}`,
  };
});

export const LeftSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
});

export const Logo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
});

export const LogoIcon = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '2rem',
    height: '2rem',
    borderRadius: '0.5rem',
    background: colors.gradientPrimary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 700,
  };
});

export const LogoText = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: colors.text,
    letterSpacing: '-0.025em',
  };
});

export const RightSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const ActionButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    color: colors.textSecondary,
    padding: '0.5rem',
    borderRadius: '0.5rem',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.text,
    },
  };
});
