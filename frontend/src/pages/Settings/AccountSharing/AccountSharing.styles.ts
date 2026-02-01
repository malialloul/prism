import { styled } from '@mui/material/styles';
import { Box, Button, IconButton } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const ShareForm = styled('form')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: '0.75rem',
    border: `1px solid ${colors.border}`,
    marginBottom: '1.5rem',
  };
});

export const ShareFormRow = styled(Box)({
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
});

export const ShareButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.primary,
    color: 'white',
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: '0.5rem',
    '&:hover': {
      backgroundColor: colors.primaryHover,
    },
    '&:disabled': {
      opacity: 0.6,
    },
  };
});

export const ShareList = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const ShareCard = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    backgroundColor: colors.backgroundCard,
    borderRadius: '0.75rem',
    border: `1px solid ${colors.border}`,
    transition: 'border-color 0.15s ease',
    '&:hover': {
      borderColor: colors.primary,
    },
  };
});

export const ShareInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  flex: 1,
});

export const ShareEmail = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const ShareMeta = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.textMuted,
  };
});

export const StatusBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: 'pending' | 'accepted' | 'revoked' | 'expired' }>(({ theme, status }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  const statusColors = {
    pending: { bg: colors.warningLight, text: colors.warning },
    accepted: { bg: colors.successLight, text: colors.success },
    revoked: { bg: colors.errorLight, text: colors.error },
    expired: { bg: colors.backgroundTertiary, text: colors.textMuted },
  };
  const { bg, text } = statusColors[status];
  return {
    padding: '0.25rem 0.625rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    backgroundColor: bg,
    color: text,
    marginLeft: '0.75rem',
  };
});

export const RevokeButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    color: colors.error,
    padding: '0.5rem',
    '&:hover': {
      backgroundColor: colors.errorLight,
    },
  };
});

export const TempPasswordBox = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: colors.successLight,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.success}`,
    marginTop: '1rem',
  };
});

export const TempPasswordLabel = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: colors.success,
  };
});

export const TempPasswordValue = styled('code')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.125rem',
    fontWeight: 700,
    fontFamily: 'monospace',
    color: colors.text,
    backgroundColor: colors.backgroundCard,
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    letterSpacing: '0.1em',
    userSelect: 'all',
  };
});

export const SectionDivider = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    height: '1px',
    backgroundColor: colors.border,
    margin: '1.5rem 0',
  };
});

export const SectionSubtitle = styled('h4')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '1rem',
    marginTop: 0,
  };
});

export const EmptyState = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    textAlign: 'center',
    padding: '2rem',
    color: colors.textMuted,
    fontSize: '0.875rem',
  };
});
