import {
  SummaryCard,
  LeftContent,
  DatabaseIcon,
  DatabaseDetails,
  DatabaseName,
  DatabaseMeta,
  MetaItem,
  EngineBadge,
  RightContent,
  StatusIndicator,
  StatusDot,
  StatusText,
  SyncInfo,
  SyncLabel,
  SyncTime,
  ActionButtons,
  ActionButton,
} from './ActiveDatabaseSummary.styles';

// Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { DatabaseDto } from '../../../api/models/DatabaseDto';

interface ActiveDatabaseSummaryProps {
  database: DatabaseDto;
  onDisconnect?: () => void;
  onRefresh?: () => void;
  onDelete?: () => void;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ActiveDatabaseSummary({ database, onDisconnect, onRefresh, onDelete }: ActiveDatabaseSummaryProps) {
  return (
    <SummaryCard>
      <LeftContent>
        <DatabaseIcon engine={database.engine}>
          {database.engine === 'postgres' ? 'P' : 'M'}
        </DatabaseIcon>
        <DatabaseDetails>
          <DatabaseName>{database.name}</DatabaseName>
          <DatabaseMeta>
            <EngineBadge engine={database.engine}>
              {database.engine === 'postgres' ? 'PostgreSQL' : 'MySQL'}
            </EngineBadge>
            <MetaItem>
              <LocationOnIcon sx={{ fontSize: '0.875rem' }} />
              {database.host}
            </MetaItem>
            <MetaItem>
              {database.tables} tables
            </MetaItem>
            <MetaItem>
              {database.apis} APIs
            </MetaItem>
          </DatabaseMeta>
        </DatabaseDetails>
      </LeftContent>

      <RightContent>
        <StatusIndicator>
          <StatusDot status={database.status} />
          <StatusText status={database.status}>{database.status}</StatusText>
        </StatusIndicator>

        <SyncInfo>
          <SyncLabel>Last Sync</SyncLabel>
          <SyncTime>{formatTimeAgo(new Date(database.lastConnectedAt))}</SyncTime>
        </SyncInfo>

        <ActionButtons>
          <ActionButton onClick={onRefresh}>
            <RefreshIcon sx={{ fontSize: '1rem' }} />
            Refresh
          </ActionButton>
          {database.status === 'connected' && (
            <ActionButton variant="danger" onClick={onDisconnect}>
              <LinkOffIcon sx={{ fontSize: '1rem' }} />
              Disconnect
            </ActionButton>
          )}
          <ActionButton variant="danger" onClick={onDelete}>
            <DeleteOutlineIcon sx={{ fontSize: '1rem' }} />
            Delete
          </ActionButton>
        </ActionButtons>
      </RightContent>
    </SummaryCard>
  );
}
