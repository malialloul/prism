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

export const WarningBox = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem',
    backgroundColor: `${colors.error}15`,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.error}30`,
    marginBottom: '1.5rem',
  };
});

export const WarningTitle = styled('h4')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.error,
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };
});

export const WarningText = styled('p')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.textSecondary,
    margin: 0,
    lineHeight: 1.5,
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

export const VerificationInput = styled(TextField)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
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
      textAlign: 'center',
      letterSpacing: '0.5rem',
      fontSize: '1.25rem',
      fontFamily: 'monospace',
    },
  };
});

export const SuccessContent = styled(DialogContent)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    paddingTop: '2rem',
    paddingBottom: '2rem',
    textAlign: 'center',
    color: colors.text,
  };
});

export const SuccessIcon = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    width: 64,
    height: 64,
    borderRadius: '50%',
    backgroundColor: `${colors.success}20`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    '& svg': {
      fontSize: 32,
      color: colors.success,
    },
  };
});

export const SuccessTitle = styled('h3')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text,
    margin: '0 0 0.5rem 0',
  };
});

export const SuccessMessage = styled('p')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    color: colors.textSecondary,
    margin: 0,
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

export const DisableButton = styled(Button)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.error,
    color: '#fff',
    '&:hover': {
      backgroundColor: colors.error,
      filter: 'brightness(0.9)',
    },
    '&:disabled': {
      backgroundColor: colors.backgroundTertiary,
      color: colors.textMuted,
    },
  };
});
