import { styled } from '@mui/material/styles';
import { Box, Tabs, Tab } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const ContentHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
});

export const ContentTitle = styled('h1')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  };
});

export const StyledTabs = styled(Tabs)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    minHeight: 'auto',
    '& .MuiTabs-indicator': {
      backgroundColor: colors.primary,
      height: '2px',
    },
  };
});

export const StyledTab = styled(Tab)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
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
  };
});

export const DashboardGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: '1.5rem',
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: '1fr 1fr',
  },
}));

export const QuickActionsBar = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const QuickActionButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: 'primary' | 'secondary' }>(({ theme, variant = 'secondary' }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.15s ease',
    ...(variant === 'primary' ? {
      backgroundColor: colors.primary,
      color: 'white',
      '&:hover': {
        backgroundColor: colors.primaryHover,
      },
    } : {
      backgroundColor: colors.backgroundTertiary,
      color: colors.textSecondary,
      border: `1px solid ${colors.border}`,
      '&:hover': {
        backgroundColor: colors.backgroundHover,
        color: colors.text,
      },
    }),
  };
});

export const TabPanel = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  gap: '1.5rem',
});

export const TabsContainer = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: '1rem',
  };
});
