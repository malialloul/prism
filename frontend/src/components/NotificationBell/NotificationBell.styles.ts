import { styled } from '@mui/material/styles';
import { Box, IconButton, Popover } from '@mui/material';
import { getDashboardColors } from '../../styles/theme';

export const BellButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    position: 'relative',
    color: colors.textSecondary,
    '&:hover': {
      color: colors.text,
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const UnreadBadge = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    color: 'white',
    fontSize: '0.6875rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: `2px solid ${colors.backgroundCard}`,
  };
});

export const NotificationPopover = styled(Popover)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiPaper-root': {
      width: 360,
      maxHeight: 480,
      backgroundColor: colors.backgroundCard,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.75rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    },
  };
});

export const NotificationHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: `1px solid ${colors.border}`,
  };
});

export const NotificationTitle = styled('h3')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const MarkAllButton = styled('button')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    background: 'none',
    border: 'none',
    fontSize: '0.8125rem',
    color: colors.primary,
    cursor: 'pointer',
    fontWeight: 500,
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    '&:hover': {
      backgroundColor: colors.primaryLight,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'default',
    },
  };
});

export const NotificationList = styled(Box)({
  maxHeight: 360,
  overflowY: 'auto',
});

export const NotificationItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isRead',
})<{ isRead?: boolean }>(({ theme, isRead }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: isRead ? 'transparent' : `${colors.primaryLight}40`,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  };
});

export const NotificationIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'type',
})<{ type: string }>(({ theme, type }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  const typeColors: Record<string, { bg: string; color: string }> = {
    account_shared: { bg: colors.primaryLight, color: colors.primary },
    share_accepted: { bg: colors.successLight, color: colors.success },
    share_revoked: { bg: colors.errorLight, color: colors.error },
    general: { bg: colors.infoLight, color: colors.info },
  };
  const { bg, color } = typeColors[type] || typeColors.general;
  return {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: bg,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
});

export const NotificationContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const NotificationItemTitle = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '0.25rem',
  };
});

export const NotificationMessage = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'block',
    fontSize: '0.8125rem',
    color: colors.textSecondary,
    lineHeight: 1.4,
  };
});

export const NotificationTime = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'block',
    fontSize: '0.75rem',
    color: colors.textMuted,
    marginTop: '0.375rem',
  };
});

export const EmptyNotifications = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1.5rem',
    color: colors.textMuted,
    textAlign: 'center',
    '& svg': {
      fontSize: '3rem',
      opacity: 0.5,
      marginBottom: '0.75rem',
    },
  };
});

export const TempPasswordBox = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    marginTop: '0.625rem',
    padding: '0.625rem 0.75rem',
    backgroundColor: colors.backgroundHover,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    '& .password-label': {
      fontSize: '0.6875rem',
      fontWeight: 500,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
    },
    '& .password-row': {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    '& code': {
      flex: 1,
      fontFamily: '"SF Mono", "Consolas", "Monaco", monospace',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: colors.primary,
      letterSpacing: '0.75px',
      padding: '0.375rem 0.625rem',
      backgroundColor: colors.backgroundCard,
      borderRadius: '0.25rem',
      border: `1px solid ${colors.border}`,
    },
    '& button': {
      padding: '0.375rem',
      color: colors.textSecondary,
      borderRadius: '0.375rem',
      '&:hover': {
        backgroundColor: colors.primaryLight,
        color: colors.primary,
      },
    },
  };
});

export const NotificationActions = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    gap: '0.25rem',
    marginLeft: '0.5rem',
    flexShrink: 0,
    alignItems: 'flex-start',
    '& button': {
      padding: '0.25rem',
      color: colors.textSecondary,
      '&:hover': {
        color: colors.error,
        backgroundColor: colors.errorLight,
      },
    },
  };
});
