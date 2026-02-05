import { styled } from "@mui/material/styles";
import { Box, Tabs, Tab, Button } from "@mui/material";
import { getDashboardColors } from "../../../styles/theme";

// Shared styled components (copied from DashboardPage.styles.ts)
export const ContentHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
});

export const ContentTitle = styled('h1')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  };
});

export const StyledTabs = styled(Tabs)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    minHeight: 'auto',
    '& .MuiTabs-indicator': {
      backgroundColor: colors.primary,
      height: '2px',
    },
  };
});

export const StyledTab = styled(Tab)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    minHeight: 'auto',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.textMuted,
    textTransform: 'none',
    '&.Mui-selected': {
      color: colors.primary,
    },
  };
});

export const QuickActionsBar = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const QuickActionButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: 'primary' | 'secondary' }>(({ theme, variant = 'secondary' }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.15s ease',
    ...(variant === 'primary' ? {
      backgroundColor: colors.primary,
      color: 'white',
      '&:hover': {
        backgroundColor: colors.primaryHover,
      },
    } : {
      backgroundColor: colors.backgroundTertiary,
      color: colors.textSecondary,
      border: `1px solid ${colors.border}`,
      '&:hover': {
        backgroundColor: colors.backgroundHover,
        color: colors.text,
      },
    }),
  };
});

export const TabPanel = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  gap: '1.5rem',
});

export const TabsContainer = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: '1rem',
  };
});

// Schema-specific styled components
export const SchemaWrapper = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === "dark");
  return {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: colors.background,
  };
});

export const SchemaContent = styled(Box)({
  flex: 1,
  display: "flex",
  overflow: "hidden",
});

export const SchemaExplorerPane = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === "dark");
  return {
    width: "320px",
    flexShrink: 0,
    borderRight: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.cardBg,
  };
});

export const SchemaDetailsPane = styled(Box)({
  flex: 1,
  overflow: "auto",
  padding: "1.5rem",
});

export const SchemaTabs = styled(Tabs)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === "dark");
  return {
    minHeight: "42px",
    "& .MuiTabs-indicator": {
      backgroundColor: colors.primary,
    },
  };
});

export const SchemaTab = styled(Tab)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === "dark");
  return {
    textTransform: "none",
    minHeight: "42px",
    fontSize: "0.875rem",
    color: colors.textMuted,
    "&.Mui-selected": {
      color: colors.primary,
    },
  };
});

export const SchemaActionButton = styled(Button)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === "dark");
  return {
    textTransform: "none",
    fontSize: "0.875rem",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    backgroundColor: colors.primary,
    color: "#fff",
    "&:hover": {
      backgroundColor: colors.primaryHover,
    },
  };
});

export const EmptyStateContainer = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === "dark");
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    textAlign: "center",
    color: colors.textMuted,
  };
});
