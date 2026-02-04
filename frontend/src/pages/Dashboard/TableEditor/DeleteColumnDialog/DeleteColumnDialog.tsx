import { Dialog, DialogActions, Button } from '@mui/material';
import { DeleteButton, CancelButton } from '../shared.styles';
import { DialogTitle, DialogContent } from './DeleteColumnDialog.styles';
import { usePermissions, AccessRestricted } from '../../../../components';

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
  const { canDeleteColumn } = usePermissions();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Column</DialogTitle>
      {canDeleteColumn ? (
        <>
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
        </>
      ) : (
        <>
          <DialogContent>
            <AccessRestricted
              message="Delete Column Restricted"
              description="You don't have permission to delete columns. Please contact the account owner to request access."
              permission="deleteColumn"
            />
          </DialogContent>
          <DialogActions>
            <CancelButton onClick={onClose}>Close</CancelButton>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
