import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const UsageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const PlanBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'planType',
})<{ planType?: 'free' | 'pro' | 'enterprise' }>(({ theme, planType = 'free' }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  
  const getPlanColors = () => {
    switch (planType) {
      case 'pro':
        return {
          bg: `${colors.primary}20`,
          color: colors.primary,
          border: `${colors.primary}40`,
        };
      case 'enterprise':
        return {
          bg: `${colors.warning}20`,
          color: colors.warning,
          border: `${colors.warning}40`,
        };
      default:
        return {
          bg: colors.backgroundTertiary,
          color: colors.textSecondary,
          border: colors.border,
        };
    }
  };

  const planColors = getPlanColors();

  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.375rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    backgroundColor: planColors.bg,
    color: planColors.color,
    border: `1px solid ${planColors.border}`,
  };
});

export const PlanHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const PlanInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const PlanName = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const UpgradeButton = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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
    '&:hover': {
      backgroundColor: colors.primaryHover,
    },
  };
});

export const UsageStats = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
  };
});

export const StatItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const StatLabel = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  };
});

export const StatValue = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const StatSubtext = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textTertiary,
  };
});

export const ProgressBar = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    height: '6px',
    backgroundColor: colors.backgroundHover,
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '0.25rem',
  };
});

export const ProgressFill = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'percentage' && prop !== 'status',
})<{ percentage: number; status?: 'normal' | 'warning' | 'danger' }>(({ theme, percentage, status = 'normal' }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  
  const getColor = () => {
    switch (status) {
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return {
    height: '100%',
    width: `${Math.min(percentage, 100)}%`,
    backgroundColor: getColor(),
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  };
});
