import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const ChartsContainer = styled(Box)({
  display: 'contents',
});

export const ChartCard = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.backgroundCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };
});

export const ChartHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const ChartTitle = styled('h3')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const ChartLegend = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

export const LegendItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
});

export const LegendDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ color }) => ({
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: '50%',
  backgroundColor: color,
}));

export const LegendLabel = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textSecondary,
  };
});

export const ChartContent = styled(Box)({
  flex: 1,
  minHeight: '200px',
  display: 'flex',
  alignItems: 'flex-end',
  gap: '0.25rem',
  paddingTop: '1rem',
});

export const ChartBar = styled(Box, {
  shouldForwardProp: (prop) => !['height', 'color', 'isHovered'].includes(prop as string),
})<{ height: number; color: string; isHovered?: boolean }>(({ height, color, isHovered }) => ({
  flex: 1,
  height: `${height}%`,
  backgroundColor: color,
  borderRadius: '0.25rem 0.25rem 0 0',
  opacity: isHovered ? 1 : 0.85,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    opacity: 1,
    transform: 'scaleY(1.02)',
    transformOrigin: 'bottom',
  },
}));

export const ChartLine = styled(Box)({
  position: 'relative',
  flex: 1,
  minHeight: '200px',
});

export const LinePath = styled('svg')({
  width: '100%',
  height: '100%',
  overflow: 'visible',
});

export const ChartAxis = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '0.5rem',
    borderTop: `1px solid ${colors.border}`,
  };
});

export const AxisLabel = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.6875rem',
    color: colors.textMuted,
  };
});

export const ChartTooltip = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    position: 'absolute',
    backgroundColor: colors.backgroundTertiary,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: 10,
    pointerEvents: 'none',
  };
});

export const TooltipValue = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const TooltipLabel = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textMuted,
    display: 'block',
    marginTop: '0.125rem',
  };
});

export const ChartStats = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    gap: '1.5rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${colors.border}`,
  };
});

export const ChartStat = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
});

export const ChartStatValue = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: colors.text,
  };
});

export const ChartStatLabel = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textMuted,
  };
});

export const TimeRangeSelector = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
  };
});

export const TimeRangeButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    border: 'none',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: active ? colors.primary : 'transparent',
    color: active ? 'white' : colors.textSecondary,
    '&:hover': {
      backgroundColor: active ? colors.primaryHover : colors.backgroundHover,
    },
  };
});
