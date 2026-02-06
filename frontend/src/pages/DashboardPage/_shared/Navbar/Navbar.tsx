import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ApiIcon from '@mui/icons-material/Api';
import {
  NavbarWrapper,
  LeftSection,
  Logo,
  LogoIcon,
  LogoText,
  RightSection,
  ActionButton,
  NavTabs,
  NavTab,
} from './Navbar.styles';
import { UserAvatar, NotificationBell } from '../../../../components';
import { AppContext } from '../../../../App';

// Icons
import RefreshIcon from '@mui/icons-material/Refresh';

interface NavbarProps {
  onRefresh?: () => void;
  activeMainTab?: number;
  onMainTabChange?: (tab: number) => void;
  hasConnectedDatabase?: boolean;
}

export default function Navbar({ onRefresh, activeMainTab = 0, onMainTabChange, hasConnectedDatabase = false }: NavbarProps) {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(AppContext);

  const handleTabChange = (_: React.SyntheticEvent, newTab: number) => {
    // Prevent switching to APIs tab if no database is connected
    if (newTab === 1 && !hasConnectedDatabase) return;
    onMainTabChange?.(newTab);
  };

  return (
    <NavbarWrapper>
      <LeftSection>
        <Logo onClick={() => navigate('/')}>
          <LogoIcon>⬡</LogoIcon>
          <LogoText>Prism</LogoText>
        </Logo>

        <NavTabs value={activeMainTab} onChange={handleTabChange}>
          <NavTab
            icon={<DashboardIcon fontSize="small" />}
            iconPosition="start"
            label="Dashboard"
          />
          <NavTab
            icon={<ApiIcon fontSize="small" />}
            iconPosition="start"
            label={hasConnectedDatabase ? 'APIs' : (
              <Tooltip title="Connect a database first" arrow>
                <span>APIs</span>
              </Tooltip>
            )}
            disabled={!hasConnectedDatabase}
            sx={!hasConnectedDatabase ? { opacity: 0.5, pointerEvents: 'auto' } : {}}
          />
        </NavTabs>
      </LeftSection>

      <RightSection>
        <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <ActionButton onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
          </ActionButton>
        </Tooltip>

        <Tooltip title="Refresh">
          <ActionButton onClick={onRefresh}>
            <RefreshIcon fontSize="small" />
          </ActionButton>
        </Tooltip>

        <NotificationBell />

        <UserAvatar variant={darkMode ? 'dark' : 'light'} />
      </RightSection>
    </NavbarWrapper>
  );
}
