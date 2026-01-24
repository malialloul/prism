import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, TextField, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const ActionsWrapper = styled(Box)({
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap',
});

export const ActionCard = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: '1 1 200px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    backgroundColor: colors.backgroundCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    textTransform: 'none',
    justifyContent: 'flex-start',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      borderColor: colors.borderLight,
    },
  };
});

export const ActionIconBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'create' | 'connect' }>(({ theme, variant }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variant === 'create' ? colors.primaryLight : colors.secondaryLight,
    color: variant === 'create' ? colors.primary : colors.secondary,
  };
});

export const ActionContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.125rem',
});

export const ActionTitle = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const ActionDescription = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textMuted,
  };
});

export const StyledDialog = styled(Dialog)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.border}`,
  };
});

export const DialogTitle = styled('h2')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const DialogSubtitle = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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

export const FormGroup = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const FormLabel = styled('label')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
  };
});

export const FormHint = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textMuted,
  };
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
        borderWidth: '1px',
      },
      '& input': {
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        color: colors.text,
        '&::placeholder': {
          color: colors.textMuted,
          opacity: 1,
        },
      },
    },
  };
});

export const EngineToggleGroup = styled(ToggleButtonGroup)({
  width: '100%',
  gap: '0.75rem',
  '& .MuiToggleButtonGroup-grouped': {
    border: 'none',
    '&:not(:first-of-type)': {
      borderRadius: '0.5rem',
      marginLeft: 0,
    },
    '&:first-of-type': {
      borderRadius: '0.5rem',
    },
  },
});

export const EngineToggleButton = styled(ToggleButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    padding: '1rem',
    backgroundColor: colors.backgroundTertiary,
    border: `1px solid ${colors.border} !important`,
    borderRadius: '0.5rem !important',
    textTransform: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
    '&.Mui-selected': {
      backgroundColor: colors.primaryLight,
      borderColor: `${colors.primary} !important`,
      '&:hover': {
        backgroundColor: colors.primaryLight,
      },
    },
  };
});

export const EngineIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'engine',
})<{ engine: 'postgres' | 'mysql' }>(({ theme, engine }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: engine === 'postgres' ? colors.postgresLight : colors.mysqlLight,
    color: engine === 'postgres' ? colors.postgres : colors.mysql,
    fontSize: '1.25rem',
    fontWeight: 700,
  };
});

export const EngineName = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
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

export const CancelButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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

export const SubmitButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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
      backgroundColor: colors.backgroundHover,
      color: colors.textMuted,
    },
  };
});

export const FormRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
});

export const SSLToggle = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
  };
});

export const SSLLabel = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
});

export const SSLTitle = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
  };
});

export const SSLDescription = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textMuted,
  };
});

export const TestConnectionButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.625rem 1.25rem',
    borderRadius: '0.5rem',
    textTransform: 'none',
    fontWeight: 500,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      borderColor: colors.borderLight,
    },
    '&.Mui-disabled': {
      color: colors.textMuted,
      borderColor: colors.border,
    },
  };
});

export const ConnectionStatus = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: 'success' | 'error' | 'testing' }>(({ theme, status }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  
  const statusColors = {
    success: {
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)',
      text: '#22c55e',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#ef4444',
    },
    testing: {
      bg: colors.primaryLight,
      border: `${colors.primary}40`,
      text: colors.primary,
    },
  };

  const style = statusColors[status];

  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: style.bg,
    border: `1px solid ${style.border}`,
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: style.text,
  };
});
