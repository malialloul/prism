import { styled, keyframes } from '@mui/material/styles';
import { Box, TextField, IconButton, Paper, Button, Chip } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const AiPanelWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
});

export const ChatContainer = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
  };
});

export const ChatMessages = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})<{ isUser?: boolean }>(({ theme, isUser }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    maxWidth: '85%',
    padding: '0.75rem 1rem',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    backgroundColor: isUser ? colors.primary : colors.backgroundTertiary,
    color: isUser ? '#fff' : colors.text,
    borderRadius: isUser ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
    animation: `${fadeIn} 0.3s ease-out`,
    boxShadow: 'none',
    border: `1px solid ${isUser ? colors.primary : colors.border}`,
  };
});

export const MessageContent = styled(Box)({
  fontSize: '0.875rem',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
});

export const SqlBlock = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    marginTop: '0.75rem',
    padding: '0.75rem',
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e2e' : '#f8f8f8',
    borderRadius: '0.5rem',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    overflowX: 'auto',
    border: `1px solid ${colors.border}`,
    color: colors.text,
  };
});

export const SqlHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '0.75rem',
    color: colors.textMuted,
  };
});

export const ParamsBlock = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    marginTop: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: colors.backgroundHover,
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    color: colors.textSecondary,
  };
});

export const ChatInputContainer = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem',
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: colors.backgroundTertiary,
  };
});

export const ChatInput = styled(TextField)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      backgroundColor: colors.background,
      fontSize: '0.875rem',
      borderRadius: '0.5rem',
      '& fieldset': {
        borderColor: colors.border,
      },
      '&:hover fieldset': {
        borderColor: colors.primary,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary,
      },
    },
    '& .MuiInputBase-input': {
      color: colors.text,
      padding: '0.75rem 1rem',
    },
    '& .MuiInputBase-input::placeholder': {
      color: colors.textMuted,
      opacity: 1,
    },
  };
});

export const SendButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.primary,
    color: '#fff',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    '&:hover': {
      backgroundColor: colors.primary,
      opacity: 0.9,
    },
    '&:disabled': {
      backgroundColor: colors.border,
      color: colors.textMuted,
    },
  };
});

export const ActionButtons = styled(Box)({
  display: 'flex',
  gap: '0.5rem',
  marginTop: '0.75rem',
  flexWrap: 'wrap',
});

export const ActionButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    padding: '0.25rem 0.75rem',
    textTransform: 'none',
    borderRadius: '0.25rem',
    color: colors.primary,
    borderColor: colors.primary,
    '&:hover': {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
    },
  };
});

export const ValidationChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'isValid',
})<{ isValid?: boolean }>(({ isValid }) => ({
  height: '20px',
  fontSize: '0.65rem',
  fontWeight: 600,
  backgroundColor: isValid ? '#49cc9020' : '#f93e3e20',
  color: isValid ? '#49cc90' : '#f93e3e',
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

export const OperationChip = styled(Chip)<{ operation?: string }>(({ operation }) => {
  const operationColors: Record<string, { bg: string; color: string }> = {
    SELECT: { bg: '#61affe20', color: '#61affe' },
    INSERT: { bg: '#49cc9020', color: '#49cc90' },
    UPDATE: { bg: '#fca13020', color: '#fca130' },
    DELETE: { bg: '#f93e3e20', color: '#f93e3e' },
  };
  const colors = operationColors[operation || 'SELECT'] || operationColors.SELECT;
  return {
    height: '20px',
    fontSize: '0.65rem',
    fontWeight: 600,
    backgroundColor: colors.bg,
    color: colors.color,
    '& .MuiChip-label': {
      padding: '0 6px',
    },
  };
});

export const WelcomeMessage = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: '2rem',
    color: colors.textMuted,
    gap: '1rem',
  };
});

export const WelcomeTitle = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const WelcomeSubtitle = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    color: colors.textSecondary,
    maxWidth: '400px',
    lineHeight: 1.6,
  };
});

export const ExamplePrompts = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  marginTop: '1rem',
});

export const ExamplePrompt = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8rem',
    textTransform: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    backgroundColor: colors.backgroundTertiary,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    justifyContent: 'flex-start',
    textAlign: 'left',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      borderColor: colors.primary,
      color: colors.primary,
    },
  };
});

export const LoadingDots = styled(Box)({
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
  padding: '0.5rem 0',
  '& span': {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'currentColor',
    animation: 'bounce 1.4s infinite ease-in-out both',
    '&:nth-of-type(1)': {
      animationDelay: '-0.32s',
    },
    '&:nth-of-type(2)': {
      animationDelay: '-0.16s',
    },
  },
  '@keyframes bounce': {
    '0%, 80%, 100%': {
      transform: 'scale(0)',
    },
    '40%': {
      transform: 'scale(1)',
    },
  },
});
