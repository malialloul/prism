import { styled } from '@mui/material/styles';
import { Box, Button, TextField } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const EditorWrapper = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.backgroundCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };
});

export const EditorHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.75rem 1.25rem',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  };
});

export const EditorTitle = styled('h3')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const EditorActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const RunButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.success,
    color: 'white',
    padding: '0.375rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '0.375rem',
    '&:hover': {
      backgroundColor: colors.success,
      filter: 'brightness(1.1)',
    },
    '&:disabled': {
      backgroundColor: colors.backgroundTertiary,
      color: colors.textMuted,
    },
  };
});

export const SaveButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    padding: '0.375rem 0.75rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '0.375rem',
    border: `1px solid ${colors.border}`,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.text,
    },
  };
});

export const EditorContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
});

export const SqlEditorArea = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: '0 0 auto',
    padding: '0.75rem',
    borderBottom: `1px solid ${colors.border}`,
    minHeight: '150px',
    maxHeight: '300px',
  };
});

export const SqlTextarea = styled('textarea')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '100%',
    height: '100%',
    minHeight: '130px',
    resize: 'vertical',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    backgroundColor: colors.backgroundTertiary,
    color: colors.text,
    fontSize: '0.875rem',
    fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
    lineHeight: 1.6,
    padding: '0.75rem',
    outline: 'none',
    '&:focus': {
      borderColor: colors.primary,
      boxShadow: `0 0 0 2px ${colors.primaryLight}`,
    },
    '&::placeholder': {
      color: colors.textMuted,
    },
  };
});

export const ResultsArea = styled(Box)({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const ResultsHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.5rem 1rem',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
  };
});

export const ResultsTitle = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: colors.textSecondary,
  };
});

export const ResultsMeta = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textMuted,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };
});

export const ResultsContent = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'auto',
});

export const ResultsTable = styled('table')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8125rem',
    fontFamily: 'monospace',
    '& th': {
      textAlign: 'left',
      padding: '0.625rem 0.75rem',
      backgroundColor: colors.backgroundTertiary,
      color: colors.textSecondary,
      fontWeight: 500,
      fontSize: '0.75rem',
      borderBottom: `1px solid ${colors.border}`,
      position: 'sticky',
      top: 0,
      whiteSpace: 'nowrap',
    },
    '& td': {
      padding: '0.5rem 0.75rem',
      borderBottom: `1px solid ${colors.border}`,
      color: colors.text,
      maxWidth: '250px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '& tr:hover td': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const NullValue = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    color: colors.textMuted,
    fontStyle: 'italic',
  };
});

export const ErrorMessage = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem',
    backgroundColor: colors.errorLight,
    color: colors.error,
    borderRadius: '0.5rem',
    margin: '1rem',
    fontSize: '0.8125rem',
    fontFamily: 'monospace',
  };
});

export const SuccessMessage = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem',
    backgroundColor: colors.successLight,
    color: colors.success,
    borderRadius: '0.5rem',
    margin: '1rem',
    fontSize: '0.8125rem',
  };
});

export const EmptyResults = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: colors.textMuted,
    textAlign: 'center',
    '& svg': {
      fontSize: '2.5rem',
      marginBottom: '0.75rem',
      opacity: 0.5,
    },
  };
});

// Saved queries sidebar
export const SavedQueriesPanel = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '240px',
    borderRight: `1px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };
});

export const SavedQueriesHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.75rem 1rem',
    borderBottom: `1px solid ${colors.border}`,
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };
});

export const SavedQueriesList = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '0.5rem',
});

export const SavedQueryItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: selected ? colors.primaryLight : 'transparent',
    '&:hover': {
      backgroundColor: selected ? colors.primaryLight : colors.backgroundHover,
    },
  };
});

export const SavedQueryName = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
});

// Save query dialog
export const SaveQueryDialog = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1.5rem',
  };
});

export const SaveQueryInput = styled(TextField)(({ theme }) => {
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
        borderColor: colors.primary,
      },
    },
    '& .MuiInputLabel-root': {
      color: colors.textSecondary,
    },
    '& .MuiInputBase-input': {
      color: colors.text,
    },
  };
});

export const ExportButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '0.25rem',
    minWidth: 'auto',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.text,
    },
  };
});
