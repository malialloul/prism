import { useState } from 'react';
import { ButtonLoadingSkeleton } from '../../../components';
import { useDisconnectDatabase, useReconnectDatabase } from '../../../api/entities/databases';
import {
  StyledDialog,
  DialogHeader,
  DialogTitle,
  DialogSubtitle,
  DialogContent,
  InfoBox,
  InfoIcon,
  InfoText,
  DatabasesContainer,
  DatabaseCard,
  DatabaseLabel,
  DatabaseName,
  DatabaseMeta,
  ArrowContainer,
  DialogFooter,
  CancelButton,
  SwitchButton,
} from './SwitchDatabaseDialog.styles';
import type { DatabaseDto } from '../../../api/models/DatabaseDto';

// Icons
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface SwitchDatabaseDialogProps {
  open: boolean;
  currentDatabase: DatabaseDto | null;
  targetDatabase: DatabaseDto | null;
  onClose: () => void;
  onSwitched: (newDatabaseId: number) => void;
}

export default function SwitchDatabaseDialog({
  open,
  currentDatabase,
  targetDatabase,
  onClose,
  onSwitched,
}: SwitchDatabaseDialogProps) {
  const [isSwitching, setIsSwitching] = useState(false);

  const { mutate: disconnectDatabase } = useDisconnectDatabase({
    onSuccess: () => {
      // After disconnect, connect to the new database
      if (targetDatabase) {
        reconnectDatabase(targetDatabase.id);
      }
    },
    onError: () => {
      setIsSwitching(false);
    },
  });

  const { mutate: reconnectDatabase } = useReconnectDatabase({
    onSuccess: () => {
      if (targetDatabase) {
        onSwitched(targetDatabase.id);
      }
      onClose();
      setIsSwitching(false);
    },
    onError: () => {
      setIsSwitching(false);
    },
  });

  const handleSwitch = () => {
    if (!currentDatabase || !targetDatabase) return;
    setIsSwitching(true);
    disconnectDatabase(currentDatabase.id);
  };

  if (!currentDatabase || !targetDatabase) return null;

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Switch Database Connection</DialogTitle>
        <DialogSubtitle>You have an active database connection</DialogSubtitle>
      </DialogHeader>
      <DialogContent>
        <InfoBox>
          <InfoIcon>
            <InfoOutlinedIcon />
          </InfoIcon>
          <InfoText>
            You can only be connected to one database at a time. Switching will
            disconnect you from the current database and connect to the new one.
          </InfoText>
        </InfoBox>

        <DatabasesContainer>
          <DatabaseCard variant="from">
            <DatabaseLabel variant="from">Disconnect from</DatabaseLabel>
            <DatabaseName>{currentDatabase.name}</DatabaseName>
            <DatabaseMeta>
              {currentDatabase.engine === 'postgres' ? 'PostgreSQL' : 'MySQL'} • {currentDatabase.host} • {currentDatabase.tables} tables
            </DatabaseMeta>
          </DatabaseCard>

          <ArrowContainer>
            <ArrowDownwardIcon />
          </ArrowContainer>

          <DatabaseCard variant="to">
            <DatabaseLabel variant="to">Connect to</DatabaseLabel>
            <DatabaseName>{targetDatabase.name}</DatabaseName>
            <DatabaseMeta>
              {targetDatabase.engine === 'postgres' ? 'PostgreSQL' : 'MySQL'} • {targetDatabase.host} • {targetDatabase.tables} tables
            </DatabaseMeta>
          </DatabaseCard>
        </DatabasesContainer>
      </DialogContent>
      <DialogFooter>
        <CancelButton onClick={onClose} disabled={isSwitching}>
          Cancel
        </CancelButton>
        <SwitchButton onClick={handleSwitch} disabled={isSwitching}>
          {isSwitching ? <ButtonLoadingSkeleton size="small" /> : 'Switch Connection'}
        </SwitchButton>
      </DialogFooter>
    </StyledDialog>
  );
}
