import { styled } from '@mui/material/styles';
import { Box, Dialog } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

export const AddColumnDialogStyled = styled(Dialog)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.backgroundCard,
      borderRadius: '0.75rem',
      maxWidth: '600px',
      width: '100%',
    },
  };
});
