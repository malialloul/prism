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
import { UserAvatar } from '../../../components';
import { AppContext } from '../../../App';

// Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';

interface NavbarProps {
  onRefresh?: () => void;
  activeMainTab?: number;
  onMainTabChange?: (tab: number) => void;
}

export default function Navbar({ onRefresh, activeMainTab = 0, onMainTabChange }: NavbarProps) {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(AppContext);

  return (
    <NavbarWrapper>
      <LeftSection>
        <Logo onClick={() => navigate('/')}>
          <LogoIcon>⬡</LogoIcon>
          <LogoText>Prism</LogoText>
        </Logo>

        <NavTabs value={activeMainTab} onChange={(_, v) => onMainTabChange?.(v)}>
          <NavTab
            icon={<DashboardIcon fontSize="small" />}
            iconPosition="start"
            label="Dashboard"
          />
          <NavTab
            icon={<ApiIcon fontSize="small" />}
            iconPosition="start"
            label="APIs"
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

        <Tooltip title="Notifications">
          <ActionButton>
            <NotificationsIcon fontSize="small" />
          </ActionButton>
        </Tooltip>

        <UserAvatar variant={darkMode ? 'dark' : 'light'} />
      </RightSection>
    </NavbarWrapper>
  );
}
