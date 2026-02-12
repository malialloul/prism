import { styled } from '@mui/material/styles';
import { Dialog, Box, Button, Typography } from '@mui/material';
import { getWorkspaceColors } from '../../../../../styles/theme';

export const StyledDialog = styled(Dialog)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.cardBg,
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      minWidth: '400px',
      maxWidth: '500px',
    },
  };
});

export const DialogHeader = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '1.5rem 1.5rem 1rem',
    borderBottom: `1px solid ${colors.border}`,
  };
});

export const DialogTitle = styled(Typography)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '0.25rem',
  };
});

export const DialogSubtitle = styled(Typography)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    color: colors.textMuted,
  };
});

export const DialogContent = styled(Box)({
  padding: '1.5rem',
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
    textTransform: 'none',
    color: colors.textMuted,
    '&:hover': {
      backgroundColor: colors.backgroundSecondary,
    },
  };
});

export const DeleteButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  backgroundColor: theme.palette.error.main,
  color: '#fff',
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

export const WarningBox = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: `${theme.palette.warning.main}10`,
    border: `1px solid ${theme.palette.warning.main}40`,
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    '& .MuiSvgIcon-root': {
      color: theme.palette.warning.main,
      fontSize: '1.25rem',
      marginTop: '2px',
    },
    '& p': {
      margin: 0,
      fontSize: '0.875rem',
      color: colors.text,
      lineHeight: 1.5,
    },
  };
});
