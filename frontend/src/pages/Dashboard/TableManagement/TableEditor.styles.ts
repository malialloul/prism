import { styled } from '@mui/material/styles';
import { Box, Button } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const TableEditorWrapper = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.backgroundCard,
  };
});

export const TableEditorHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: `1px solid ${colors.border}`,
  };
});

export const TableEditorTitle = styled('h2')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const TableEditorActions = styled(Box)({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
});

export const TableEditorContent = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    overflow: 'auto',
    padding: '1rem 1.5rem',
    minHeight: '400px',
    maxHeight: '60vh',
  };
});

export const ActionBar = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
  };
});

export const ActionBarInfo = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.8125rem',
    color: colors.textSecondary,
  };
});

export const ActionBarButtons = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    gap: '0.25rem',
    '& .MuiIconButton-root': {
      color: colors.textSecondary,
      '&:hover': {
        color: colors.text,
        backgroundColor: colors.backgroundHover,
      },
      '&.Mui-disabled': {
        color: colors.textMuted,
      },
    },
  };
});

export const EditableTable = styled('table')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8125rem',
    '& thead': {
      position: 'sticky',
      top: 0,
      backgroundColor: colors.backgroundCard,
      zIndex: 1,
    },
    '& th': {
      padding: '0.625rem 0.75rem',
      textAlign: 'left',
      fontWeight: 600,
      color: colors.textSecondary,
      borderBottom: `2px solid ${colors.border}`,
      whiteSpace: 'nowrap',
      backgroundColor: colors.backgroundTertiary,
    },
    '& td': {
      padding: '0.5rem 0.75rem',
      borderBottom: `1px solid ${colors.border}`,
      color: colors.text,
      maxWidth: '300px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '& tbody tr:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const EditableCell = styled('td')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    position: 'relative',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const EditInput = styled('input')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '100%',
    padding: '0.25rem 0.5rem',
    border: `2px solid ${colors.primary}`,
    borderRadius: '0.25rem',
    backgroundColor: colors.backgroundCard,
    color: colors.text,
    fontSize: '0.8125rem',
    outline: 'none',
    boxSizing: 'border-box',
    '&:focus': {
      boxShadow: `0 0 0 2px ${colors.primary}40`,
    },
  };
});

export const RowCheckbox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const NewRowIndicator = styled('span')({
  display: 'inline-block',
  padding: '0.125rem 0.375rem',
  fontSize: '0.625rem',
  fontWeight: 600,
  borderRadius: '0.25rem',
  backgroundColor: 'rgba(34, 197, 94, 0.2)',
  color: '#22c55e',
});

export const ModifiedRowIndicator = styled('span')({
  display: 'inline-block',
  padding: '0.125rem 0.375rem',
  fontSize: '0.625rem',
  fontWeight: 600,
  borderRadius: '0.25rem',
  backgroundColor: 'rgba(245, 158, 11, 0.2)',
  color: '#f59e0b',
});

export const PaginationControls = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
    padding: '0.75rem',
    borderTop: `1px solid ${colors.border}`,
  };
});

export const PageButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.375rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    textTransform: 'none',
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.375rem',
    backgroundColor: 'transparent',
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

export const PageInfo = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.textSecondary,
  };
});
