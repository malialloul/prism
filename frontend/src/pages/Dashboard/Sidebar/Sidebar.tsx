import { Tooltip } from '@mui/material';
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
  SidebarFooter,
  FooterButton,
} from './Sidebar.styles';

// Icons
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DatabaseDto } from '../../../api/models/DatabaseDto';

interface SidebarProps {
  databases: DatabaseDto[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onConnect: (id: number) => void;
  onDisconnect: (id: number) => void;
  onDelete: (id: number) => void;
  onAddDatabase: () => void;
}

export default function Sidebar({
  databases,
  selectedId,
  onSelect,
  onConnect,
  onDisconnect,
  onDelete,
  onAddDatabase,
}: SidebarProps) {
  const handleConnectionToggle = (e: React.MouseEvent, db: DatabaseDto) => {
    e.stopPropagation();
    if (db.status === 'connected') {
      onDisconnect(db.id);
    } else {
      onConnect(db.id);
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
        <Tooltip title="Add Database">
          <AddButton onClick={() => onAddDatabase()} size="small">
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
            <DatabaseIconBox engine={db.engine}>
              {db.engine === 'postgres' ? 'P' : 'M'}
            </DatabaseIconBox>
            <DatabaseInfo>
              <DatabaseName>{db.name}</DatabaseName>
              <DatabaseMeta>
                <StatusDot status={db.status} />
                {db.status}
              </DatabaseMeta>
            </DatabaseInfo>
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

      <SidebarFooter>
        <FooterButton>
          <SettingsIcon sx={{ fontSize: '1.125rem' }} />
          Settings
        </FooterButton>
        <FooterButton>
          <HelpOutlineIcon sx={{ fontSize: '1.125rem' }} />
          Help & Support
        </FooterButton>
      </SidebarFooter>
    </SidebarWrapper>
  );
}
