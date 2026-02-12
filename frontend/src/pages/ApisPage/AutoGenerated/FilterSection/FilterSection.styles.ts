import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getWorkspaceColors } from '../../../../styles/theme';

export const TryItSection = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem',
    borderBottom: `1px solid ${colors.border}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  };
});

export const SectionTitle = styled('h4')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 0.75rem 0',
  };
});

export const ParameterInput = styled('input')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    padding: '0.5rem 0.75rem',
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    color: colors.text,
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary,
    },
    '&::placeholder': {
      color: colors.textMuted,
    },
  };
});

export const AddFilterButton = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    color: colors.primary,
    cursor: 'pointer',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});
