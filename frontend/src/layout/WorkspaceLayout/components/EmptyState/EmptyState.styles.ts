import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getWorkspaceColors } from '../../../../styles/theme';

export const EmptyStateContainer = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 40px',
    background: colors.cardBg,
    border: `1px dashed ${colors.border}`,
    borderRadius: '20px',
    textAlign: 'center',
    marginTop: '24px',
  };
});

export const EmptyStateIcon = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    width: '120px',
    height: '120px',
    borderRadius: '24px',
    background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    position: 'relative',
    '& svg': {
      fontSize: '56px',
      color: colors.primary,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: '-4px',
      borderRadius: '28px',
      background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}40)`,
      zIndex: -1,
      opacity: 0.5,
    },
  };
});

export const EmptyStateTitle = styled('h2')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.textPrimary,
    margin: '0 0 12px 0',
  };
});

export const EmptyStateDescription = styled('p')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '16px',
    color: colors.textMuted,
    maxWidth: '500px',
    lineHeight: 1.6,
    margin: '0 0 40px 0',
  };
});

export const EmptyStateActions = styled(Box)({
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
  justifyContent: 'center',
});

export const ActionCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'cardVariant',
})<{ cardVariant: 'postgres' | 'mysql' | 'connect' }>(({ theme, cardVariant }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  
  const getVariantStyles = () => {
    switch (cardVariant) {
      case 'postgres':
        return {
          background: `linear-gradient(135deg, ${colors.postgres}15, ${colors.postgres}05)`,
          borderColor: `${colors.postgres}30`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${colors.postgres}25`,
            borderColor: colors.postgres,
          },
        };
      case 'mysql':
        return {
          background: `linear-gradient(135deg, ${colors.mysql}15, ${colors.mysql}05)`,
          borderColor: `${colors.mysql}30`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${colors.mysql}25`,
            borderColor: colors.mysql,
          },
        };
      case 'connect':
        return {
          background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
          borderColor: `${colors.primary}30`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${colors.primary}25`,
            borderColor: colors.primary,
          },
        };
    }
  };

  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '28px 32px',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '180px',
    border: '2px solid transparent',
    textTransform: 'none',
    ...getVariantStyles(),
  };
});

export const ActionCardIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'postgres' | 'mysql' | 'connect' }>(({ theme, variant }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'postgres':
        return {
          background: `${colors.postgres}25`,
          color: colors.postgres,
        };
      case 'mysql':
        return {
          background: `${colors.mysql}25`,
          color: colors.mysql,
        };
      case 'connect':
        return {
          background: `${colors.primary}25`,
          color: colors.primary,
        };
    }
  };

  return {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
      fontSize: '28px',
    },
    ...getVariantStyles(),
  };
});

export const ActionCardTitle = styled('span', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'postgres' | 'mysql' | 'connect' }>(({ theme, variant }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  
  const getColor = () => {
    switch (variant) {
      case 'postgres':
        return colors.postgres;
      case 'mysql':
        return colors.mysql;
      case 'connect':
        return colors.primary;
    }
  };

  return {
    fontSize: '15px',
    fontWeight: 600,
    color: getColor(),
  };
});

export const ActionCardSubtitle = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '12px',
    color: colors.textMuted,
  };
});

export const FeaturesList = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    justifyContent: 'center',
    marginTop: '48px',
    paddingTop: '48px',
    borderTop: `1px solid ${colors.border}`,
    maxWidth: '700px',
  };
});

export const FeatureItem = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: colors.textSecondary,
    fontSize: '14px',
    '& svg': {
      fontSize: '20px',
      color: colors.success,
    },
  };
});
