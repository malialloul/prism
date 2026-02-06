import { useState } from 'react';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeactivateAccountModal from './DeactivateAccountModal';
import DeleteAccountModal from './DeleteAccountModal';
import {
  DangerContainer,
  DangerItem,
  DangerInfo,
  DangerTitle,
  DangerDescription,
  DangerButton,
  WarningBox,
  WarningIcon,
  WarningText,
} from './DangerZone.styles';

interface DangerZoneProps {
  onDeactivateSuccess: () => void;
  onDeleteSuccess: () => void;
}

const DangerZone = ({ onDeactivateSuccess, onDeleteSuccess }: DangerZoneProps) => {
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <>
      <DangerContainer>
        <WarningBox>
          <WarningIcon>
            <WarningAmberIcon sx={{ fontSize: 18 }} />
          </WarningIcon>
          <WarningText>
            Proceed with caution. These actions can have permanent consequences and may result in loss of data.
          </WarningText>
        </WarningBox>

        <DangerItem>
          <DangerInfo>
            <DangerTitle>Deactivate Account</DangerTitle>
            <DangerDescription>
              Temporarily disable your account. You can reactivate it anytime by logging in.
            </DangerDescription>
          </DangerInfo>
          <DangerButton severity="warning" variant="outlined" onClick={() => setDeactivateModalOpen(true)}>
            <PauseIcon />
            Deactivate
          </DangerButton>
        </DangerItem>

        <DangerItem>
          <DangerInfo>
            <DangerTitle>Delete Account</DangerTitle>
            <DangerDescription>
              Permanently delete your account and all associated data. This cannot be undone.
            </DangerDescription>
          </DangerInfo>
          <DangerButton severity="danger" variant="outlined" onClick={() => setDeleteModalOpen(true)}>
            <DeleteIcon />
            Delete Account
          </DangerButton>
        </DangerItem>
      </DangerContainer>

      <DeactivateAccountModal
        open={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onSuccess={onDeactivateSuccess}
      />

      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={onDeleteSuccess}
      />
    </>
  );
};

export default DangerZone;
