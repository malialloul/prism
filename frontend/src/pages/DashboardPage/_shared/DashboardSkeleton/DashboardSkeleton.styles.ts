import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

export const DashboardWrapper = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    minHeight: '100vh',
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column',
  };
});

export const DashboardHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: colors.backgroundSecondary,
    borderBottom: `1px solid ${colors.border}`,
    backdropFilter: 'blur(12px)',
  };
});

export const DashboardBody = styled(Box)({
  display: 'flex',
  flex: 1,
});

export const DashboardContent = styled(Box)({
  flex: 1,
  padding: '1.5rem',
  maxWidth: '1400px',
  width: '100%',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  overflowY: 'auto',
});

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

export const SkeletonWrapper = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: colors.background,
  };
});

export const SkeletonSidebar = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '280px',
    flexShrink: 0,
    borderRight: `1px solid ${colors.border}`,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };
});

export const SkeletonContent = styled(Box)({
  flex: 1,
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const SkeletonCard = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.cardBg,
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    padding: '1.5rem',
  };
});
