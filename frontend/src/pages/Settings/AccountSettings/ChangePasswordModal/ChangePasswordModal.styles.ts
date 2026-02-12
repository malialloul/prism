import { styled } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, LinearProgress } from '@mui/material';
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

export const PasswordStrengthContainer = styled(Box)({
  marginBottom: '1rem',
});

export const StrengthBarContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '0.5rem',
});

export const StyledLinearProgress = styled(LinearProgress)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.backgroundTertiary,
    '& .MuiLinearProgress-bar': {
      borderRadius: 2,
    },
  };
});

export const StrengthLabel = styled('span')({
  fontSize: '0.75rem',
  minWidth: 50,
});

export const RequirementsContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
});

export const RequirementItem = styled('span')<{ met: boolean }>(({ theme, met }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: met ? colors.success : colors.textMuted,
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    '& svg': {
      fontSize: 12,
    },
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
