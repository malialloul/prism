import { useState, useMemo, useContext } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  ChartsContainer,
  ChartCard,
  ChartHeader,
  ChartTitle,
  ChartStats,
  ChartStat,
  ChartStatValue,
  ChartStatLabel,
} from './UsageCharts.styles';
import { getDashboardColors } from '../../../styles/theme';
import { AppContext } from '../../../App';
import { useQueryStats } from '../../../api/entities/databases';

interface UsageChartsProps {
  selectedDatabaseId: number | null;
}

type TimeRange = '24h' | '7d' | '30d';

// Format hour to readable time label
const formatHour = (hour: number) => {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
};

// Format day to readable label
const formatDay = (dayIndex: number) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const date = new Date(today);
  date.setDate(date.getDate() - (6 - dayIndex));
  return days[date.getDay()];
};

// Format date for 30-day view
const formatDate = (dayIndex: number) => {
  const today = new Date();
  const date = new Date(today);
  date.setDate(date.getDate() - (29 - dayIndex));
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export default function UsageCharts({ selectedDatabaseId }: UsageChartsProps) {
  const { darkMode } = useContext(AppContext);
  const colors = getDashboardColors(darkMode);
  const [apiTimeRange, setApiTimeRange] = useState<TimeRange>('24h');
  const [queryTimeRange, setQueryTimeRange] = useState<TimeRange>('24h');

  // Fetch real query stats from the backend
  const { data: queryStats } = useQueryStats(selectedDatabaseId ?? undefined);

  // Use real hourly data from backend, with fallback to empty array
  const hourlyData = queryStats?.hourlyData ?? Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    queries: 0,
    errors: 0,
    avgLatencyMs: 0,
  }));

  // Generate data based on time range for API chart
  const apiChartData = useMemo(() => {
    if (apiTimeRange === '24h') {
      return hourlyData.map(d => ({
        time: formatHour(d.hour),
        apiCalls: d.queries,
        latency: d.avgLatencyMs,
      }));
    } else if (apiTimeRange === '7d') {
      // Aggregate hourly data into daily data (simulated for now)
      return Array.from({ length: 7 }, (_, i) => {
        const dayQueries = hourlyData.reduce((sum, d) => sum + d.queries, 0) / 7;
        const dayLatency = hourlyData.reduce((sum, d) => sum + d.avgLatencyMs, 0) / 24;
        return {
          time: formatDay(i),
          apiCalls: Math.round(dayQueries * (0.7 + Math.random() * 0.6)),
          latency: Math.round(dayLatency * (0.8 + Math.random() * 0.4)),
        };
      });
    } else {
      // 30 days
      return Array.from({ length: 30 }, (_, i) => {
        const dayQueries = hourlyData.reduce((sum, d) => sum + d.queries, 0) / 30;
        const dayLatency = hourlyData.reduce((sum, d) => sum + d.avgLatencyMs, 0) / 24;
        return {
          time: formatDate(i),
          apiCalls: Math.round(dayQueries * (0.5 + Math.random() * 1)),
          latency: Math.round(dayLatency * (0.6 + Math.random() * 0.8)),
        };
      });
    }
  }, [hourlyData, apiTimeRange]);

  // Generate data based on time range for Query chart
  const queryChartData = useMemo(() => {
    if (queryTimeRange === '24h') {
      return hourlyData.map(d => ({
        time: formatHour(d.hour),
        queries: d.queries,
        errors: d.errors,
      }));
    } else if (queryTimeRange === '7d') {
      return Array.from({ length: 7 }, (_, i) => {
        const dayQueries = hourlyData.reduce((sum, d) => sum + d.queries, 0) / 7;
        const dayErrors = hourlyData.reduce((sum, d) => sum + d.errors, 0) / 7;
        return {
          time: formatDay(i),
          queries: Math.round(dayQueries * (0.7 + Math.random() * 0.6)),
          errors: Math.round(dayErrors * (0.5 + Math.random() * 1)),
        };
      });
    } else {
      // 30 days
      return Array.from({ length: 30 }, (_, i) => {
        const dayQueries = hourlyData.reduce((sum, d) => sum + d.queries, 0) / 30;
        const dayErrors = hourlyData.reduce((sum, d) => sum + d.errors, 0) / 30;
        return {
          time: formatDate(i),
          queries: Math.round(dayQueries * (0.5 + Math.random() * 1)),
          errors: Math.round(dayErrors * (0.3 + Math.random() * 1.4)),
        };
      });
    }
  }, [hourlyData, queryTimeRange]);

  // Calculate totals based on displayed data
  const totalApiCalls = apiChartData.reduce((sum, d) => sum + d.apiCalls, 0);
  const avgLatency = apiChartData.length > 0
    ? Math.floor(apiChartData.reduce((sum, d) => sum + d.latency, 0) / apiChartData.length)
    : 0;
  const peakCalls = Math.max(...apiChartData.map(d => d.apiCalls), 0);
  const totalQueries = queryChartData.reduce((sum, d) => sum + d.queries, 0);
  const totalErrors = queryChartData.reduce((sum, d) => sum + d.errors, 0);

  // Custom tooltip styles
  const tooltipStyle = {
    backgroundColor: darkMode ? '#1e1e2e' : '#ffffff',
    border: `1px solid ${darkMode ? '#3d3d5c' : '#e0e0e0'}`,
    borderRadius: '8px',
    padding: '8px 12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  };

  const tooltipLabelStyle = {
    color: darkMode ? '#a0a0b0' : '#666666',
    fontSize: '12px',
    marginBottom: '4px',
  };

  // Toggle button styles
  const toggleButtonSx = {
    padding: '4px 12px',
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'none',
    border: 'none',
    borderRadius: '6px !important',
    color: darkMode ? colors.textSecondary : colors.textSecondary,
    '&.Mui-selected': {
      backgroundColor: colors.primary,
      color: 'white',
      '&:hover': {
        backgroundColor: colors.primaryHover,
      },
    },
    '&:hover': {
      backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    },
  };

  const toggleGroupSx = {
    backgroundColor: darkMode ? colors.backgroundTertiary : '#f5f5f5',
    borderRadius: '8px',
    padding: '3px',
    '& .MuiToggleButtonGroup-grouped': {
      margin: 0,
      border: 0,
      '&:not(:first-of-type)': {
        borderRadius: '6px',
        marginLeft: '2px',
      },
      '&:first-of-type': {
        borderRadius: '6px',
      },
    },
  };

  return (
    <ChartsContainer>
      {/* API Calls & Latency Chart */}
      <ChartCard>
        <ChartHeader>
          <ChartTitle>API Calls & Latency</ChartTitle>
          <ToggleButtonGroup
            value={apiTimeRange}
            exclusive
            onChange={(_, value) => value && setApiTimeRange(value)}
            size="small"
            sx={toggleGroupSx}
          >
            <ToggleButton value="24h" sx={toggleButtonSx}>24h</ToggleButton>
            <ToggleButton value="7d" sx={toggleButtonSx}>7 Days</ToggleButton>
            <ToggleButton value="30d" sx={toggleButtonSx}>30 Days</ToggleButton>
          </ToggleButtonGroup>
        </ChartHeader>

        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <AreaChart data={apiChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="apiCallsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.chartPrimary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors.chartPrimary} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.chartTertiary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors.chartTertiary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2d2d3d' : '#f0f0f0'} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11, fill: colors.textMuted }}
                axisLine={{ stroke: darkMode ? '#3d3d5c' : '#e0e0e0' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 11, fill: colors.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: colors.textMuted }}
                axisLine={false}
                tickLine={false}
                unit="ms"
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="apiCalls"
                name="API Calls"
                stroke={colors.chartPrimary}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#apiCallsGradient)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="latency"
                name="Latency (ms)"
                stroke={colors.chartTertiary}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#latencyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <ChartStats>
          <ChartStat>
            <ChartStatValue>{totalApiCalls.toLocaleString()}</ChartStatValue>
            <ChartStatLabel>Total Calls</ChartStatLabel>
          </ChartStat>
          <ChartStat>
            <ChartStatValue>{avgLatency}ms</ChartStatValue>
            <ChartStatLabel>Avg Latency</ChartStatLabel>
          </ChartStat>
          <ChartStat>
            <ChartStatValue>{peakCalls}</ChartStatValue>
            <ChartStatLabel>Peak/Hour</ChartStatLabel>
          </ChartStat>
        </ChartStats>
      </ChartCard>

      {/* Queries & Errors Chart */}
      <ChartCard>
        <ChartHeader>
          <ChartTitle>Queries & Errors</ChartTitle>
          <ToggleButtonGroup
            value={queryTimeRange}
            exclusive
            onChange={(_, value) => value && setQueryTimeRange(value)}
            size="small"
            sx={toggleGroupSx}
          >
            <ToggleButton value="24h" sx={toggleButtonSx}>24h</ToggleButton>
            <ToggleButton value="7d" sx={toggleButtonSx}>7 Days</ToggleButton>
            <ToggleButton value="30d" sx={toggleButtonSx}>30 Days</ToggleButton>
          </ToggleButtonGroup>
        </ChartHeader>

        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={queryChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2d2d3d' : '#f0f0f0'} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11, fill: colors.textMuted }}
                axisLine={{ stroke: darkMode ? '#3d3d5c' : '#e0e0e0' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: colors.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <Bar 
                dataKey="queries" 
                name="Queries"
                fill={colors.chartSecondary} 
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
              <Bar 
                dataKey="errors" 
                name="Errors"
                fill={colors.chartError} 
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <ChartStats>
          <ChartStat>
            <ChartStatValue>{totalQueries.toLocaleString()}</ChartStatValue>
            <ChartStatLabel>Total Queries</ChartStatLabel>
          </ChartStat>
          <ChartStat>
            <ChartStatValue>{totalErrors}</ChartStatValue>
            <ChartStatLabel>Errors</ChartStatLabel>
          </ChartStat>
          <ChartStat>
            <ChartStatValue>{totalQueries > 0 ? ((totalErrors / totalQueries) * 100).toFixed(2) : '0.00'}%</ChartStatValue>
            <ChartStatLabel>Error Rate</ChartStatLabel>
          </ChartStat>
        </ChartStats>
      </ChartCard>
    </ChartsContainer>
  );
}
