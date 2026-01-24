import TwoFactorSection from './TwoFactorSection';
import SessionsList, { Session } from './SessionsList';
import { SecurityContainer } from './SecuritySettings.styles';

interface SecuritySettingsProps {
  sessions: Session[];
  onRevokeSession: (sessionId: string) => void;
  onLogoutAll: () => void;
}

const SecuritySettings = ({
  sessions,
  onRevokeSession,
  onLogoutAll,
}: SecuritySettingsProps) => {
  return (
    <SecurityContainer>
      <TwoFactorSection />
      <SessionsList
        sessions={sessions}
        onRevokeSession={onRevokeSession}
        onLogoutAll={onLogoutAll}
      />
    </SecurityContainer>
  );
};

export default SecuritySettings;
