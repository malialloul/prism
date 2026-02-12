import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import type { DeleteApiDialogProps } from './types';

export function DeleteApiDialog({
  open,
  apiName,
  onClose,
  onConfirm,
  colors,
}: DeleteApiDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: colors.backgroundCard,
          backgroundImage: 'none',
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Delete API</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: colors.textSecondary }}>
          Are you sure you want to delete the API "{apiName}"? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          sx={{ textTransform: 'none' }}
          onClick={onConfirm}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
