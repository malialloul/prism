import { useContext } from 'react';
import { IconButton, Tooltip, Switch, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { AppContext } from '../../App';

// Simple icon button version (for Navigation)
export function ThemeToggleButton() {
  const { darkMode, setDarkMode } = useContext(AppContext);
  
  return (
    <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
}

// Extended version with label and switch (for Dashboard)
const ToggleWrapper = styled(Box)<{ isDark?: boolean }>(({ isDark }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.375rem 0.75rem',
  borderRadius: '0.5rem',
  backgroundColor: isDark ? '#1a1f35' : '#f1f5f9',
  border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  '&:hover': {
    borderColor: isDark ? '#334155' : '#cbd5e1',
  },
}));

const ToggleLabel = styled('span')<{ isDark?: boolean }>(({ isDark }) => ({
  fontSize: '0.8125rem',
  color: isDark ? '#94a3b8' : '#64748b',
  fontWeight: 500,
}));

export function ThemeToggleSwitch() {
  const { darkMode, setDarkMode } = useContext(AppContext);

  const handleToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ToggleWrapper isDark={darkMode} onClick={handleToggle}>
      {darkMode ? (
        <DarkModeIcon sx={{ fontSize: '1.125rem', color: '#94a3b8' }} />
      ) : (
        <LightModeIcon sx={{ fontSize: '1.125rem', color: '#f59e0b' }} />
      )}
      <ToggleLabel isDark={darkMode}>{darkMode ? 'Dark' : 'Light'}</ToggleLabel>
      <Switch
        checked={darkMode}
        onChange={handleToggle}
        size="small"
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#8b5cf6',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#8b5cf6',
          },
        }}
      />
    </ToggleWrapper>
  );
}

export default ThemeToggleButton;
