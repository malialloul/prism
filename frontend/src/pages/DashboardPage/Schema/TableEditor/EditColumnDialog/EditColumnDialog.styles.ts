import { styled } from '@mui/material/styles';
import { DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent, Box, Button, TextField, Select } from '@mui/material';
import { getWorkspaceColors } from '../../../../../styles/theme';

export const DialogTitle = styled(MuiDialogTitle)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    color: colors.text,
  };
});

export const DialogContent = styled(MuiDialogContent)({
  paddingTop: '16px !important',
});

export const FormGroup = styled(Box)({
  marginBottom: '1.25rem',
  '&:last-child': {
    marginBottom: 0,
  },
});

export const FormLabel = styled('label')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
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
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
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
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
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
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
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
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
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

export const CheckboxLabel = styled('label')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: colors.textSecondary,
    cursor: 'pointer',
    '& input': {
      accentColor: colors.primary,
    },
  };
});
