import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const DangerContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const DangerItem = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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

export const DangerInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
});

export const DangerTitle = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
  };
});

export const DangerDescription = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textTertiary,
  };
});

export const DangerButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'severity',
})<{ severity?: 'warning' | 'danger' }>(({ theme, severity = 'warning' }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  
  const getStyles = () => {
    if (severity === 'danger') {
      return {
        color: colors.error,
        backgroundColor: colors.errorLight,
        border: `1px solid ${colors.error}30`,
        '&:hover': {
          backgroundColor: colors.error,
          color: 'white',
        },
      };
    }
    return {
      color: colors.warning,
      backgroundColor: `${colors.warning}15`,
      border: `1px solid ${colors.warning}30`,
      '&:hover': {
        backgroundColor: colors.warning,
        color: 'white',
      },
    };
  };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    ...getStyles(),
  };
});

export const WarningBox = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: `${colors.error}10`,
    border: `1px solid ${colors.error}30`,
  };
});

export const WarningIcon = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    color: colors.error,
    flexShrink: 0,
  };
});

export const WarningText = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.error,
    margin: 0,
    lineHeight: 1.5,
  };
});
