import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getWorkspaceColors } from '../../../../styles/theme';

export const SessionsHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const SessionsTitle = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
  };
});

export const LogoutAllButton = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: colors.error,
    backgroundColor: colors.errorLight,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.error,
      color: 'white',
    },
  };
});

export const SessionsListContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const SessionItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCurrent',
})<{ isCurrent?: boolean }>(({ theme, isCurrent }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: isCurrent ? `${colors.primary}10` : colors.backgroundTertiary,
    border: `1px solid ${isCurrent ? `${colors.primary}30` : colors.border}`,
  };
});

export const SessionInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

export const DeviceIcon = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    width: '40px',
    height: '40px',
    borderRadius: '0.5rem',
    backgroundColor: colors.backgroundHover,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textSecondary,
  };
});

export const SessionDetails = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
});

export const SessionDevice = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };
});

export const CurrentBadge = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.625rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    padding: '0.125rem 0.5rem',
    borderRadius: '0.25rem',
    backgroundColor: colors.successLight,
    color: colors.success,
  };
});

export const SessionMeta = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textTertiary,
  };
});

export const RevokeButton = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.375rem 0.625rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.textTertiary,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.errorLight,
      color: colors.error,
    },
  };
});
