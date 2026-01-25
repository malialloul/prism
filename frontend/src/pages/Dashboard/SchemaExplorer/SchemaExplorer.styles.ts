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

export const TreeSection = styled(Box)(() => {
  return {
    marginBottom: '0.25rem',
  };
});

export const TreeSectionHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme }) => {
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

export const SectionActions = styled(Box)({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
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
