import { styled } from '@mui/material/styles';
import { Box, Tabs, Tab } from '@mui/material';
import { getWorkspaceColors } from '../../styles/theme';

export const ApisPageWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  gap: '1rem',
});

export const ApisHeader = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 0.5rem',
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '1rem',
  };
});

export const ApisTitle = styled('h2')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  };
});

export const ApisTabs = styled(Tabs)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    minHeight: 'auto',
    '& .MuiTabs-indicator': {
      backgroundColor: colors.primary,
      height: '2px',
    },
  };
});

export const ApisTab = styled(Tab)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    minHeight: 'auto',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.textMuted,
    textTransform: 'none',
    '&.Mui-selected': {
      color: colors.primary,
    },
    '& .MuiTab-iconWrapper': {
      marginRight: '0.25rem',
    },
  };
});
