import { styled } from '@mui/material/styles';
import { Box, Button } from '@mui/material';
import { getWorkspaceColors } from '../../../../styles/theme';

export const TwoFactorSectionContainer = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: colors.backgroundTertiary,
    border: `1px solid ${colors.border}`,
  };
});

export const TwoFactorInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

export const TwoFactorIcon = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    width: '40px',
    height: '40px',
    borderRadius: '0.5rem',
    backgroundColor: colors.backgroundHover,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.primary,
  };
});

export const TwoFactorText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
});

export const TwoFactorTitle = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
  };
});

export const TwoFactorDescription = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textTertiary,
  };
});

export const EnableButton = styled(Button)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'white',
    backgroundColor: colors.primary,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textTransform: 'none',
    minWidth: 'auto',
    '&:hover': {
      backgroundColor: colors.primaryHover,
    },
    '&:disabled': {
      backgroundColor: colors.backgroundTertiary,
      color: colors.textMuted,
    },
  };
});
