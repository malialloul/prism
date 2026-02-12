import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getWorkspaceColors } from '../../styles/theme';

export const PaginationContainer = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
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
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
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
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
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

export const pageSizeSelectStyles = (isDark: boolean) => {
  const colors = getWorkspaceColors(isDark);
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
};

export const PageInfo = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
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

export const PageSizeContainer = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.875rem',
    color: colors.textSecondary,
  };
});
