import { styled } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Stepper, Step, StepLabel } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

export const StyledDialog = styled(Dialog)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.backgroundSecondary,
      backgroundImage: 'none',
      borderRadius: '1rem',
      border: `1px solid ${colors.border}`,
      minWidth: 440,
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
    color: colors.text,
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

export const StyledStepper = styled(Stepper)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem 1.5rem',
    borderBottom: `1px solid ${colors.border}`,
    '& .MuiStepLabel-label': {
      color: colors.textSecondary,
      fontSize: '0.75rem',
      '&.Mui-active': {
        color: colors.primary,
        fontWeight: 600,
      },
      '&.Mui-completed': {
        color: colors.success,
      },
    },
    '& .MuiStepIcon-root': {
      color: colors.backgroundTertiary,
      '&.Mui-active': {
        color: colors.primary,
      },
      '&.Mui-completed': {
        color: colors.success,
      },
    },
  };
});

export const StyledStep = styled(Step)({});

export const StyledStepLabel = styled(StepLabel)({});

export const StyledDialogContent = styled(DialogContent)({
  paddingTop: '1.5rem',
});

export const StepContent = styled(Box)({
  minHeight: 200,
  display: 'flex',
  flexDirection: 'column',
});

export const StepDescription = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    color: colors.textSecondary,
    marginTop: 0,
    marginBottom: '1.5rem',
    lineHeight: 1.5,
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

export const QRCodeContainer = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    '& img': {
      borderRadius: '0.5rem',
      border: `1px solid ${colors.border}`,
      padding: '0.5rem',
      backgroundColor: '#fff',
    },
  };
});

export const SecretKeyContainer = styled(Box)({
  marginBottom: '1.5rem',
});

export const SecretKeyLabel = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textSecondary,
    display: 'block',
    marginBottom: '0.5rem',
  };
});

export const SecretKeyValue = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: colors.text,
    wordBreak: 'break-all',
  };
});

export const CopyButton = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.25rem',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    color: colors.textSecondary,
    flexShrink: 0,
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.primary,
    },
  };
});

export const VerificationInput = styled(TextField)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    marginTop: '1rem',
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

export const SuccessContent = styled(Box)({
  textAlign: 'center',
  paddingTop: '1rem',
});

export const SuccessIcon = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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

export const BackupCodesContainer = styled(Box)({
  marginTop: '1.5rem',
  textAlign: 'left',
});

export const BackupCodesTitle = styled('h4')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
    margin: '0 0 0.5rem 0',
  };
});

export const BackupCodesDescription = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textSecondary,
    margin: '0 0 1rem 0',
  };
});

export const BackupCodesGrid = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: colors.text,
  };
});

export const BackupCode = styled('span')({
  textAlign: 'center',
  padding: '0.25rem',
});

export const BackupCodesActions = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '1rem',
  marginTop: '1rem',
});

export const StyledDialogActions = styled(DialogActions)({
  padding: '0.5rem 1.5rem 1.5rem',
  gap: '0.5rem',
});

export const CancelButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const SubmitButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.primary,
    color: '#fff',
    '&:hover': {
      backgroundColor: colors.primaryHover,
    },
    '&:disabled': {
      backgroundColor: colors.backgroundTertiary,
      color: colors.textMuted,
    },
  };
});

export const SecondaryButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    color: colors.text,
    borderColor: colors.border,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      borderColor: colors.borderLight,
    },
  };
});
