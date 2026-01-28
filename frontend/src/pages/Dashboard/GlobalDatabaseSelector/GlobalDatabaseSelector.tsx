import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectChangeEvent, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
  SelectorWrapper,
  LeftSection,
  Logo,
  LogoIcon,
  LogoText,
  DatabaseDropdown,
  DatabaseMenuItem as DBMenuItem,
  DatabaseInfo,
  DatabaseName,
  DatabaseMeta,
  EngineBadge,
  StatusDot,
  RightSection,
  ActionButton,
  AddDatabaseButton,
  AllDatabasesOption,
  AllDatabasesIcon,
  UserAvatar,
} from './GlobalDatabaseSelector.styles';
import { clearAuthToken } from '../../../api/httpClient';

// Icons
import DatabaseIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { DatabaseDto } from '../../../api/models/DatabaseDto';

interface GlobalDatabaseSelectorProps {
  databases: DatabaseDto[];
  selectedId: string | 'all';
  onSelect: (id: string | 'all') => void;
  onDisconnect: (id: string) => void;
  onAddDatabase: () => void;
}

export default function GlobalDatabaseSelector({
  databases,
  selectedId,
  onSelect,
  onAddDatabase,
}: GlobalDatabaseSelectorProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    onSelect(event.target.value as string | 'all');
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearAuthToken();
    handleMenuClose();
    navigate('/signin');
  };

  const connectedCount = databases.filter(db => db.status === 'connected').length;

  return (
    <SelectorWrapper>
      <LeftSection>
        <Logo>
          <LogoIcon>⬡</LogoIcon>
          <LogoText>Prism</LogoText>
        </Logo>

        <DatabaseDropdown
          value={selectedId}
          onChange={handleChange}
          renderValue={(value) => {
            if (value === 'all') {
              return (
                <AllDatabasesOption>
                  <AllDatabasesIcon>
                    <DatabaseIcon fontSize="small" />
                  </AllDatabasesIcon>
                  <DatabaseInfo>
                    <DatabaseName>All Databases</DatabaseName>
                    <DatabaseMeta>{connectedCount} connected</DatabaseMeta>
                  </DatabaseInfo>
                </AllDatabasesOption>
              );
            }
            const db = databases.find(d => d.id === value);
            if (!db) return null;
            return (
              <AllDatabasesOption>
                <StatusDot status={db.status} />
                <DatabaseInfo>
                  <DatabaseName>{db.name}</DatabaseName>
                  <DatabaseMeta>
                    <EngineBadge engine={db.engine}>{db.engine}</EngineBadge>
                    {db.host}
                  </DatabaseMeta>
                </DatabaseInfo>
              </AllDatabasesOption>
            );
          }}
        >
          <DBMenuItem value="all">
            <AllDatabasesIcon>
              <DatabaseIcon fontSize="small" />
            </AllDatabasesIcon>
            <DatabaseInfo>
              <DatabaseName>All Databases</DatabaseName>
              <DatabaseMeta>{connectedCount} connected</DatabaseMeta>
            </DatabaseInfo>
          </DBMenuItem>

          {databases.map((db) => (
            <DBMenuItem key={db.id} value={db.id}>
              <StatusDot status={db.status} />
              <DatabaseInfo>
                <DatabaseName>{db.name}</DatabaseName>
                <DatabaseMeta>
                  <EngineBadge engine={db.engine}>{db.engine}</EngineBadge>
                  {db.host}
                </DatabaseMeta>
              </DatabaseInfo>
            </DBMenuItem>
          ))}
        </DatabaseDropdown>
      </LeftSection>

      <RightSection>
        <Tooltip title="Refresh">
          <ActionButton>
            <RefreshIcon fontSize="small" />
          </ActionButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <ActionButton>
            <NotificationsIcon fontSize="small" />
          </ActionButton>
        </Tooltip>

        <Tooltip title="Settings">
          <ActionButton>
            <SettingsIcon fontSize="small" />
          </ActionButton>
        </Tooltip>

        <Tooltip title="Add Database">
          <AddDatabaseButton onClick={onAddDatabase}>
            <AddIcon fontSize="small" />
          </AddDatabaseButton>
        </Tooltip>

        <Tooltip title="Account">
          <UserAvatar onClick={handleAvatarClick}>
            D
          </UserAvatar>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 180,
                bgcolor: '#1a1f35',
                border: '1px solid #1e293b',
                '& .MuiMenuItem-root': {
                  color: '#f1f5f9',
                  '&:hover': {
                    bgcolor: '#252b42',
                  },
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: '#94a3b8' }} />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: '#94a3b8' }} />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <Divider sx={{ borderColor: '#1e293b' }} />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
            </ListItemIcon>
            <ListItemText sx={{ color: '#ef4444' }}>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </RightSection>
    </SelectorWrapper>
  );
}
