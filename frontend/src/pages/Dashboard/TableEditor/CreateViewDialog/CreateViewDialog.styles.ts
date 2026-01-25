import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

export const SqlEditorWrapper = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    overflow: 'hidden',
    backgroundColor: colors.backgroundTertiary,
  };
});

export const SqlTextArea = styled('textarea')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '100%',
    minHeight: '180px',
    padding: '1rem',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: colors.text,
    fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    resize: 'vertical',
    '&::placeholder': {
      color: colors.textMuted,
    },
  };
});

export const PreviewSection = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
  };
});

export const PreviewHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    '& > span': {
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: colors.textSecondary,
    },
  };
});

export const PreviewButton = styled('button')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.375rem',
    backgroundColor: colors.backgroundCard,
    color: colors.text,
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover:not(:disabled)': {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      color: '#fff',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };
});

export const PreviewResult = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.75rem',
    backgroundColor: `${colors.success}15`,
    borderRadius: '0.375rem',
    border: `1px solid ${colors.success}40`,
    '& > span': {
      display: 'block',
      fontSize: '0.8125rem',
      color: colors.success,
      fontWeight: 500,
      marginBottom: '0.5rem',
    },
  };
});

export const PreviewError = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: `${colors.error}15`,
    borderRadius: '0.375rem',
    border: `1px solid ${colors.error}40`,
    fontSize: '0.8125rem',
    color: colors.error,
    '& svg': {
      flexShrink: 0,
      marginTop: '0.125rem',
    },
  };
});

export const PreviewColumns = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.375rem',
});

export const PreviewColumnTag = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    backgroundColor: colors.backgroundCard,
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: colors.text,
    border: `1px solid ${colors.border}`,
  };
});
