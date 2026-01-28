import { styled } from '@mui/material/styles';
import { DialogContent as MuiDialogContent } from '@mui/material';

export const DialogContent = styled(MuiDialogContent)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  padding: '1.5rem',
}));
