import { styled } from '@mui/material/styles';
import { Box, Select, MenuItem, IconButton } from '@mui/material';
import { dashboardColors as colors } from '../../../styles/theme';

export const SelectorWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.75rem 1.5rem',
  gap: '1rem',
});

export const LeftSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
});

export const Logo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
});

export const LogoIcon = styled(Box)({
  width: '2rem',
  height: '2rem',
  borderRadius: '0.5rem',
  background: colors.gradientPrimary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1rem',
  fontWeight: 700,
});

export const LogoText = styled('span')({
  fontSize: '1.25rem',
  fontWeight: 700,
  color: colors.text,
  letterSpacing: '-0.025em',
});

export const DatabaseDropdown = styled(Select)({
  minWidth: '280px',
  backgroundColor: colors.backgroundTertiary,
  borderRadius: '0.5rem',
  '& .MuiSelect-select': {
    padding: '0.625rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.border,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.borderLight,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary,
    borderWidth: '1px',
  },
  '& .MuiSelect-icon': {
    color: colors.textSecondary,
  },
});

export const DatabaseMenuItem = styled(MenuItem)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  '&:hover': {
    backgroundColor: colors.backgroundHover,
  },
  '&.Mui-selected': {
    backgroundColor: colors.primaryLight,
    '&:hover': {
      backgroundColor: colors.primaryLight,
    },
  },
});

export const DatabaseInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
});

export const DatabaseName = styled('span')({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: colors.text,
});

export const DatabaseMeta = styled('span')({
  fontSize: '0.75rem',
  color: colors.textMuted,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const EngineBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'engine',
})<{ engine: 'postgres' | 'mysql' }>(({ engine }) => ({
  padding: '0.125rem 0.5rem',
  borderRadius: '0.25rem',
  fontSize: '0.625rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  backgroundColor: engine === 'postgres' ? colors.postgresLight : colors.mysqlLight,
  color: engine === 'postgres' ? colors.postgres : colors.mysql,
}));

export const StatusDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: 'connected' | 'disconnected' | 'provisioning' }>(({ status }) => ({
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: '50%',
  backgroundColor: status === 'connected' 
    ? colors.success 
    : status === 'provisioning' 
      ? colors.warning 
      : colors.error,
  ...(status === 'provisioning' && {
    animation: 'pulse 2s ease-in-out infinite',
  }),
}));

export const RightSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const ActionButton = styled(IconButton)({
  color: colors.textSecondary,
  padding: '0.5rem',
  borderRadius: '0.5rem',
  '&:hover': {
    backgroundColor: colors.backgroundHover,
    color: colors.text,
  },
});

export const AddDatabaseButton = styled(IconButton)({
  backgroundColor: colors.primaryLight,
  color: colors.primary,
  padding: '0.5rem',
  borderRadius: '0.5rem',
  '&:hover': {
    backgroundColor: colors.primary,
    color: 'white',
  },
});

export const AllDatabasesOption = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const AllDatabasesIcon = styled(Box)({
  width: '2rem',
  height: '2rem',
  borderRadius: '0.5rem',
  backgroundColor: colors.backgroundHover,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.textSecondary,
  fontSize: '1rem',
});

export const UserAvatar = styled(Box)({
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  background: colors.gradientPrimary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 0 0 3px ${colors.primaryLight}`,
  },
});
