import { useMemo } from 'react';
import {
  StatsGrid,
  StatCard,
  StatHeader,
  StatIconBox,
  StatContent,
  StatValue,
  StatLabel,
} from './OverviewStatsCards.styles';

// Icons
import StorageIcon from '@mui/icons-material/Storage';
import TableChartIcon from '@mui/icons-material/TableChart';
import ApiIcon from '@mui/icons-material/Api';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CloudIcon from '@mui/icons-material/Cloud';
import KeyIcon from '@mui/icons-material/Key';
import { DatabaseDto } from '../../../../api/models/DatabaseDto';
import { useQueryStats } from '../../../../api/entities/databases';
import { useApiTokens } from '../../../../api/entities/auth';

interface OverviewStatsCardsProps {
  databases: DatabaseDto[];
  selectedDatabaseId: number | null;
}

// Helper to format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function OverviewStatsCards({ databases, selectedDatabaseId }: OverviewStatsCardsProps) {
  // Fetch real query stats from the backend
  const { data: queryStats } = useQueryStats(selectedDatabaseId ?? undefined);
  
  // Fetch API tokens count
  const { data: apiTokensData } = useApiTokens();
  const apiTokensCount = apiTokensData?.data?.tokens?.length ?? 0;

  const stats = useMemo(() => {
    const selectedDb = selectedDatabaseId ? databases.find(db => db.id === selectedDatabaseId) : null;
    const filteredDatabases = selectedDb ? [selectedDb] : databases;

    const totalDatabases = filteredDatabases.length;
    const totalTables = filteredDatabases.reduce((sum, db) => sum + db.tables, 0);
    const customApis = filteredDatabases.reduce((sum, db) => sum + db.apis, 0);

    // OpenAPIs = 5 CRUD endpoints per table (GET all, GET one, POST, PATCH, DELETE)
    const openApis = totalTables * 5;
    const totalApis = openApis + customApis;

    // Use real query stats from the backend
    const queriesExecuted = queryStats?.totalQueries ?? 0;

    // Calculate actual storage from database storageBytes
    const totalStorageBytes = filteredDatabases.reduce((sum, db) => sum + (db.storageBytes || 0), 0);

    return {
      totalDatabases,
      totalTables,
      totalApis,
      openApis,
      customApis,
      queriesExecuted,
      totalStorageBytes,
    };
  }, [databases, selectedDatabaseId, queryStats]);

  const selectedDb = selectedDatabaseId ? databases.find(db => db.id === selectedDatabaseId) : null;

  const statsConfig = [
    // Only show Total Databases when no specific database is selected
    ...(!selectedDb ? [{
      label: 'Total Databases',
      value: databases.length.toString(),
      icon: <StorageIcon />,
      variant: 'primary' as const,
      change: 'vs last month',
    }] : []),
    {
      label: 'Tables Count',
      value: stats.totalTables.toString(),
      icon: <TableChartIcon />,
      variant: 'secondary' as const,
      change: 'vs last month',
    },
    {
      label: 'Custom APIs',
      value: stats.customApis.toString(),
      icon: <ApiIcon />,
      variant: 'success' as const,
      change: 'saved queries',
    },
    {
      label: 'Queries Executed',
      value: stats.queriesExecuted >= 1000
        ? `${(stats.queriesExecuted / 1000).toFixed(1)}K`
        : stats.queriesExecuted.toString(),
      icon: <QueryStatsIcon />,
      variant: 'warning' as const,

      change: 'queries last hour',
    },
    {
      label: 'Storage Used',
      value: formatBytes(stats.totalStorageBytes),
      icon: <CloudIcon />,
      variant: 'info' as const,
      trend: { value: 3, positive: true },
      change: 'vs last week',
    },
    // Only show API Tokens when a specific database is selected
    ...(selectedDb ? [{
      label: 'API Tokens',
      value: apiTokensCount.toString(),
      icon: <KeyIcon />,
      variant: 'primary' as const,
      change: 'active tokens',
    }] : []),
  ];

  return (
    <StatsGrid>
      {statsConfig.map((stat) => (
        <StatCard key={stat.label}>
          <StatHeader>
            <StatIconBox variant={stat.variant}>
              {stat.icon}
            </StatIconBox>

          </StatHeader>
          <StatContent>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatContent>
        </StatCard>
      ))}
    </StatsGrid>
  );
}
