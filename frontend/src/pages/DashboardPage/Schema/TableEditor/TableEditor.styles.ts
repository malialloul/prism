import { styled } from '@mui/material/styles';
import { Box, Dialog, IconButton, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

export const TableEditorDialog = styled(Dialog)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.backgroundCard,
      borderRadius: '1rem',
      maxWidth: '95vw',
      width: '1600px',
      maxHeight: '92vh',
      margin: '1rem',
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
        : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
  };
});

export const DialogHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1.5rem 2rem',
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${colors.backgroundCard} 0%, ${colors.backgroundTertiary} 100%)`
      : `linear-gradient(135deg, ${colors.backgroundCard} 0%, ${colors.backgroundSecondary} 100%)`,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
});

export const HeaderContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

export const TableIcon = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    boxShadow: `0 4px 12px ${colors.primary}40`,
    '& svg': {
      fontSize: '1.5rem',
    },
  };
});

export const HeaderInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
});

export const DialogTitle = styled('h2')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '1.375rem',
    fontWeight: 700,
    color: colors.text,
    letterSpacing: '-0.01em',
  };
});

export const DialogSubtitle = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.875rem',
    color: colors.textSecondary,
  };
});

export const StatBadge = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.625rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
  };
});

export const WarningBadge = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.625rem',
    backgroundColor: colors.warningLight,
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.warning,
    border: `1px solid ${colors.warning}40`,
  };
});

export const CloseButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    color: colors.textSecondary,
    backgroundColor: colors.backgroundTertiary,
    border: `1px solid ${colors.border}`,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.text,
    },
  };
});

export const DialogFooter = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem 2rem',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: colors.backgroundSecondary,
  };
});

export const StyledTabs = styled(MuiTabs)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0 2rem',
    backgroundColor: colors.backgroundSecondary,
    borderBottom: `1px solid ${colors.border}`,
    minHeight: '56px',
    '& .MuiTabs-indicator': {
      height: '3px',
      borderRadius: '3px 3px 0 0',
      backgroundColor: colors.primary,
    },
  };
});

export const StyledTab = styled(MuiTab)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    minHeight: '56px',
    textTransform: 'none',
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: colors.textSecondary,
    gap: '0.5rem',
    padding: '0 1.25rem',
    transition: 'all 0.15s ease',
    '&:hover': {
      color: colors.text,
      backgroundColor: colors.backgroundHover,
    },
    '&.Mui-selected': {
      color: colors.primary,
      fontWeight: 600,
    },
    '& .MuiTab-iconWrapper': {
      fontSize: '1.125rem',
    },
  };
});
