import { styled } from '@mui/material/styles';
import { Box, TextField, Select } from '@mui/material';
import { getDashboardColors } from '../../../../../styles/theme';

export const DataTabContent = styled(Box)(() => {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: '1rem 1.5rem',
    minHeight: '400px',
    maxHeight: '60vh',
  };
});

export const DataToolbar = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    flexWrap: 'wrap',
  };
});

export const ToolbarLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  flexWrap: 'wrap',
});

export const ToolbarRight = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const SearchContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const SearchInput = styled(TextField)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiInputBase-root': {
      height: '32px',
      fontSize: '0.8125rem',
      backgroundColor: colors.backgroundCard,
    },
    '& .MuiInputBase-input': {
      padding: '0.375rem 0.75rem',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.border,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.borderLight,
    },
    minWidth: '200px',
  };
});

export const SortContainer = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: colors.textSecondary,
  };
});

export const SortSelect = styled(Select)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    minWidth: '120px',
    height: '32px',
    fontSize: '0.8125rem',
    backgroundColor: colors.backgroundCard,
    '& .MuiSelect-select': {
      padding: '0.375rem 0.75rem',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.border,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.borderLight,
    },
  };
});

export const ActionBar = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: '0.375rem',
    border: `1px solid ${colors.border}`,
  };
});

export const ActionBarInfo = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: colors.textSecondary,
  };
});

export const TableContainer = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    overflow: 'auto',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    backgroundColor: colors.backgroundCard,
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
      zIndex: 2,
    },
    '& th': {
      padding: '0.75rem',
      textAlign: 'left',
      fontWeight: 600,
      color: colors.text,
      borderBottom: `2px solid ${colors.border}`,
      whiteSpace: 'nowrap',
      backgroundColor: colors.backgroundTertiary,
      position: 'relative',
      userSelect: 'none',
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

export const SortableHeader = styled('div')<{ sortable?: boolean; sorted?: boolean }>(({ theme, sortable, sorted }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    cursor: sortable ? 'pointer' : 'default',
    color: sorted ? colors.primary : colors.text,
    '&:hover': sortable ? {
      color: colors.primary,
    } : {},
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '1rem',
    padding: '1rem 1.5rem',
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${colors.backgroundTertiary} 0%, ${colors.backgroundCard} 100%)`
      : `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${colors.backgroundCard} 100%)`,
    borderRadius: '0.75rem',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  };
});

export const PaginationInfo = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.875rem',
    color: colors.textSecondary,
    '& strong': {
      color: colors.text,
      fontWeight: 600,
    },
  };
});

export const PaginationButtons = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    '& .MuiIconButton-root': {
      backgroundColor: colors.backgroundCard,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.5rem',
      padding: '0.5rem',
      transition: 'all 0.15s ease',
      '&:hover:not(:disabled)': {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        color: '#fff',
      },
      '&:disabled': {
        opacity: 0.4,
      },
    },
  };
});

export const PageSizeSelect = styled(Select)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    minWidth: '100px',
    height: '36px',
    fontSize: '0.875rem',
    fontWeight: 500,
    backgroundColor: colors.backgroundCard,
    borderRadius: '0.5rem',
    '& .MuiSelect-select': {
      padding: '0.5rem 1rem',
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.border,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
      borderWidth: '2px',
    },
  };
});

export const PageInfo = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0.75rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
    '& span': {
      color: colors.textSecondary,
      fontWeight: 400,
    },
  };
});
