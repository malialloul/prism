import { styled } from '@mui/material/styles';
import { Box, Button, Chip, IconButton } from '@mui/material';
import { getWorkspaceColors } from '../../../../styles/theme';

export const OpenApiWrapper = styled(Box)({
  display: 'flex',
  height: '100%',
  gap: '1rem',
  overflow: 'hidden',
});

export const ApiListPanel = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    width: '350px',
    minWidth: '350px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
  };
});

export const ApiListHeader = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.backgroundTertiary,
  };
});

export const ApiListTitle = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const ApiListContent = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '0.5rem',
});

export const ApiCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '0.75rem 1rem',
    marginBottom: '0.5rem',
    borderRadius: '0.5rem',
    backgroundColor: selected ? colors.backgroundHover : colors.background,
    border: `1px solid ${selected ? colors.primary : colors.border}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      borderColor: colors.primary,
    },
  };
});

export const ApiCardHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.5rem',
});

export const ApiCardTitle = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
});

export const ApiCardDescription = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textSecondary,
    marginBottom: '0.5rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
});

export const ApiCardPath = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.7rem',
    fontFamily: 'monospace',
    color: colors.textMuted,
    padding: '0.25rem 0.5rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
});

export const OperationBadge = styled(Chip)<{ operation?: string }>(({ operation }) => {
  const operationColors: Record<string, { bg: string; color: string }> = {
    SELECT: { bg: '#61affe20', color: '#61affe' },
    INSERT: { bg: '#49cc9020', color: '#49cc90' },
    UPDATE: { bg: '#fca13020', color: '#fca130' },
    DELETE: { bg: '#f93e3e20', color: '#f93e3e' },
  };
  const colors = operationColors[operation || 'SELECT'] || operationColors.SELECT;
  return {
    height: '20px',
    fontSize: '0.6rem',
    fontWeight: 700,
    backgroundColor: colors.bg,
    color: colors.color,
    '& .MuiChip-label': {
      padding: '0 6px',
    },
  };
});

export const TryItPanel = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
  };
});

export const TryItHeader = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.backgroundTertiary,
  };
});

export const TryItTitle = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const TryItContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const TryItSection = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem',
    borderBottom: `1px solid ${colors.border}`,
  };
});

export const SectionTitle = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  };
});

export const ParamInput = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
    '& label': {
      minWidth: '120px',
      fontSize: '0.8rem',
      fontWeight: 500,
      color: colors.text,
    },
    '& input': {
      flex: 1,
      padding: '0.5rem 0.75rem',
      borderRadius: '0.25rem',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: '0.8rem',
      '&:focus': {
        outline: 'none',
        borderColor: colors.primary,
      },
    },
  };
});

export const SqlViewSection = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem',
    borderBottom: `1px solid ${colors.border}`,
  };
});

export const SqlPreview = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '0.75rem',
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e2e' : '#f8f8f8',
    borderRadius: '0.5rem',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    overflowX: 'auto',
    border: `1px solid ${colors.border}`,
    color: colors.text,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  };
});

export const ExecuteButton = styled(Button)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.primary,
    color: '#fff',
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': {
      backgroundColor: colors.primary,
      opacity: 0.9,
    },
  };
});

export const DeleteButton = styled(IconButton)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    color: colors.textMuted,
    '&:hover': {
      color: '#f93e3e',
      backgroundColor: '#f93e3e10',
    },
  };
});

export const ResponseSection = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  padding: '1rem',
});

export const ResponseHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.75rem',
});

export const ResponseStatus = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'success',
})<{ success?: boolean }>(({ success }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem',
  backgroundColor: success ? '#49cc9020' : '#f93e3e20',
  color: success ? '#49cc90' : '#f93e3e',
}));

export const ResponseTime = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textMuted,
  };
});

export const ResponseBody = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    overflowY: 'auto',
    padding: '0.75rem',
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e2e' : '#f8f8f8',
    borderRadius: '0.5rem',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    border: `1px solid ${colors.border}`,
    color: colors.text,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  };
});

export const EmptyState = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: '2rem',
    color: colors.textMuted,
    gap: '1rem',
  };
});

export const EmptyStateTitle = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const EmptyStateSubtitle = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    color: colors.textSecondary,
    maxWidth: '300px',
    lineHeight: 1.6,
  };
});

export const ToggleSqlButton = styled(Button)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    textTransform: 'none',
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});
