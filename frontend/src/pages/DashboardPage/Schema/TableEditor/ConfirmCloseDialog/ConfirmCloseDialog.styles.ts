import { styled } from '@mui/material/styles';
import { DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent, Button } from '@mui/material';
import { getDashboardColors } from '../../../../../styles/theme';

export const DialogTitle = styled(MuiDialogTitle)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    color: colors.text,
  };
});

export const DialogContent = styled(MuiDialogContent)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    color: colors.text,
  };
});

export const DeleteButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.error,
    color: 'white',
    padding: '0.5rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '0.5rem',
    '&:hover': {
      backgroundColor: colors.error,
      filter: 'brightness(1.1)',
    },
  };
});
