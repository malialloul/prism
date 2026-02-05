import { Dialog, DialogActions, Button } from '@mui/material';
import { DeleteButton, DialogTitle, DialogContent } from './ConfirmCloseDialog.styles';

interface ConfirmCloseDialogProps {
  open: boolean;
  onClose: () => void;
  pendingChanges: number;
  onDiscard: () => void;
}

export default function ConfirmCloseDialog({
  open,
  onClose,
  pendingChanges,
  onDiscard,
}: ConfirmCloseDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Unsaved Changes</DialogTitle>
      <DialogContent>
        <p>You have {pendingChanges} unsaved change(s). Are you sure you want to close?</p>
        <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>
          All unsaved changes will be lost.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <DeleteButton onClick={onDiscard}>Discard Changes</DeleteButton>
      </DialogActions>
    </Dialog>
  );
}
