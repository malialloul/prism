import { styled } from '@mui/material/styles';
import { Box, IconButton, Collapse } from '@mui/material';
import { getDashboardColors } from '../../../styles/theme';

export const ExplorerWrapper = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.backgroundCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '400px',
    overflow: 'hidden',
  };
});

export const ExplorerHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem 1.25rem',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };
});

export const ExplorerTitle = styled('h3')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const ExplorerContent = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '0.5rem',
});

export const TreeSection = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    marginBottom: '0.25rem',
  };
});

export const TreeSectionHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme, expanded }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const SectionIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'type',
})<{ type: 'table' | 'view' | 'index' | 'procedure' | 'function' }>(({ theme, type }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  const colorMap = {
    table: colors.primary,
    view: colors.info,
    index: colors.warning,
    procedure: colors.success,
    function: colors.secondary,
  };
  return {
    width: '1.25rem',
    height: '1.25rem',
    borderRadius: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colorMap[type]}20`,
    color: colorMap[type],
    fontSize: '0.625rem',
    fontWeight: 700,
  };
});

export const SectionName = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: colors.textSecondary,
    flex: 1,
  };
});

export const SectionCount = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.6875rem',
    color: colors.textMuted,
    backgroundColor: colors.backgroundTertiary,
    padding: '0.125rem 0.5rem',
    borderRadius: '0.25rem',
  };
});

export const TreeItemList = styled(Collapse)({
  paddingLeft: '1rem',
});

export const TreeItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    backgroundColor: selected ? colors.primaryLight : 'transparent',
    borderLeft: selected ? `2px solid ${colors.primary}` : '2px solid transparent',
    '&:hover': {
      backgroundColor: selected ? colors.primaryLight : colors.backgroundHover,
    },
  };
});

export const ItemName = styled('span', {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: selected ? colors.primary : colors.text,
    fontWeight: selected ? 500 : 400,
  };
});

export const ExpandIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme, expanded }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '1rem',
    height: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textMuted,
    transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s ease',
    fontSize: '0.75rem',
  };
});

// Details Panel Styles
export const DetailsPanel = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.backgroundCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '400px',
    overflow: 'hidden',
  };
});

export const DetailsPanelHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem 1.25rem',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };
});

export const DetailsTitle = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const DetailsTitleText = styled('h3')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: 0,
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const TypeBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'type',
})<{ type: 'table' | 'view' | 'index' | 'procedure' | 'function' }>(({ theme, type }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  const colorMap = {
    table: colors.primary,
    view: colors.info,
    index: colors.warning,
    procedure: colors.success,
    function: colors.secondary,
  };
  return {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.625rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    backgroundColor: `${colorMap[type]}20`,
    color: colorMap[type],
  };
});

export const DetailsPanelContent = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '1rem 1.25rem',
});

export const DetailsSection = styled(Box)({
  marginBottom: '1.5rem',
  '&:last-child': {
    marginBottom: 0,
  },
});

export const DetailsSectionTitle = styled('h4')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    margin: '0 0 0.75rem 0',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };
});

export const ColumnsTable = styled('table')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8125rem',
    '& th': {
      textAlign: 'left',
      padding: '0.5rem 0.75rem',
      backgroundColor: colors.backgroundTertiary,
      color: colors.textSecondary,
      fontWeight: 500,
      fontSize: '0.6875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      '&:first-of-type': {
        borderRadius: '0.375rem 0 0 0.375rem',
      },
      '&:last-of-type': {
        borderRadius: '0 0.375rem 0.375rem 0',
      },
    },
    '& td': {
      padding: '0.625rem 0.75rem',
      borderBottom: `1px solid ${colors.border}`,
      color: colors.text,
    },
    '& tr:last-child td': {
      borderBottom: 'none',
    },
  };
});

export const ColumnBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'primary' | 'foreign' | 'nullable' | 'type' }>(({ theme, variant }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  const styles = {
    primary: {
      backgroundColor: colors.warningLight,
      color: colors.warning,
    },
    foreign: {
      backgroundColor: colors.infoLight,
      color: colors.info,
    },
    nullable: {
      backgroundColor: colors.backgroundTertiary,
      color: colors.textMuted,
    },
    type: {
      backgroundColor: colors.primaryLight,
      color: colors.primary,
    },
  };
  return {
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontSize: '0.6875rem',
    fontWeight: 500,
    ...styles[variant],
  };
});

export const DataTable = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    overflowX: 'auto',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.75rem',
      fontFamily: 'monospace',
    },
    '& th': {
      textAlign: 'left',
      padding: '0.5rem',
      backgroundColor: colors.backgroundTertiary,
      color: colors.textSecondary,
      fontWeight: 500,
      borderBottom: `1px solid ${colors.border}`,
      whiteSpace: 'nowrap',
    },
    '& td': {
      padding: '0.5rem',
      borderBottom: `1px solid ${colors.border}`,
      color: colors.text,
      maxWidth: '200px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '& tr:last-child td': {
      borderBottom: 'none',
    },
    '& tr:hover td': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const ActionButton = styled(IconButton)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.375rem',
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.text,
    },
  };
});

export const EmptyState = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: colors.textMuted,
    textAlign: 'center',
    '& svg': {
      fontSize: '3rem',
      marginBottom: '1rem',
      opacity: 0.5,
    },
  };
});

export const StatRow = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  };
});

export const StatItem = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.375rem',
    '& span:first-of-type': {
      color: colors.textMuted,
      fontSize: '0.75rem',
    },
    '& span:last-of-type': {
      color: colors.text,
      fontWeight: 500,
      fontSize: '0.8125rem',
    },
  };
});

export const ForeignKeyLink = styled('button')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: colors.infoLight,
    color: colors.info,
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.info,
      color: 'white',
    },
  };
});
