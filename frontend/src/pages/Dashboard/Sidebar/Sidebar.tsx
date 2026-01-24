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
  SidebarFooter,
  FooterButton,
} from './Sidebar.styles';
import type { Database } from '../Dashboard';

// Icons
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface SidebarProps {
  databases: Database[];
  selectedId: string;
  onSelect: (id: string) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onAddDatabase: () => void;
}

export default function Sidebar({
  databases,
  selectedId,
  onSelect,
  onConnect,
  onDisconnect,
  onAddDatabase,
}: SidebarProps) {
  const handleConnectionToggle = (e: React.MouseEvent, db: Database) => {
    e.stopPropagation();
    if (db.status === 'connected') {
      onDisconnect(db.id);
    } else {
      onConnect(db.id);
    }
  };

  return (
    <SidebarWrapper>
      <SidebarHeader>
        <HeaderTitle>Databases</HeaderTitle>
        <Tooltip title="Add Database">
          <AddButton onClick={onAddDatabase} size="small">
            <AddIcon sx={{ fontSize: '1rem' }} />
          </AddButton>
        </Tooltip>
      </SidebarHeader>

      <DatabaseList>
        {databases.map((db) => (
          <DatabaseItem
            key={db.id}
            selected={selectedId === db.id}
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
