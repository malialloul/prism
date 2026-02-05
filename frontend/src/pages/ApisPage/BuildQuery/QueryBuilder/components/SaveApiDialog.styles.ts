import { styled } from '@mui/material/styles';
import { Dialog, Box, TextField, Button } from '@mui/material';

export const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    minWidth: '500px',
    maxWidth: '600px',
  },
});

export const DialogHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const DialogBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

export const DialogFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1.5),
}));

export const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
  },
});

export const SaveButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '8px',
  padding: theme.spacing(1, 3),
}));

export const CancelButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '8px',
  padding: theme.spacing(1, 3),
}));

export const SummaryBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: '8px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));
