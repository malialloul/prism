import { useState } from 'react';
import ShieldIcon from '@mui/icons-material/Shield';
import CircularProgress from '@mui/material/CircularProgress';
import { use2FAStatus } from '../../../../api/entities/auth';
import Setup2FAModal from '../Setup2FAModal';
import Disable2FAModal from '../Disable2FAModal';
import {
  TwoFactorSectionContainer,
  TwoFactorInfo,
  TwoFactorIcon,
  TwoFactorText,
  TwoFactorTitle,
  TwoFactorDescription,
  EnableButton,
} from './TwoFactorSection.styles';

const TwoFactorSection = () => {
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  
  const { enabled: twoFactorEnabled, isLoading, refetch } = use2FAStatus();

  const handleToggleTwoFactor = () => {
    if (twoFactorEnabled) {
      setDisableModalOpen(true);
    } else {
      setSetupModalOpen(true);
    }
  };

  const handle2FASuccess = () => {
    refetch();
  };

  return (
    <>
      <TwoFactorSectionContainer>
        <TwoFactorInfo>
          <TwoFactorIcon>
            <ShieldIcon sx={{ fontSize: 20 }} />
          </TwoFactorIcon>
          <TwoFactorText>
            <TwoFactorTitle>Two-Factor Authentication</TwoFactorTitle>
            <TwoFactorDescription>
              {twoFactorEnabled 
                ? 'Your account is secured with 2FA' 
                : 'Add an extra layer of security to your account'}
            </TwoFactorDescription>
          </TwoFactorText>
        </TwoFactorInfo>
        <EnableButton onClick={handleToggleTwoFactor} disabled={isLoading}>
          {isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : twoFactorEnabled ? (
            'Disable'
          ) : (
            'Enable'
          )}
        </EnableButton>
      </TwoFactorSectionContainer>

      <Setup2FAModal
        open={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onSuccess={handle2FASuccess}
      />

      <Disable2FAModal
        open={disableModalOpen}
        onClose={() => setDisableModalOpen(false)}
        onSuccess={handle2FASuccess}
      />
    </>
  );
};

export default TwoFactorSection;
