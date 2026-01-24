import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useDeleteDatabase } from '../../../api/entities/databases';
import { toastService } from '../../../services';
import {
  StyledDialog,
  DialogHeader,
  DialogTitle,
  DialogSubtitle,
  DialogContent,
  WarningBox,
  WarningIcon,
  WarningText,
  DatabaseInfo,
  DatabaseName,
  DatabaseMeta,
  DialogFooter,
  CancelButton,
  DeleteButton,
} from './DeleteDatabaseDialog.styles';

// Icons
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { DatabaseDto } from '../../../api/models/DatabaseDto';

interface DeleteDatabaseDialogProps {
  open: boolean;
  database: DatabaseDto | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteDatabaseDialog({
  open,
  database,
  onClose,
  onDeleted,
}: DeleteDatabaseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutate: deleteDatabase } = useDeleteDatabase({
    onSuccess: (response) => {
      toastService.success(response.message);
      setIsDeleting(false);
      onDeleted();
      onClose();
    },
    onError: (error) => {
      toastService.error(error.message);
      setIsDeleting(false);
    },
  });

  // Reset state when dialog opens with a new database
  const handleClose = () => {
    if (!isDeleting) {
      setIsDeleting(false);
      onClose();
    }
  };

  const handleDelete = () => {
    if (!database) return;
    setIsDeleting(true);
    deleteDatabase(database.id);
  };

  if (!database) return null;

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <DialogHeader>
        <DialogTitle>Delete Database Connection</DialogTitle>
        <DialogSubtitle>This action cannot be undone</DialogSubtitle>
      </DialogHeader>
      <DialogContent>
        <WarningBox>
          <WarningIcon>
            <WarningAmberIcon />
          </WarningIcon>
          <WarningText>
            You are about to delete the connection to this database. This will remove
            all associated API endpoints and configurations. The actual database and
            its data will not be affected.
          </WarningText>
        </WarningBox>

        <DatabaseInfo>
          <DatabaseName>{database.name}</DatabaseName>
          <DatabaseMeta>
            {database.engine === 'postgres' ? 'PostgreSQL' : 'MySQL'} • {database.host} • {database.tables} tables
          </DatabaseMeta>
        </DatabaseInfo>
      </DialogContent>
      <DialogFooter>
        <CancelButton onClick={handleClose} disabled={isDeleting}>
          Cancel
        </CancelButton>
        <DeleteButton onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? <CircularProgress size={16} color="inherit" /> : 'Delete Connection'}
        </DeleteButton>
      </DialogFooter>
    </StyledDialog>
  );
}
