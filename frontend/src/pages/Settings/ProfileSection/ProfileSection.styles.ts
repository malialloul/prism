import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const ProfileContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
});

export const AvatarWrapper = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    fontWeight: 600,
    color: 'white',
    flexShrink: 0,
  };
});

export const ProfileInfo = styled(Box)({
  flex: 1,
});

export const UserName = styled('h3')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text,
    margin: '0 0 0.25rem 0',
  };
});

export const UserEmail = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    color: colors.textSecondary,
    margin: '0 0 0.5rem 0',
  };
});

export const MemberSince = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textTertiary,
    margin: 0,
  };
});

export const EditButton = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: colors.primary,
    backgroundColor: `${colors.primary}15`,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: `${colors.primary}25`,
    },
  };
});
