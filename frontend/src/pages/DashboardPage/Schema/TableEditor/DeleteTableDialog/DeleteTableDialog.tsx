import { useState } from 'react';
import { ButtonLoadingSkeleton, usePermissions, AccessRestricted } from '../../../../../components';
import WarningIcon from '@mui/icons-material/Warning';
import {
  StyledDialog,
  DialogHeader,
  DialogTitle,
  DialogSubtitle,
  DialogContent,
  DialogFooter,
  FormGroup,
  FormLabel,
  StyledTextField,
  CancelButton,
  DeleteButton,
  WarningBox,
} from './DeleteTableDialog.styles';
import { useDropTable } from '../../../../../api/entities/schema';

interface DeleteTableDialogProps {
  open: boolean;
  onClose: () => void;
  databaseId: number;
  tableName: string;
  onSuccess?: () => void;
}

export default function DeleteTableDialog({
  open,
  onClose,
  databaseId,
  tableName,
  onSuccess,
}: DeleteTableDialogProps) {
  const { canDeleteTable } = usePermissions();
  const [confirmName, setConfirmName] = useState('');

  const { mutate: dropTable, isPending } = useDropTable(databaseId, {
    onSuccess: () => {
      onClose();
      setConfirmName('');
      onSuccess?.();
    },
  });

  const handleSubmit = () => {
    if (confirmName !== tableName) return;
    dropTable(tableName);
  };

  const handleClose = () => {
    onClose();
    setConfirmName('');
  };

  const isValid = confirmName === tableName;

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {canDeleteTable ? (
        <>
          <DialogHeader>
            <DialogTitle>Delete Table</DialogTitle>
            <DialogSubtitle>This action cannot be undone</DialogSubtitle>
          </DialogHeader>

          <DialogContent>
            <WarningBox>
              <WarningIcon />
              <p>
                You are about to permanently delete the table <strong>"{tableName}"</strong> and all its data.
                This action is irreversible and cannot be undone.
              </p>
            </WarningBox>

            <FormGroup>
              <FormLabel>
                Type <strong>{tableName}</strong> to confirm deletion
              </FormLabel>
              <StyledTextField
                fullWidth
                placeholder={tableName}
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                autoFocus
                error={confirmName.length > 0 && confirmName !== tableName}
                helperText={confirmName.length > 0 && confirmName !== tableName ? 'Table name does not match' : ''}
              />
            </FormGroup>
          </DialogContent>

          <DialogFooter>
            <CancelButton onClick={handleClose}>Cancel</CancelButton>
            <DeleteButton onClick={handleSubmit} disabled={!isValid || isPending}>
              {isPending ? <ButtonLoadingSkeleton size="small" /> : 'Delete Table'}
            </DeleteButton>
          </DialogFooter>
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle>Delete Table</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <AccessRestricted
              message="Delete Table Restricted"
              description="You don't have permission to delete tables. Please contact the account owner to request access."
              permission="deleteTable"
            />
          </DialogContent>
          <DialogFooter>
            <CancelButton onClick={handleClose}>Close</CancelButton>
          </DialogFooter>
        </>
      )}
    </StyledDialog>
  );
}
