import { styled } from '@mui/material/styles';
import { Box, Button, Dialog } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

export const StyledDialog = styled(Dialog)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.backgroundCard,
      borderRadius: '1rem',
      border: `1px solid ${colors.border}`,
      padding: '0',
      minWidth: '440px',
      maxWidth: '500px',
    },
  };
});

export const DialogHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.border}`,
  };
});

export const DialogTitle = styled('h2')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const DialogSubtitle = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: '0.5rem 0 0 0',
    fontSize: '0.875rem',
    color: colors.textSecondary,
  };
});

export const DialogContent = styled(Box)({
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
});

export const WarningBox = styled(Box)({
  display: 'flex',
  gap: '0.75rem',
  padding: '1rem',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '0.5rem',
});

export const WarningIcon = styled(Box)({
  color: '#ef4444',
  display: 'flex',
  alignItems: 'flex-start',
  paddingTop: '2px',
  '& svg': {
    fontSize: '1.25rem',
  },
});

export const WarningText = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '0.875rem',
    color: colors.text,
    lineHeight: 1.5,
  };
});

export const DatabaseInfo = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
  };
});

export const DatabaseName = styled('h4')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const DatabaseMeta = styled('p')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: colors.textSecondary,
  };
});

export const DialogFooter = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem 1.5rem',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  };
});

export const CancelButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.625rem 1.25rem',
    borderRadius: '0.5rem',
    textTransform: 'none',
    fontWeight: 500,
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const DeleteButton = styled(Button)({
  padding: '0.625rem 1.25rem',
  borderRadius: '0.5rem',
  textTransform: 'none',
  fontWeight: 500,
  backgroundColor: '#ef4444',
  color: 'white',
  '&:hover': {
    backgroundColor: '#dc2626',
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(239, 68, 68, 0.5)',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
