import { Dialog, DialogActions, Button } from '@mui/material';
import { DeleteButton, DialogTitle } from './ConfirmDeleteRowsDialog.styles';

interface ConfirmDeleteRowsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
  hasExistingRows: boolean;
  onConfirm: () => void;
}

export default function ConfirmDeleteRowsDialog({
  open,
  onClose,
  selectedCount,
  hasExistingRows,
  onConfirm,
}: ConfirmDeleteRowsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <div style={{ padding: '0 24px 20px' }}>
        Are you sure you want to delete {selectedCount} row(s)?
        {hasExistingRows && (
          <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>
            This will execute DELETE queries when you save changes.
          </p>
        )}
      </div>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <DeleteButton onClick={onConfirm}>Delete</DeleteButton>
      </DialogActions>
    </Dialog>
  );
}
