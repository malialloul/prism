import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LogoutIcon from '@mui/icons-material/Logout';
import { clearAuthToken, getUserFromToken, isSharedAccessSession } from '../../api/httpClient';
import { queryClient } from '../../App';
import { ROUTES } from '../../constants';

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

const ProfileAvatar = styled(Box)({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1.125rem',
  fontWeight: 600,
  flexShrink: 0,
});

interface UserAvatarProps {
  variant?: 'light' | 'dark';
  initial?: string;
  'data-tour'?: string;
}

export default function UserAvatar({ variant = 'dark', initial = 'D', 'data-tour': dataTour }: UserAvatarProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const user = getUserFromToken();

  const getInitials = (name?: string) => {
    if (!name) return initial;
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userInitial = getInitials(user?.fullName);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    // Clear React Query cache to prevent stale data for new user
    queryClient.clear();
    clearAuthToken();
    handleMenuClose();
    navigate(ROUTES.SIGN_IN);
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
  const textColor = variant === 'dark' ? '#f1f5f9' : '#0f172a';
  const textSecondaryColor = variant === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <>
      <AvatarButton variant={variant} onClick={handleAvatarClick} data-tour={dataTour}>
        {userInitial}
      </AvatarButton>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 240,
              ...menuStyles,
            },
          },
        }}
      >
        {/* Profile Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ProfileAvatar>{userInitial}</ProfileAvatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: textColor,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.fullName || 'User'}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: textSecondaryColor,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email || ''}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: dividerColor }} />
        {!isSharedAccessSession() && (
          <MenuItem onClick={() => { handleMenuClose(); navigate(ROUTES.SETTINGS); }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: iconColor }} />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { handleMenuClose(); navigate(ROUTES.FEEDBACK); }}>
          <ListItemIcon>
            <FeedbackIcon fontSize="small" sx={{ color: iconColor }} />
          </ListItemIcon>
          <ListItemText>Feedback</ListItemText>
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
