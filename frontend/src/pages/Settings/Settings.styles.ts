import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getWorkspaceColors } from '../../styles/theme';

export const SettingsWrapper = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    minHeight: '100vh',
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column',
  };
});

export const SettingsHeader = styled(Box)(({ theme }) => {
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

export const SettingsLayout = styled(Box)({
  flex: 1,
  display: 'flex',
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
});

export const SettingsSidebar = styled(Box)(({ theme }) => {
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
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'danger',
})<{ active?: boolean; danger?: boolean }>(({ theme, active, danger }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  
  const getColors = () => {
    if (danger) {
      return {
        color: active ? colors.error : colors.textSecondary,
        bg: active ? colors.errorLight : 'transparent',
        hoverBg: colors.errorLight,
        hoverColor: colors.error,
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
    borderRight: active ? `2px solid ${danger ? colors.error : colors.primary}` : '2px solid transparent',
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

export const SettingsContent = styled(Box)({
  flex: 1,
  padding: '2rem',
  maxWidth: '700px',
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
  };
});

export const SectionHeader = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '1.25rem 1.5rem',
    borderBottom: `1px solid ${colors.border}`,
  };
});

export const SectionTitle = styled('h2')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  };
});

export const SectionDescription = styled('p')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.textSecondary,
    margin: '0.25rem 0 0 0',
  };
});

export const SectionBody = styled(Box)({
  padding: '1.5rem',
});

export const FormRow = styled(Box)({
  display: 'flex',
  gap: '1rem',
  marginBottom: '1rem',
  '&:last-child': {
    marginBottom: 0,
  },
});

export const FormGroup = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const FormLabel = styled('label')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
  };
});

export const ActionButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: 'primary' | 'secondary' | 'danger' }>(({ theme, variant = 'secondary' }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          color: 'white',
          border: 'none',
          '&:hover': {
            backgroundColor: colors.primaryHover,
          },
        };
      case 'danger':
        return {
          backgroundColor: colors.errorLight,
          color: colors.error,
          border: `1px solid ${colors.error}30`,
          '&:hover': {
            backgroundColor: colors.error,
            color: 'white',
          },
        };
      default:
        return {
          backgroundColor: colors.backgroundTertiary,
          color: colors.textSecondary,
          border: `1px solid ${colors.border}`,
          '&:hover': {
            backgroundColor: colors.backgroundHover,
            color: colors.text,
          },
        };
    }
  };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    ...getVariantStyles(),
  };
});
