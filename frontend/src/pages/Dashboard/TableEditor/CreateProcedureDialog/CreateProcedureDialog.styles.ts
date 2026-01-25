import { styled } from '@mui/material/styles';
import { Box, IconButton, Select } from '@mui/material';
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

export const ParametersSection = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    marginTop: '0.5rem',
    marginBottom: '1rem',
  };
});

export const ParameterRow = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
    '& .MuiTextField-root': {
      flex: 1,
    },
  };
});

export const ModeSelect = styled(Select)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    minWidth: '90px',
    height: '40px',
    fontSize: '0.875rem',
    backgroundColor: colors.backgroundCard,
    '& .MuiSelect-select': {
      padding: '0.5rem 0.75rem',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.border,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
    },
  };
});

export const AddParameterButton = styled('button')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
    border: `1px dashed ${colors.border}`,
    borderRadius: '0.5rem',
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    width: '100%',
    justifyContent: 'center',
    '&:hover': {
      borderColor: colors.primary,
      color: colors.primary,
      backgroundColor: `${colors.primary}08`,
    },
  };
});

export const RemoveButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.375rem',
    color: colors.textMuted,
    '&:hover': {
      color: colors.error,
      backgroundColor: `${colors.error}15`,
    },
  };
});

export const LanguageToggle = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    '& .MuiToggleButtonGroup-root': {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: '0.5rem',
    },
    '& .MuiToggleButton-root': {
      padding: '0.375rem 0.75rem',
      fontSize: '0.75rem',
      fontWeight: 500,
      border: 'none',
      color: colors.textSecondary,
      '&.Mui-selected': {
        backgroundColor: colors.primary,
        color: '#fff',
        '&:hover': {
          backgroundColor: colors.primary,
          filter: 'brightness(0.9)',
        },
      },
    },
  };
});
