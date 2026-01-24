import { useState } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ChangeEmailModal from './ChangeEmailModal';
import ChangePasswordModal from './ChangePasswordModal';
import {
  SettingsGrid,
  SettingItem,
  SettingInfo,
  SettingLabel,
  SettingValue,
  ChangeButton,
} from './AccountSettings.styles';

interface AccountSettingsProps {
  email: string;
}

const AccountSettings = ({ email }: AccountSettingsProps) => {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <>
      <SettingsGrid>
        {/* Email Section */}
        <SettingItem>
          <SettingInfo>
            <SettingLabel>
              <EmailIcon sx={{ fontSize: 14, marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Email Address
            </SettingLabel>
            <SettingValue>{email}</SettingValue>
          </SettingInfo>
          <ChangeButton onClick={() => setEmailModalOpen(true)}>Change</ChangeButton>
        </SettingItem>

        {/* Password Section */}
        <SettingItem>
          <SettingInfo>
            <SettingLabel>
              <LockIcon sx={{ fontSize: 14, marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Password
            </SettingLabel>
            <SettingValue>••••••••••••</SettingValue>
          </SettingInfo>
          <ChangeButton onClick={() => setPasswordModalOpen(true)}>Change</ChangeButton>
        </SettingItem>
      </SettingsGrid>

      {/* Modals */}
      <ChangeEmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        currentEmail={email}
      />
      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
};

export default AccountSettings;
