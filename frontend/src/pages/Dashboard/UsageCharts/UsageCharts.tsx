import { useState, useMemo, useContext } from 'react';
import {
  ChartsContainer,
  ChartCard,
  ChartHeader,
  ChartTitle,
  ChartLegend,
  LegendItem,
  LegendDot,
  LegendLabel,
  ChartContent,
  ChartBar,
  ChartAxis,
  AxisLabel,
  ChartStats,
  ChartStat,
  ChartStatValue,
  ChartStatLabel,
  TimeRangeSelector,
  TimeRangeButton,
} from './UsageCharts.styles';
import { getDashboardColors } from '../../../styles/theme';
import { AppContext } from '../../../App';
import { useQueryStats } from '../../../api/entities/databases';

interface UsageChartsProps {
  selectedDatabaseId: number | null;
}

export default function UsageCharts({ selectedDatabaseId }: UsageChartsProps) {
  const { darkMode } = useContext(AppContext);
  const colors = getDashboardColors(darkMode);
  const [apiTimeRange, setApiTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [queryTimeRange, setQueryTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Fetch real query stats from the backend
  const { data: queryStats } = useQueryStats(selectedDatabaseId ?? undefined);

  // Use real hourly data from backend, with fallback to empty array
  const hourlyData = queryStats?.hourlyData ?? Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    queries: 0,
    errors: 0,
    avgLatencyMs: 0,
  }));

  // Transform data for charts
  const queriesData = useMemo(() =>
    hourlyData.map(d => ({ hour: d.hour, value: d.queries })),
    [hourlyData]
  );

  const errorsData = useMemo(() =>
    hourlyData.map(d => ({ hour: d.hour, value: d.errors })),
    [hourlyData]
  );

  const latencyData = useMemo(() =>
    hourlyData.map(d => ({ hour: d.hour, value: d.avgLatencyMs })),
    [hourlyData]
  );

  // API calls data - for now same as queries (can be extended for separate API tracking)
  const apiCallsData = queriesData;

  // Calculate max values for scaling
  const apiMax = Math.max(...apiCallsData.map(d => d.value), 1);
  const queryMax = Math.max(...queriesData.map(d => d.value), 1);

  // Calculate totals
  const totalApiCalls = apiCallsData.reduce((sum, d) => sum + d.value, 0);
  const avgLatency = latencyData.length > 0
    ? Math.floor(latencyData.reduce((sum, d) => sum + d.value, 0) / latencyData.length)
    : 0;
  const totalQueries = queryStats?.totalQueries ?? 0;
  const totalErrors = errorsData.reduce((sum, d) => sum + d.value, 0);

  const timeLabels = ['12am', '6am', '12pm', '6pm', '11pm'];

  return (
    <ChartsContainer>
      {/* API Calls & Latency Chart */}
      <ChartCard>
        <ChartHeader>
          <ChartTitle>API Calls & Latency</ChartTitle>
          <TimeRangeSelector>
            {(['24h', '7d', '30d'] as const).map((range) => (
              <TimeRangeButton
                key={range}
                active={apiTimeRange === range}
                onClick={() => setApiTimeRange(range)}
              >
                {range}
              </TimeRangeButton>
            ))}
          </TimeRangeSelector>
        </ChartHeader>

        <ChartLegend>
          <LegendItem>
            <LegendDot color={colors.chartPrimary} />
            <LegendLabel>API Calls</LegendLabel>
          </LegendItem>
          <LegendItem>
            <LegendDot color={colors.chartTertiary} />
            <LegendLabel>Latency (ms)</LegendLabel>
          </LegendItem>
        </ChartLegend>

        <ChartContent>
          {apiCallsData.map((data, i) => (
            <ChartBar
              key={i}
              height={(data.value / apiMax) * 100}
              color={colors.chartPrimary}
            />
          ))}
        </ChartContent>

        <ChartAxis>
          {timeLabels.map((label) => (
            <AxisLabel key={label}>{label}</AxisLabel>
          ))}
        </ChartAxis>

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
            <ChartStatValue>{Math.max(...apiCallsData.map(d => d.value))}</ChartStatValue>
            <ChartStatLabel>Peak/Hour</ChartStatLabel>
          </ChartStat>
        </ChartStats>
      </ChartCard>

      {/* Queries & Errors Chart */}
      <ChartCard>
        <ChartHeader>
          <ChartTitle>Queries & Errors</ChartTitle>
          <TimeRangeSelector>
            {(['24h', '7d', '30d'] as const).map((range) => (
              <TimeRangeButton
                key={range}
                active={queryTimeRange === range}
                onClick={() => setQueryTimeRange(range)}
              >
                {range}
              </TimeRangeButton>
            ))}
          </TimeRangeSelector>
        </ChartHeader>

        <ChartLegend>
          <LegendItem>
            <LegendDot color={colors.chartSecondary} />
            <LegendLabel>Queries</LegendLabel>
          </LegendItem>
          <LegendItem>
            <LegendDot color={colors.chartError} />
            <LegendLabel>Errors</LegendLabel>
          </LegendItem>
        </ChartLegend>

        <ChartContent>
          {queriesData.map((data, i) => (
            <ChartBar
              key={i}
              height={(data.value / queryMax) * 100}
              color={errorsData[i].value > 5 ? colors.chartError : colors.chartSecondary}
            />
          ))}
        </ChartContent>

        <ChartAxis>
          {timeLabels.map((label) => (
            <AxisLabel key={label}>{label}</AxisLabel>
          ))}
        </ChartAxis>

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
