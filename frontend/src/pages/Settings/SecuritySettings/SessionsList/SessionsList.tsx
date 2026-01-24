import ComputerIcon from '@mui/icons-material/Computer';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import {
  SessionsHeader,
  SessionsTitle,
  LogoutAllButton,
  SessionsListContainer,
  SessionItem,
  SessionInfo,
  DeviceIcon,
  SessionDetails,
  SessionDevice,
  CurrentBadge,
  SessionMeta,
  RevokeButton,
} from './SessionsList.styles';

export interface Session {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile';
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SessionsListProps {
  sessions: Session[];
  onRevokeSession: (sessionId: string) => void;
  onLogoutAll: () => void;
}

const SessionsList = ({
  sessions,
  onRevokeSession,
  onLogoutAll,
}: SessionsListProps) => {
  const getDeviceIcon = (type: 'desktop' | 'mobile') => {
    return type === 'desktop' ? (
      <ComputerIcon sx={{ fontSize: 18 }} />
    ) : (
      <PhoneIphoneIcon sx={{ fontSize: 18 }} />
    );
  };

  return (
    <>
      <SessionsHeader>
        <SessionsTitle>Active Sessions ({sessions.length})</SessionsTitle>
        {sessions.length > 1 && (
          <LogoutAllButton onClick={onLogoutAll}>
            <LogoutIcon sx={{ fontSize: 14 }} />
            Logout All Other Sessions
          </LogoutAllButton>
        )}
      </SessionsHeader>

      <SessionsListContainer>
        {sessions.map((session) => (
          <SessionItem key={session.id} isCurrent={session.isCurrent}>
            <SessionInfo>
              <DeviceIcon>{getDeviceIcon(session.deviceType)}</DeviceIcon>
              <SessionDetails>
                <SessionDevice>
                  {session.device}
                  {session.isCurrent && <CurrentBadge>Current</CurrentBadge>}
                </SessionDevice>
                <SessionMeta>
                  {session.location} • {session.lastActive}
                </SessionMeta>
              </SessionDetails>
            </SessionInfo>
            {!session.isCurrent && (
              <RevokeButton onClick={() => onRevokeSession(session.id)}>
                <CloseIcon sx={{ fontSize: 14 }} />
                Revoke
              </RevokeButton>
            )}
          </SessionItem>
        ))}
      </SessionsListContainer>
    </>
  );
};

export default SessionsList;
