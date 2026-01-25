import { styled } from '@mui/material/styles';
import { DialogTitle as MuiDialogTitle } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

export const DialogTitle = styled(MuiDialogTitle)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    color: colors.text,
  };
});
