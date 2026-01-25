import { styled } from '@mui/material/styles';
import { Dialog } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

export const CreateTableDialogStyled = styled(Dialog)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.backgroundCard,
      borderRadius: '0.75rem',
      maxWidth: '800px',
      width: '100%',
    },
  };
});
