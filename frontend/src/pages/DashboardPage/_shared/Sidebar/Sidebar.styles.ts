import { styled } from '@mui/material/styles';
import { Box, IconButton } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';
import { DatabaseDto } from '../../../../api/models/DatabaseDto';

export const SidebarWrapper = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '280px',
    minWidth: '280px',
    height: '100vh',
    backgroundColor: colors.backgroundSecondary,
    borderRight: `1px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
  };
});

export const SidebarHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem 1.25rem',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };
});

export const HeaderTitle = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colors.textMuted,
  };
});

export const AddButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.375rem',
    borderRadius: '0.375rem',
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    '&:hover': {
      backgroundColor: colors.primary,
      color: 'white',
    },
  };
});

export const DatabaseList = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '0.5rem',
});

export const DatabaseItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    backgroundColor: selected ? colors.primaryLight : 'transparent',
    border: `1px solid ${selected ? colors.primary : 'transparent'}`,
    '&:hover': {
      backgroundColor: selected ? colors.primaryLight : colors.backgroundHover,
    },
  };
});

export const DatabaseIconBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'engine',
})<{ engine: 'postgres' | 'mysql' }>(({ theme, engine }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    position: 'relative',
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 700,
    backgroundColor: engine === 'postgres' ? colors.postgresLight : colors.mysqlLight,
    color: engine === 'postgres' ? colors.postgres : colors.mysql,
    flexShrink: 0,
  };
});

export const DatabaseInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const DatabaseName = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
});

export const DatabaseMeta = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: colors.textMuted,
  };
});

export const StatusDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: DatabaseDto['status'] }>(({ theme, status }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '50%',
    backgroundColor: status === 'connected' 
      ? colors.success 
        : colors.textMuted,
  };
});

export const ConnectionButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isConnected',
})<{ isConnected?: boolean }>(({ theme, isConnected }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.375rem',
    borderRadius: '0.375rem',
    color: isConnected ? colors.error : colors.success,
    opacity: 0,
    transition: 'opacity 0.15s ease',
    '.MuiBox-root:hover &': {
      opacity: 1,
    },
    '&:hover': {
      backgroundColor: isConnected ? colors.errorLight : colors.successLight,
    },
  };
});

export const DeleteButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.375rem',
    borderRadius: '0.375rem',
    color: colors.error,
    opacity: 0,
    transition: 'opacity 0.15s ease',
    '.MuiBox-root:hover &': {
      opacity: 1,
    },
    '&:hover': {
      backgroundColor: colors.errorLight,
    },
  };
});

export const InfoButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.375rem',
    borderRadius: '0.375rem',
    color: colors.primary,
    opacity: 0,
    transition: 'opacity 0.15s ease',
    '.MuiBox-root:hover &': {
      opacity: 1,
    },
    '&:hover': {
      backgroundColor: colors.primaryLight,
    },
  };
});

export const AllDatabasesItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    backgroundColor: selected ? colors.primaryLight : 'transparent',
    border: `1px solid ${selected ? colors.primary : 'transparent'}`,
    marginBottom: '0.5rem',
    '&:hover': {
      backgroundColor: selected ? colors.primaryLight : colors.backgroundHover,
    },
  };
});

export const AllDatabasesIcon = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundTertiary,
    color: colors.textSecondary,
  };
});

export const SidebarFooter = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };
});

export const FooterButton = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.75rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    color: colors.textSecondary,
    fontSize: '0.875rem',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.text,
    },
  };
});

export const HostedBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isHosted',
})<{ isHosted?: boolean }>(({ theme, isHosted }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '0.875rem',
    height: '0.875rem',
    borderRadius: '50%',
    backgroundColor: colors.backgroundSecondary,
    color: isHosted ? colors.primary : colors.textMuted,
    border: `1px solid ${colors.border}`,
  };
});
