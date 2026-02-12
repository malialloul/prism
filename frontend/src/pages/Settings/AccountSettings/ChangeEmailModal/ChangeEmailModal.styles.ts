import { styled } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';
import { getWorkspaceColors } from '../../../../styles/theme';

export const StyledDialog = styled(Dialog)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.backgroundSecondary,
      backgroundImage: 'none',
      borderRadius: '1rem',
      border: `1px solid ${colors.border}`,
    },
  };
});

export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: colors.text,
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '1rem',
  };
});

export const ModalTitle = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const CloseButton = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    color: colors.textSecondary,
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.text,
    },
  };
});

export const StyledDialogContent = styled(DialogContent)({
  paddingTop: '1.5rem',
});

export const CurrentEmailLabel = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'block',
    fontSize: '0.875rem',
    color: colors.textSecondary,
    marginBottom: '0.25rem',
  };
});

export const CurrentEmailValue = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 500,
    color: colors.text,
    marginBottom: '1rem',
  };
});

export const StyledTextField = styled(TextField)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    marginBottom: '1rem',
    '& .MuiOutlinedInput-root': {
      backgroundColor: colors.backgroundTertiary,
      '& fieldset': {
        borderColor: colors.border,
      },
      '&:hover fieldset': {
        borderColor: colors.borderLight,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary,
      },
    },
    '& .MuiInputLabel-root': {
      color: colors.textSecondary,
    },
    '& .MuiOutlinedInput-input': {
      color: colors.text,
    },
  };
});

export const HelpText = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'block',
    fontSize: '0.75rem',
    color: colors.textSecondary,
    marginTop: '0.5rem',
  };
});

export const StyledDialogActions = styled(DialogActions)({
  padding: '0.5rem 1.5rem 1.5rem',
  gap: '0.5rem',
});

export const CancelButton = styled(Button)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const SubmitButton = styled(Button)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.primary,
    color: '#fff',
    '&:hover': {
      backgroundColor: colors.primaryHover,
    },
    '&.Mui-disabled': {
      backgroundColor: colors.backgroundTertiary,
      color: colors.textMuted,
    },
  };
});
