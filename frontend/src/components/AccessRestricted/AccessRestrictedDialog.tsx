import { Dialog, DialogContent, DialogActions, Button, DialogTitle } from '@mui/material';
import { AccessRestricted } from './AccessRestricted';
import type { SharePermissions } from '../../api/models/SharedAccountDto';

interface AccessRestrictedDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  description?: string;
  permission?: keyof SharePermissions;
  title?: string;
  showRequestAccess?: boolean;
}

export function AccessRestrictedDialog({
  open,
  onClose,
  message,
  description,
  permission,
  title,
  showRequestAccess = true,
}: AccessRestrictedDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent sx={{ p: 0 }}>
        <AccessRestricted
          message={message}
          description={description}
          permission={permission}
          showRequestAccess={showRequestAccess}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
