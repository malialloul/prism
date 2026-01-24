import { styled } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

export const StyledDialog = styled(Dialog)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.backgroundSecondary,
      backgroundImage: 'none',
      borderRadius: '1rem',
      border: `1px solid ${colors.error}30`,
    },
  };
});

export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.error,
  };
});

export const CloseButton = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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

export const DangerBox = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem',
    backgroundColor: `${colors.error}15`,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.error}30`,
    marginBottom: '1.5rem',
  };
});

export const DangerTitle = styled('h4')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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

export const DangerText = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.textSecondary,
    margin: 0,
    lineHeight: 1.5,
  };
});

export const DangerList = styled('ul')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.textSecondary,
    margin: '0.5rem 0 0 0',
    paddingLeft: '1.25rem',
    lineHeight: 1.6,
    '& li': {
      marginBottom: '0.25rem',
    },
  };
});

export const StyledTextField = styled(TextField)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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

export const ConfirmationInput = styled(TextField)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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
        borderColor: colors.error,
      },
    },
    '& .MuiInputLabel-root': {
      color: colors.textSecondary,
    },
    '& .MuiOutlinedInput-input': {
      color: colors.error,
      fontWeight: 600,
      letterSpacing: '0.1rem',
    },
  };
});

export const SuccessContent = styled(DialogContent)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    paddingTop: '2rem',
    paddingBottom: '2rem',
    textAlign: 'center',
    color: colors.text,
  };
});

export const SuccessIcon = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: 64,
    height: 64,
    borderRadius: '50%',
    backgroundColor: `${colors.error}20`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    '& svg': {
      fontSize: 32,
      color: colors.error,
    },
  };
});

export const SuccessTitle = styled('h3')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text,
    margin: '0 0 0.5rem 0',
  };
});

export const SuccessMessage = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    textTransform: 'none',
    color: colors.textSecondary,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      borderColor: colors.borderLight,
    },
  };
});

export const DeleteButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    textTransform: 'none',
    color: 'white',
    backgroundColor: colors.error,
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: colors.error,
      filter: 'brightness(0.9)',
    },
    '&.Mui-disabled': {
      backgroundColor: colors.backgroundTertiary,
      color: colors.textMuted,
    },
  };
});

export const ConfirmationHint = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textTertiary,
    margin: '0 0 0.5rem 0',
  };
});
