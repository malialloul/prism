import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getWorkspaceColors } from '../../../styles/theme';

export const SettingsGrid = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const SettingItem = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 0',
    borderBottom: `1px solid ${colors.border}`,
    '&:last-child': {
      borderBottom: 'none',
      paddingBottom: 0,
    },
    '&:first-of-type': {
      paddingTop: 0,
    },
  };
});

export const SettingInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
});

export const SettingLabel = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
  };
});

export const SettingValue = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.textSecondary,
  };
});

export const ChangeButton = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: colors.textSecondary,
    backgroundColor: colors.backgroundTertiary,
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.text,
    },
  };
});
