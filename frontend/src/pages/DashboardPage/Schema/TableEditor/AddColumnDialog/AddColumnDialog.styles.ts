import { styled } from '@mui/material/styles';
import { Dialog, Box, Button, TextField, Select } from '@mui/material';
import { getDashboardColors } from '../../../../../styles/theme';

export const StyledDialog = styled(Dialog)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.backgroundCard,
      borderRadius: '0.75rem',
      maxWidth: '600px',
      width: '100%',
      overflowX: 'auto',
    },
  };
});

export const DialogHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1.25rem 1.5rem',
    borderBottom: `1px solid ${colors.border}`,
  };
});

export const DialogTitle = styled('h2')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const DialogSubtitle = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: '0.25rem 0 0 0',
    fontSize: '0.8125rem',
    color: colors.textSecondary,
  };
});

export const DialogContent = styled(Box)(() => {
  return {
    padding: '1.5rem',
    maxHeight: '60vh',
    overflowY: 'auto',
    overflowX: 'auto',
  };
});

export const DialogFooter = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem 1.5rem',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  };
});

export const FormGroup = styled(Box)({
  marginBottom: '1.25rem',
  '&:last-child': {
    marginBottom: 0,
  },
});

export const FormLabel = styled('label')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: colors.textSecondary,
    marginBottom: '0.5rem',
  };
});

export const FormRow = styled(Box)({
  display: 'flex',
  gap: '1rem',
  '& > *': {
    flex: 1,
  },
});

export const StyledTextField = styled(TextField)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiOutlinedInput-root': {
      backgroundColor: colors.backgroundTertiary,
      borderRadius: '0.5rem',
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
    '& .MuiInputBase-input': {
      color: colors.text,
      fontSize: '0.875rem',
      padding: '0.625rem 0.875rem',
    },
    '& .MuiInputLabel-root': {
      color: colors.textSecondary,
    },
  };
});

export const StyledSelect = styled(Select)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.border,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.borderLight,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
    },
    '& .MuiSelect-select': {
      color: colors.text,
      fontSize: '0.875rem',
      padding: '0.625rem 0.875rem',
    },
  };
});

export const CancelButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    padding: '0.5rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.text,
    },
  };
});

export const SubmitButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.primary,
    color: 'white',
    padding: '0.5rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '0.5rem',
    '&:hover': {
      backgroundColor: colors.primaryHover,
    },
    '&:disabled': {
      backgroundColor: colors.backgroundTertiary,
      color: colors.textMuted,
    },
  };
});

export const DeleteButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.error,
    color: 'white',
    padding: '0.5rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '0.5rem',
    '&:hover': {
      backgroundColor: colors.error,
      filter: 'brightness(1.1)',
    },
  };
});

export const CheckboxLabel = styled('label')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: colors.text,
    cursor: 'pointer',
    userSelect: 'none',
  };
});
