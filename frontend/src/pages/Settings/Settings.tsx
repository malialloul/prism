import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SecurityIcon from '@mui/icons-material/Security';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ThemeToggleButton } from '../../components/ThemeToggle/ThemeToggle';
import AccountSettings from './AccountSettings/AccountSettings';
import SubscriptionUsage from './SubscriptionUsage/SubscriptionUsage';
import SecuritySettings from './SecuritySettings/SecuritySettings';
import DangerZone from './DangerZone/DangerZone';
import {
  SettingsWrapper,
  SettingsHeader,
  SettingsLayout,
  SettingsSidebar,
  SidebarItem,
  SidebarDivider,
  SettingsContent,
  PageTitle,
  PageSubtitle,
  SectionCard,
  SectionBody,
} from './Settings.styles';
import { Box } from '@mui/material';
import { getDashboardColors } from '../../styles/theme';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { getUserFromToken, clearAuthToken } from '../../api/httpClient';

type SettingsSection = 'account' | 'subscription' | 'security' | 'danger';

const Settings = () => {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const colors = getDashboardColors(muiTheme.palette.mode === 'dark');
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

  // Get actual user data from JWT token
  const currentUser = useMemo(() => getUserFromToken(), []);

  const [plan] = useState({
    name: 'Pro',
    type: 'pro' as const,
  });

  const [usage] = useState({
    apiCalls: { used: 45200, limit: 100000 },
    databases: { connected: 3, limit: 10 },
    storage: { used: 2.4, limit: 10 },
  });

  const [sessions] = useState([
    {
      id: '1',
      device: 'Chrome on Windows',
      deviceType: 'desktop' as const,
      location: 'New York, US',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'Safari on MacBook Pro',
      deviceType: 'desktop' as const,
      location: 'Los Angeles, US',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Mobile App on iPhone',
      deviceType: 'mobile' as const,
      location: 'Chicago, US',
      lastActive: '1 day ago',
      isCurrent: false,
    },
  ]);

  // Handler functions
  const handleUpgrade = () => {
    console.log('Upgrade clicked');
    // Navigate to pricing/billing page
  };

  const handleRevokeSession = (sessionId: string) => {
    console.log('Revoke session:', sessionId);
    // Call API to revoke session
  };

  const handleLogoutAll = () => {
    console.log('Logout all sessions clicked');
    // Call API to logout all other sessions
  };

  const handleDeactivateSuccess = () => {
    // Clear token cookie and redirect to login
    clearAuthToken();
    navigate('/signin');
  };

  const handleDeleteSuccess = () => {
    // Clear token cookie and redirect to home
    clearAuthToken();
    navigate('/');
  };

  const sectionConfig = {
    account: {
      title: 'Account',
      subtitle: 'Manage your email and password',
    },
    subscription: {
      title: 'Subscription & Usage',
      subtitle: 'Your current plan and resource usage',
    },
    security: {
      title: 'Security',
      subtitle: 'Manage your security preferences and active sessions',
    },
    danger: {
      title: 'Danger Zone',
      subtitle: 'Irreversible and destructive actions',
    },
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account':
        return (
          <AccountSettings
            email={currentUser?.email || ''}
          />
        );
      case 'subscription':
        return <SubscriptionUsage plan={plan} usage={usage} onUpgrade={handleUpgrade} />;
      case 'security':
        return (
          <SecuritySettings
            sessions={sessions}
            onRevokeSession={handleRevokeSession}
            onLogoutAll={handleLogoutAll}
          />
        );
      case 'danger':
        return <DangerZone onDeactivateSuccess={handleDeactivateSuccess} onDeleteSuccess={handleDeleteSuccess} />;
      default:
        return null;
    }
  };

  return (
    <SettingsWrapper>
      <SettingsHeader>
        <Box
          sx={{
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Box
              onClick={() => navigate(-1)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '0.5rem',
                backgroundColor: colors.backgroundTertiary,
                cursor: 'pointer',
                color: colors.textSecondary,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: colors.backgroundHover,
                  color: colors.text,
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </Box>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: colors.text }}>
              Settings
            </span>
          </Box>
          <ThemeToggleButton />
        </Box>
      </SettingsHeader>

      <SettingsLayout>
        <SettingsSidebar>
          <SidebarItem
            active={activeSection === 'account'}
            onClick={() => setActiveSection('account')}
          >
            <ManageAccountsIcon sx={{ fontSize: 20 }} />
            Account
          </SidebarItem>
          <SidebarItem
            active={activeSection === 'subscription'}
            onClick={() => setActiveSection('subscription')}
          >
            <CreditCardIcon sx={{ fontSize: 20 }} />
            Subscription & Usage
          </SidebarItem>
          <SidebarItem
            active={activeSection === 'security'}
            onClick={() => setActiveSection('security')}
          >
            <SecurityIcon sx={{ fontSize: 20 }} />
            Security
          </SidebarItem>
          <SidebarDivider />
          <SidebarItem
            active={activeSection === 'danger'}
            danger
            onClick={() => setActiveSection('danger')}
          >
            <WarningAmberIcon sx={{ fontSize: 20 }} />
            Danger Zone
          </SidebarItem>
        </SettingsSidebar>

        <SettingsContent>
          <Box sx={{ marginBottom: '0.5rem' }}>
            <PageTitle sx={activeSection === 'danger' ? { color: colors.error } : undefined}>
              {sectionConfig[activeSection].title}
            </PageTitle>
            <PageSubtitle>{sectionConfig[activeSection].subtitle}</PageSubtitle>
          </Box>

          <SectionCard
            sx={
              activeSection === 'danger'
                ? { borderColor: colors.error + '30' }
                : undefined
            }
          >
            <SectionBody>{renderSectionContent()}</SectionBody>
          </SectionCard>
        </SettingsContent>
      </SettingsLayout>
    </SettingsWrapper>
  );
};

export default Settings;
