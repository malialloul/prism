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

interface UsageChartsProps {
  selectedDatabaseId: string;
}

// Generate mock data for charts
const generateMockData = (hours: number, baseValue: number, variance: number) => {
  return Array.from({ length: hours }, (_, i) => ({
    hour: i,
    value: Math.max(0, baseValue + Math.floor((Math.random() - 0.5) * variance)),
  }));
};

export default function UsageCharts({ selectedDatabaseId }: UsageChartsProps) {
  const { darkMode } = useContext(AppContext);
  const colors = getDashboardColors(darkMode);
  const [apiTimeRange, setApiTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [queryTimeRange, setQueryTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Generate mock chart data based on selected database
  const apiCallsData = useMemo(() => {
    // Use DB id as seed for consistent but different data per DB
    const seed = selectedDatabaseId.charCodeAt(0) || 1;
    return generateMockData(24, Math.floor(150 * (seed * 0.3)), Math.floor(80 * (seed * 0.2)));
  }, [selectedDatabaseId]);

  const queriesData = useMemo(() => {
    const seed = selectedDatabaseId.charCodeAt(0) || 1;
    return generateMockData(24, Math.floor(200 * (seed * 0.3)), Math.floor(100 * (seed * 0.2)));
  }, [selectedDatabaseId]);

  const errorsData = useMemo(() => {
    const multiplier = selectedDatabaseId === 'all' ? 1 : 0.3;
    return generateMockData(24, Math.floor(5 * multiplier), Math.floor(8 * multiplier));
  }, [selectedDatabaseId]);

  const latencyData = useMemo(() => {
    return generateMockData(24, 45, 30);
  }, []);

  // Calculate max values for scaling
  const apiMax = Math.max(...apiCallsData.map(d => d.value), 1);
  const queryMax = Math.max(...queriesData.map(d => d.value), 1);
  // Note: errorMax and latencyMax available for future use with tooltips

  // Calculate totals
  const totalApiCalls = apiCallsData.reduce((sum, d) => sum + d.value, 0);
  const avgLatency = Math.floor(latencyData.reduce((sum, d) => sum + d.value, 0) / latencyData.length);
  const totalQueries = queriesData.reduce((sum, d) => sum + d.value, 0);
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
            <ChartStatValue>{((totalErrors / totalQueries) * 100).toFixed(2)}%</ChartStatValue>
            <ChartStatLabel>Error Rate</ChartStatLabel>
          </ChartStat>
        </ChartStats>
      </ChartCard>
    </ChartsContainer>
  );
}
