import { useMemo } from 'react';
import {
  StatsGrid,
  StatCard,
  StatHeader,
  StatIconBox,
  StatTrend,
  StatContent,
  StatValue,
  StatLabel,
} from './OverviewStatsCards.styles';
import type { Database } from '../Dashboard';

// Icons
import StorageIcon from '@mui/icons-material/Storage';
import TableChartIcon from '@mui/icons-material/TableChart';
import ApiIcon from '@mui/icons-material/Api';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CloudIcon from '@mui/icons-material/Cloud';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface OverviewStatsCardsProps {
  databases: Database[];
  selectedDatabaseId: string;
}

export default function OverviewStatsCards({ databases, selectedDatabaseId }: OverviewStatsCardsProps) {
  const stats = useMemo(() => {
    const selectedDb = databases.find(db => db.id === selectedDatabaseId);
    const filteredDatabases = selectedDb ? [selectedDb] : databases;

    const totalDatabases = filteredDatabases.length;
    const totalTables = filteredDatabases.reduce((sum, db) => sum + db.tables, 0);
    const totalApis = filteredDatabases.reduce((sum, db) => sum + db.apis, 0);
    
    // Mock data for queries and storage
    const queriesExecuted = selectedDb ? Math.floor(42580 / databases.length) : 42580;
    const totalStorage = filteredDatabases.reduce((sum, db) => {
      const match = db.storage.match(/(\d+\.?\d*)\s*(GB|MB)/);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2];
        return sum + (unit === 'GB' ? value : value / 1024);
      }
      return sum;
    }, 0);

    return {
      totalDatabases,
      totalTables,
      totalApis,
      queriesExecuted,
      totalStorage: totalStorage.toFixed(1),
    };
  }, [databases, selectedDatabaseId]);

  const statsConfig = [
    {
      label: 'Total Databases',
      value: stats.totalDatabases.toString(),
      icon: <StorageIcon />,
      variant: 'primary' as const,
      trend: { value: 12, positive: true },
      change: 'vs last month',
    },
    {
      label: 'Tables Count',
      value: stats.totalTables.toString(),
      icon: <TableChartIcon />,
      variant: 'secondary' as const,
      trend: { value: 8, positive: true },
      change: 'vs last month',
    },
    {
      label: 'APIs Generated',
      value: stats.totalApis.toString(),
      icon: <ApiIcon />,
      variant: 'success' as const,
      trend: { value: 24, positive: true },
      change: 'vs last month',
    },
    {
      label: 'Queries Executed',
      value: stats.queriesExecuted >= 1000 
        ? `${(stats.queriesExecuted / 1000).toFixed(1)}K` 
        : stats.queriesExecuted.toString(),
      icon: <QueryStatsIcon />,
      variant: 'warning' as const,
      trend: { value: 5, positive: false },
      change: 'vs last hour',
    },
    {
      label: 'Storage Used',
      value: `${stats.totalStorage} GB`,
      icon: <CloudIcon />,
      variant: 'info' as const,
      trend: { value: 3, positive: true },
      change: 'vs last week',
    },
  ];

  return (
    <StatsGrid>
      {statsConfig.map((stat) => (
        <StatCard key={stat.label}>
          <StatHeader>
            <StatIconBox variant={stat.variant}>
              {stat.icon}
            </StatIconBox>
            <StatTrend positive={stat.trend.positive}>
              {stat.trend.positive ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {stat.trend.value}%
            </StatTrend>
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
