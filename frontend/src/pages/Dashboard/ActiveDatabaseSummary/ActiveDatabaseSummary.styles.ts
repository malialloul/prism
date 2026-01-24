import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const SummaryCard = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.backgroundCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
  };
});

export const LeftContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

export const DatabaseIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'engine',
})<{ engine: 'postgres' | 'mysql' }>(({ theme, engine }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: engine === 'postgres' ? colors.postgresLight : colors.mysqlLight,
    color: engine === 'postgres' ? colors.postgres : colors.mysql,
    fontSize: '1.5rem',
    fontWeight: 700,
  };
});

export const DatabaseDetails = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
});

export const DatabaseName = styled('h3')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const DatabaseMeta = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

export const MetaItem = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  };
});

export const EngineBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'engine',
})<{ engine: 'postgres' | 'mysql' }>(({ theme, engine }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.25rem 0.625rem',
    borderRadius: '0.25rem',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: engine === 'postgres' ? colors.postgresLight : colors.mysqlLight,
    color: engine === 'postgres' ? colors.postgres : colors.mysql,
  };
});

export const RightContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
});

export const StatusIndicator = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const StatusDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: 'connected' | 'disconnected' | 'provisioning' }>(({ theme, status }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '50%',
    backgroundColor: status === 'connected' 
      ? colors.success 
      : status === 'provisioning' 
        ? colors.warning 
        : colors.error,
    ...(status === 'provisioning' && {
      animation: 'pulse 2s ease-in-out infinite',
    }),
  };
});

export const StatusText = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: 'connected' | 'disconnected' | 'provisioning' }>(({ theme, status }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: status === 'connected' 
      ? colors.success 
      : status === 'provisioning' 
        ? colors.warning 
        : colors.error,
    textTransform: 'capitalize',
  };
});

export const SyncInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '0.125rem',
});

export const SyncLabel = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.6875rem',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };
});

export const SyncTime = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: colors.text,
  };
});

export const ActionButtons = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const ActionButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: 'default' | 'danger' }>(({ theme, variant = 'default' }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    ...(variant === 'danger' ? {
      backgroundColor: colors.errorLight,
      color: colors.error,
      border: `1px solid ${colors.error}30`,
      '&:hover': {
        backgroundColor: colors.error,
        color: 'white',
      },
    } : {
      backgroundColor: colors.backgroundTertiary,
      color: colors.textSecondary,
      border: `1px solid ${colors.border}`,
      '&:hover': {
        backgroundColor: colors.backgroundHover,
        color: colors.text,
      },
    }),
  };
});
