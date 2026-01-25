import { Dialog, DialogActions, Button } from '@mui/material';
import { DeleteButton } from '../shared.styles';
import { DialogTitle, DialogContent } from './DeleteColumnDialog.styles';

interface DeleteColumnDialogProps {
  open: boolean;
  onClose: () => void;
  columnName: string | undefined;
  onConfirm: () => void;
  isDropping: boolean;
}

export default function DeleteColumnDialog({
  open,
  onClose,
  columnName,
  onConfirm,
  isDropping,
}: DeleteColumnDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Column</DialogTitle>
      <DialogContent>
        <p>
          Are you sure you want to delete the column <strong>{columnName}</strong>?
        </p>
        <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>
          This action cannot be undone. All data in this column will be permanently deleted.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <DeleteButton onClick={onConfirm} disabled={isDropping}>
          {isDropping ? 'Deleting...' : 'Delete Column'}
        </DeleteButton>
      </DialogActions>
    </Dialog>
  );
}
