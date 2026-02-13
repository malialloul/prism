import { useMemo } from 'react';
import {
  StatsGrid,
  StatCard,
  StatHeader,
  StatIconBox,
  StatContent,
  StatValue,
  StatLabel,
  LimitBar,
  LimitBarFill,
  LimitText,
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
import { useApiTokens, useVersionLimits } from '../../../../api/entities/auth';

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

  // Fetch version limits
  const { data: versionData } = useVersionLimits();
  const limits = versionData?.data?.limits;
  const usage = versionData?.data?.usage;

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

  // Helper to get progress bar variant based on percentage
  const getBarVariant = (percentage: number): 'normal' | 'warning' | 'danger' => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'normal';
  };

  const statsConfig = [
    // Only show Total Databases when no specific database is selected
    ...(!selectedDb ? [{
      label: 'Total Databases',
      value: databases.length.toString(),
      icon: <StorageIcon />,
      variant: 'primary' as const,
      limit: limits?.maxDatabases,
      usage: usage?.databases ?? databases.length,
    }] : []),
    {
      label: 'Tables Count',
      value: stats.totalTables.toString(),
      icon: <TableChartIcon />,
      variant: 'secondary' as const,
      limit: limits?.maxTablesPerDatabase,
      usage: usage?.tables ?? stats.totalTables,
    },
    {
      label: 'Custom APIs',
      value: stats.customApis.toString(),
      icon: <ApiIcon />,
      variant: 'success' as const,
      limit: limits?.maxSavedApis,
      usage: usage?.savedApis ?? stats.customApis,
    },
    {
      label: 'Requests/Month',
      value: (usage?.requestsThisMonth ?? stats.queriesExecuted) >= 1000
        ? `${((usage?.requestsThisMonth ?? stats.queriesExecuted) / 1000).toFixed(1)}K`
        : (usage?.requestsThisMonth ?? stats.queriesExecuted).toString(),
      icon: <QueryStatsIcon />,
      variant: 'warning' as const,
      limit: limits?.maxRequestsPerMonth,
      usage: usage?.requestsThisMonth ?? stats.queriesExecuted,
    },
    {
      label: 'Storage Used',
      value: formatBytes(stats.totalStorageBytes),
      icon: <CloudIcon />,
      variant: 'info' as const,
      limit: limits?.maxStorageMB,
      usage: usage?.storageMB ?? Math.round(stats.totalStorageBytes / (1024 * 1024)),
      isStorage: true,
    },
    // Only show API Tokens when a specific database is selected
    ...(selectedDb ? [{
      label: 'API Tokens',
      value: apiTokensCount.toString(),
      icon: <KeyIcon />,
      variant: 'primary' as const,
      limit: limits?.maxApiTokens,
      usage: usage?.apiTokens ?? apiTokensCount,
    }] : []),
  ];

  return (
    <StatsGrid>
      {statsConfig.map((stat) => {
        const hasLimit = stat.limit !== undefined && stat.limit > 0;
        const percentage = hasLimit ? (stat.usage! / stat.limit!) * 100 : 0;
        
        return (
          <StatCard key={stat.label}>
            <StatHeader>
              <StatIconBox variant={stat.variant}>
                {stat.icon}
              </StatIconBox>
            </StatHeader>
            <StatContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
              {hasLimit && (
                <>
                  <LimitBar>
                    <LimitBarFill percentage={percentage} variant={getBarVariant(percentage)} />
                  </LimitBar>
                  <LimitText>
                    {stat.isStorage 
                      ? `${stat.usage} / ${stat.limit} MB`
                      : `${stat.usage} / ${stat.limit}`
                    }
                  </LimitText>
                </>
              )}
            </StatContent>
          </StatCard>
        );
      })}
    </StatsGrid>
  );
}
