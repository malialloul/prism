import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getWorkspaceColors } from '../../../../styles/theme';

export const StatsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(2, 1fr)',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(5, 1fr)',
  },
}));

export const StatCard = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.backgroundCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: colors.borderLight,
    },
  };
});

export const StatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const StatIconBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'primary' | 'secondary' | 'success' | 'warning' | 'info' }>(({ theme, variant }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  const variantColors = {
    primary: { bg: colors.primaryLight, color: colors.primary },
    secondary: { bg: colors.secondaryLight, color: colors.secondary },
    success: { bg: colors.successLight, color: colors.success },
    warning: { bg: colors.warningLight, color: colors.warning },
    info: { bg: colors.infoLight, color: colors.info },
  };
  
  return {
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variantColors[variant].bg,
    color: variantColors[variant].color,
    '& svg': {
      fontSize: '1.25rem',
    },
  };
});

export const StatTrend = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'positive',
})<{ positive?: boolean }>(({ theme, positive }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: positive ? colors.success : colors.error,
    '& svg': {
      fontSize: '0.875rem',
    },
  };
});

export const StatContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
});

export const StatValue = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: colors.text,
    lineHeight: 1,
  };
});

export const StatLabel = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.textSecondary,
  };
});

export const StatSubValue = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.6875rem',
    color: colors.textMuted,
    marginTop: '0.125rem',
  };
});

export const StatFooter = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '0.75rem',
    borderTop: `1px solid ${colors.border}`,
    marginTop: 'auto',
  };
});

export const StatChange = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textMuted,
  };
});

export const LimitBar = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: '0.5rem',
  };
});

export const LimitBarFill = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'percentage' && prop !== 'variant',
})<{ percentage: number; variant?: 'normal' | 'warning' | 'danger' }>(({ theme, percentage, variant = 'normal' }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  const fillColors = {
    normal: colors.primary,
    warning: colors.warning,
    danger: colors.error,
  };
  return {
    height: '100%',
    width: `${Math.min(percentage, 100)}%`,
    backgroundColor: fillColors[variant],
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  };
});

export const LimitText = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.6875rem',
    color: colors.textMuted,
    marginTop: '0.25rem',
  };
});
