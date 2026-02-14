import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { getWorkspaceColors } from "../../styles/theme";

export const WorkspaceWrapper = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === "dark");
  return {
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  };
});

export const WorkspaceHeader = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === "dark");
  return {
    position: "sticky",
    top: 0,
    zIndex: 100,
    backgroundColor: colors.backgroundSecondary,
    borderBottom: `1px solid ${colors.border}`,
    backdropFilter: "blur(12px)",
  };
});

export const WorkspaceBody = styled(Box)({
  display: "flex",
  flex: 1,
  minHeight: 0,
  height: "calc(100% - 64px)",
});

export const WorkspaceContent = styled(Box)({
  flex: 1,
  minHeight: 0,
  padding: "1.5rem",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
});

export const SwitchingOverlay = styled(Box)(({ theme }) => {
  return {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 0.7)"
        : "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };
});

export const SwitchingContent = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === "dark");
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem",
    padding: "2rem 3rem",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: "1rem",
    border: `1px solid ${colors.border}`,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  };
});

export const SwitchingTitle = styled("h2")(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === "dark");
  return {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  };
});

export const SwitchingSubtitle = styled("p")(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === "dark");
  return {
    fontSize: "0.875rem",
    color: colors.textSecondary,
    margin: 0,
    textAlign: "center",
  };
});
