import { useState } from 'react';
import { ButtonLoadingSkeleton } from '../../../../components';
import WarningIcon from '@mui/icons-material/Warning';
import { useDropTable } from '../../../../api/entities/schema';
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
} from '../shared.styles';

interface DeleteTableDialogProps {
  open: boolean;
  onClose: () => void;
  databaseId: string;
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
    </StyledDialog>
  );
}
