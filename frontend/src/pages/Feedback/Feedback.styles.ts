import { styled } from '@mui/material/styles';
import { Box, TextField, Button, Chip } from '@mui/material';
import { getWorkspaceColors } from '../../styles/theme';

export const FeedbackWrapper = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    minHeight: '100vh',
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column',
  };
});

export const FeedbackHeader = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: colors.backgroundSecondary,
    borderBottom: `1px solid ${colors.border}`,
    backdropFilter: 'blur(12px)',
  };
});

export const FeedbackLayout = styled(Box)({
  flex: 1,
  display: 'flex',
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
});

export const FeedbackSidebar = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    width: '260px',
    flexShrink: 0,
    borderRight: `1px solid ${colors.border}`,
    padding: '1.5rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  };
});

export const SidebarItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'adminOnly',
})<{ active?: boolean; adminOnly?: boolean }>(({ theme, active, adminOnly }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  
  const getColors = () => {
    if (adminOnly) {
      return {
        color: active ? colors.warning : colors.textSecondary,
        bg: active ? colors.warningLight : 'transparent',
        hoverBg: colors.warningLight,
        hoverColor: colors.warning,
      };
    }
    return {
      color: active ? colors.primary : colors.textSecondary,
      bg: active ? colors.primaryLight : 'transparent',
      hoverBg: colors.backgroundHover,
      hoverColor: colors.text,
    };
  };

  const itemColors = getColors();

  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    color: itemColors.color,
    backgroundColor: itemColors.bg,
    fontWeight: active ? 500 : 400,
    fontSize: '0.875rem',
    transition: 'all 0.15s ease',
    borderRight: active ? `2px solid ${adminOnly ? colors.warning : colors.primary}` : '2px solid transparent',
    '&:hover': {
      backgroundColor: active ? itemColors.bg : itemColors.hoverBg,
      color: active ? itemColors.color : itemColors.hoverColor,
    },
  };
});

export const SidebarDivider = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    height: '1px',
    backgroundColor: colors.border,
    margin: '0.75rem 1.5rem',
  };
});

export const FeedbackContent = styled(Box)({
  flex: 1,
  padding: '2rem',
  minWidth: 0, // Allow flex shrinking
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  overflow: 'auto',
});

export const PageTitle = styled('h1')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: colors.text,
    margin: '0 0 0.5rem 0',
  };
});

export const PageSubtitle = styled('p')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    color: colors.textSecondary,
    margin: 0,
  };
});

export const SectionCard = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.backgroundCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0, // Allow proper flex behavior
  };
});

export const SectionBody = styled(Box)({
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0, // Allow proper scrolling
  overflow: 'auto',
});

export const StyledTextField = styled(TextField)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    '& .MuiOutlinedInput-root': {
      backgroundColor: colors.backgroundSecondary,
      color: colors.text,
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      '& fieldset': {
        borderColor: colors.border,
      },
      '&:hover fieldset': {
        borderColor: colors.borderLight,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary,
      },
    },
    '& .MuiInputLabel-root': {
      color: colors.textSecondary,
      fontSize: '0.875rem',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: colors.primary,
    },
  };
});

export const TypeSelector = styled(Box)(() => {
  return {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
    '& .MuiChip-root': {
      borderRadius: '0.5rem',
      fontSize: '0.8125rem',
      fontWeight: 500,
      height: '36px',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    },
  };
});

export const TypeChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: selected ? colors.primaryLight : colors.backgroundSecondary,
    color: selected ? colors.primary : colors.textSecondary,
    border: `1px solid ${selected ? colors.primary : colors.border}`,
    '&:hover': {
      backgroundColor: selected ? colors.primaryLight : colors.backgroundHover,
      color: selected ? colors.primary : colors.text,
    },
  };
});

export const SubmitButton = styled(Button)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.primary,
    color: '#ffffff',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: colors.primaryHover,
    },
    '&:disabled': {
      backgroundColor: colors.backgroundHover,
      color: colors.textMuted,
    },
  };
});

export const FeedbackList = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  flex: 1,
  minHeight: 0, // Allow proper scrolling
});

export const FeedbackItem = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.backgroundSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '1.25rem',
    transition: 'all 0.15s ease',
    '&:hover': {
      borderColor: colors.borderLight,
    },
  };
});

export const FeedbackItemHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '0.75rem',
  gap: '1rem',
});

export const FeedbackItemTitle = styled('h3')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text,
    margin: 0,
    flex: 1,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  };
});

export const FeedbackItemDescription = styled('p')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    color: colors.textSecondary,
    margin: 0,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  };
});

export const FeedbackItemMeta = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
    paddingTop: '0.75rem',
    borderTop: `1px solid ${colors.border}`,
    fontSize: '0.75rem',
    color: colors.textTertiary,
  };
});

export const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'statusType',
})<{ statusType?: 'pending' | 'reviewed' | 'in-progress' | 'completed' | 'rejected' }>(({ theme, statusType }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  
  const statusColors: Record<string, { bg: string; color: string; border: string }> = {
    pending: { bg: colors.warningLight, color: colors.warning, border: colors.warning },
    reviewed: { bg: colors.infoLight, color: colors.info, border: colors.info },
    'in-progress': { bg: colors.primaryLight, color: colors.primary, border: colors.primary },
    completed: { bg: colors.successLight, color: colors.success, border: colors.success },
    rejected: { bg: colors.backgroundHover, color: colors.textMuted, border: colors.border },
  };

  const s = statusColors[statusType || 'pending'];

  return {
    backgroundColor: s.bg,
    color: s.color,
    border: `1px solid ${s.border}`,
    borderRadius: '0.375rem',
    fontSize: '0.6875rem',
    fontWeight: 600,
    height: '24px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  };
});

export const TypeBadge = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'feedbackType',
})<{ feedbackType?: 'bug' | 'feature' | 'improvement' | 'other' }>(({ theme, feedbackType }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  
  const typeColors = {
    bug: { bg: colors.errorLight, color: colors.error },
    feature: { bg: colors.primaryLight, color: colors.primary },
    improvement: { bg: colors.infoLight, color: colors.info },
    other: { bg: colors.backgroundHover, color: colors.textSecondary },
  };

  const t = typeColors[feedbackType || 'other'];

  return {
    backgroundColor: t.bg,
    color: t.color,
    borderRadius: '0.375rem',
    fontSize: '0.6875rem',
    fontWeight: 600,
    height: '24px',
  };
});

export const EmptyState = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    textAlign: 'center',
    color: colors.textSecondary,
    '& svg': {
      fontSize: '3rem',
      color: colors.textMuted,
      marginBottom: '1rem',
    },
    '& p': {
      margin: 0,
      fontSize: '0.875rem',
    },
  };
});

export const StatsGrid = styled(Box)(() => {
  return {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  };
});

export const StatCard = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.backgroundSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  };
});

export const StatValue = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: colors.text,
  };
});

export const StatLabel = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };
});

export const AdminActions = styled(Box)({
  display: 'flex',
  gap: '0.5rem',
  marginTop: '1rem',
});

export const AdminButton = styled(Button)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    padding: '0.375rem 0.75rem',
    textTransform: 'none',
    borderRadius: '0.375rem',
    fontWeight: 500,
    minWidth: 'unset',
    color: colors.textSecondary,
    borderColor: colors.border,
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      borderColor: colors.borderLight,
    },
  };
});
