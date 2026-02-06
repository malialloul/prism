import { useState } from 'react';
import { Tooltip } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import {
  SidebarWrapper,
  SidebarHeader,
  HeaderTitle,
  AddButton,
  DatabaseList,
  DatabaseItem,
  DatabaseIconBox,
  DatabaseInfo,
  DatabaseName,
  DatabaseMeta,
  StatusDot,
  ConnectionButton,
  DeleteButton,
  InfoButton,
  HostedBadge,
} from './Sidebar.styles';
import DatabaseDetailsDialog from '../DatabaseDetailsDialog';

// Icons
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DatabaseDto } from '../../../../api/models/DatabaseDto';

interface SidebarProps {
  databases: DatabaseDto[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onDisconnect: (id: number) => void;
  onDelete: (id: number) => void;
  onAddDatabase: () => void;
}

export default function Sidebar({
  databases,
  selectedId,
  onSelect,
  onDisconnect,
  onDelete,
  onAddDatabase,
}: SidebarProps) {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseDto | null>(null);

  const handleShowDetails = (e: React.MouseEvent, db: DatabaseDto) => {
    e.stopPropagation();
    setSelectedDatabase(db);
    setDetailsDialogOpen(true);
  };

  const handleConnectionToggle = (e: React.MouseEvent, db: DatabaseDto) => {
    e.stopPropagation();
    if (db.status === 'connected') {
      onDisconnect(db.id);
    } else {
      onSelect(db.id);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <SidebarWrapper>
      <SidebarHeader>
        <HeaderTitle>Databases</HeaderTitle>
        <Tooltip title="Add Database" arrow>
          <AddButton
            onClick={() => onAddDatabase()}
            size="small"
          >
            <AddIcon sx={{ fontSize: '1rem' }} />
          </AddButton>
        </Tooltip>
      </SidebarHeader>

      <DatabaseList>
        {databases.map((db) => (
          <DatabaseItem
            key={db.id}
            selected={selectedId === db.id && db.status === 'connected'}
            onClick={() => onSelect(db.id)}
          >
            <Tooltip title={db.isHosted ? 'Hosted (created in Prism)' : 'External (connected server)'} arrow>
              <DatabaseIconBox engine={db.engine}>
                {db.engine === 'postgres' ? 'P' : 'M'}
                <HostedBadge isHosted={db.isHosted}>
                  {db.isHosted ? <CloudIcon sx={{ fontSize: '0.625rem' }} /> : <StorageIcon sx={{ fontSize: '0.625rem' }} />}
                </HostedBadge>
              </DatabaseIconBox>
            </Tooltip>
            <DatabaseInfo>
              <DatabaseName>{db.name}</DatabaseName>
              <DatabaseMeta>
                <StatusDot status={db.status} />
                {db.status}
              </DatabaseMeta>
            </DatabaseInfo>
            <Tooltip title="Details">
              <InfoButton
                size="small"
                onClick={(e) => handleShowDetails(e, db)}
              >
                <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
              </InfoButton>
            </Tooltip>
            <Tooltip title={db.status === 'connected' ? 'Disconnect' : 'Connect'}>
              <ConnectionButton
                size="small"
                isConnected={db.status === 'connected'}
                onClick={(e) => handleConnectionToggle(e, db)}
              >
                {db.status === 'connected' ? (
                  <LinkOffIcon sx={{ fontSize: '1rem' }} />
                ) : (
                  <LinkIcon sx={{ fontSize: '1rem' }} />
                )}
              </ConnectionButton>
            </Tooltip>
            <Tooltip title="Delete">
              <DeleteButton
                size="small"
                onClick={(e) => handleDelete(e, db.id)}
              >
                <DeleteOutlineIcon sx={{ fontSize: '1rem' }} />
              </DeleteButton>
            </Tooltip>
          </DatabaseItem>
        ))}
      </DatabaseList>

      {/* Database Details Dialog */}
      <DatabaseDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        database={selectedDatabase}
      />
    </SidebarWrapper>
  );
}
