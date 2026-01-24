import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { clearAuthToken } from '../../api/httpClient';

const AvatarButton = styled('button')<{ variant?: 'light' | 'dark' }>(({ variant = 'dark' }) => ({
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: variant === 'dark' 
      ? '0 0 0 3px rgba(139, 92, 246, 0.3)' 
      : '0 0 0 3px rgba(139, 92, 246, 0.2)',
  },
}));

interface UserAvatarProps {
  variant?: 'light' | 'dark';
  initial?: string;
}

export default function UserAvatar({ variant = 'dark', initial = 'D' }: UserAvatarProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

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

  const menuStyles = variant === 'dark' ? {
    bgcolor: '#1a1f35',
    border: '1px solid #1e293b',
    '& .MuiMenuItem-root': {
      color: '#f1f5f9',
      '&:hover': {
        bgcolor: '#252b42',
      },
    },
  } : {
    bgcolor: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '& .MuiMenuItem-root': {
      color: '#334155',
      '&:hover': {
        bgcolor: '#f1f5f9',
      },
    },
  };

  const iconColor = variant === 'dark' ? '#94a3b8' : '#64748b';
  const dividerColor = variant === 'dark' ? '#1e293b' : '#e2e8f0';

  return (
    <>
      <AvatarButton variant={variant} onClick={handleAvatarClick}>
        {initial}
      </AvatarButton>
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
              ...menuStyles,
            },
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: iconColor }} />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: iconColor }} />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider sx={{ borderColor: dividerColor }} />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText sx={{ color: '#ef4444' }}>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
