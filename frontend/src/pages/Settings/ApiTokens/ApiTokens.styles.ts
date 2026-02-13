import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getWorkspaceColors } from '../../../styles/theme';

export const TokensContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const TokensHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
});

export const HeaderText = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    color: colors.textSecondary,
    lineHeight: 1.5,
  };
});

export const CreateButton = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: colors.primary,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.primaryHover,
    },
  };
});

export const TokenList = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem',
    padding: '1rem',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
  };
});

export const TokenItem = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    backgroundColor: colors.background,
    borderRadius: '0.375rem',
    border: `1px solid ${colors.border}`,
  };
});

export const TokenInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
});

export const TokenName = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text,
  };
});

export const TokenMeta = styled('span')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };
});

export const TokenPrefix = styled('code')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    backgroundColor: colors.backgroundTertiary,
    color: colors.textSecondary,
  };
});

export const RevokeButton = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.625rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.error,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.error}30`,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.error + '10',
      borderColor: colors.error,
    },
  };
});

export const EmptyState = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: colors.textSecondary,
    fontSize: '0.8125rem',
    textAlign: 'center',
  };
});

export const NewTokenDisplay = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: colors.success + '15',
    border: `1px solid ${colors.success}30`,
    borderRadius: '0.5rem',
  };
});

export const NewTokenLabel = styled('div')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: colors.success,
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  };
});

export const NewTokenValue = styled('div')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: colors.background,
    borderRadius: '0.375rem',
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
    color: colors.text,
    wordBreak: 'break-all',
  };
});

export const CopyButton = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    color: colors.textSecondary,
    flexShrink: 0,
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.text,
    },
  };
});

export const WarningText = styled('div')(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.warning,
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  };
});
