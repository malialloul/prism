import { styled } from '@mui/material/styles';
import { Box, Button, Dialog } from '@mui/material';
import { getWorkspaceColors } from '../../../../styles/theme';

export const StyledDialog = styled(Dialog)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.backgroundCard,
      borderRadius: '1rem',
      border: `1px solid ${colors.border}`,
      padding: '0',
      minWidth: '440px',
      maxWidth: '500px',
    },
  };
});

export const DialogHeader = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.border}`,
  };
});

export const DialogTitle = styled('h2')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const DialogSubtitle = styled('p')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    margin: '0.5rem 0 0 0',
    fontSize: '0.875rem',
    color: colors.textSecondary,
  };
});

export const DialogContent = styled(Box)({
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
});

export const InfoBox = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: colors.primary + '15',
    border: `1px solid ${colors.primary}30`,
    borderRadius: '0.5rem',
  };
});

export const InfoIcon = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    color: colors.primary,
    display: 'flex',
    alignItems: 'flex-start',
    paddingTop: '2px',
    '& svg': {
      fontSize: '1.25rem',
    },
  };
});

export const InfoText = styled('p')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '0.875rem',
    color: colors.text,
    lineHeight: 1.5,
  };
});

export const DatabasesContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const DatabaseCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'from' | 'to' }>(({ theme, variant }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  const borderColor = variant === 'from' ? '#ef4444' : colors.success;
  return {
    padding: '1rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
    border: `1px solid ${borderColor}40`,
    borderLeft: `3px solid ${borderColor}`,
  };
});

export const DatabaseLabel = styled('span', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'from' | 'to' }>(({ variant }) => {
  const color = variant === 'from' ? '#ef4444' : '#22c55e';
  return {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: color,
    marginBottom: '0.25rem',
    display: 'block',
  };
});

export const DatabaseName = styled('h4')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const DatabaseMeta = styled('p')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: colors.textSecondary,
  };
});

export const ArrowContainer = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    justifyContent: 'center',
    color: colors.textSecondary,
  };
});

export const DialogFooter = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem 1.5rem',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  };
});

export const CancelButton = styled(Button)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '0.625rem 1.25rem',
    borderRadius: '0.5rem',
    textTransform: 'none',
    fontWeight: 500,
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const SwitchButton = styled(Button)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '0.625rem 1.25rem',
    borderRadius: '0.5rem',
    textTransform: 'none',
    fontWeight: 500,
    backgroundColor: colors.primary,
    color: 'white',
    '&:hover': {
      backgroundColor: colors.primaryHover,
    },
    '&.Mui-disabled': {
      backgroundColor: colors.primary + '80',
      color: 'rgba(255, 255, 255, 0.7)',
    },
  };
});
