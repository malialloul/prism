import { styled } from '@mui/material/styles';
import { Box, IconButton } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

export const DialogContainer = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '24px',
    minWidth: '500px',
    backgroundColor: colors.backgroundCard,
  };
});

export const DialogHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
});

export const DialogTitle = styled('h2')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const CloseButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const DetailsSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const DetailRow = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '8px',
  };
});

export const DetailIcon = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    flexShrink: 0,
    '& svg': {
      fontSize: '1.25rem',
    },
  };
});

export const DetailContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const DetailLabel = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.textSecondary,
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };
});

export const DetailValue = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
    wordBreak: 'break-all',
  };
});

export const ConnectionStringBox = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    marginTop: '8px',
    padding: '16px',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
  };
});

export const ConnectionStringLabel = styled('div')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  };
});

export const ConnectionStringTitle = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };
});

export const ConnectionStringValue = styled('code')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'block',
    fontSize: '0.8125rem',
    fontFamily: 'monospace',
    color: colors.text,
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
    padding: '12px',
    borderRadius: '6px',
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
  };
});

export const CopyButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '4px',
    color: colors.textSecondary,
    '&:hover': {
      color: colors.primary,
      backgroundColor: colors.primaryLight,
    },
  };
});

export const StatusBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: 'connected' | 'disconnected' | 'error' }>(({ theme, status }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  const statusColors = {
    connected: { bg: colors.successLight, color: colors.success },
    disconnected: { bg: colors.warningLight, color: colors.warning },
    error: { bg: colors.errorLight, color: colors.error },
  };
  
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: statusColors[status].bg,
    color: statusColors[status].color,
    '&::before': {
      content: '""',
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    },
  };
});

export const DetailsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px',
});
