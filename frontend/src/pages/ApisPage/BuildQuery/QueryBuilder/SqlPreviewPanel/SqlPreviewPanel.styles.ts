import { styled, alpha } from '@mui/material/styles';
import { Box, Paper, Typography, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// ============================================================================
// THEME COLORS
// ============================================================================

const colors = {
  background: '#0a0a0f',
  surface: '#12121a',
  surfaceHover: '#1a1a24',
  border: '#2a2a3a',
  borderActive: '#667eea',
  text: '#e4e4e7',
  textSecondary: '#71717a',
  textMuted: '#52525b',
  primary: '#667eea',
  primaryHover: '#7c8ff2',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// SQL Syntax colors
const syntaxColors = {
  keyword: '#c084fc',
  function: '#f472b6',
  string: '#86efac',
  number: '#fbbf24',
  operator: '#60a5fa',
  table: '#22d3ee',
  column: '#e4e4e7',
  comment: '#6b7280',
};

// ============================================================================
// MAIN CONTAINER
// ============================================================================

export const PanelContainer = styled(Paper)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: colors.surface,
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
  overflow: 'hidden',
});

export const PanelHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: `1px solid ${colors.border}`,
  backgroundColor: colors.background,
});

export const PanelTitle = styled(Typography)({
  fontSize: '14px',
  fontWeight: 600,
  color: colors.text,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

export const PanelActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const ActionButton = styled(IconButton)({
  padding: '6px',
  color: colors.textMuted,
  '&:hover': {
    color: colors.text,
    backgroundColor: alpha(colors.primary, 0.1),
  },
  '& svg': {
    fontSize: '18px',
  },
});

// ============================================================================
// SQL CODE BLOCK
// ============================================================================

export const SqlContainer = styled(Box)({
  flex: 1,
  padding: '16px',
  overflow: 'auto',
  backgroundColor: colors.background,
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: colors.border,
    borderRadius: '4px',
  },
});

export const SqlCode = styled('pre')({
  margin: 0,
  padding: 0,
  fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
  fontSize: '13px',
  lineHeight: 1.6,
  color: colors.text,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

export const SqlKeyword = styled('span')({
  color: syntaxColors.keyword,
  fontWeight: 600,
});

export const SqlFunction = styled('span')({
  color: syntaxColors.function,
});

export const SqlString = styled('span')({
  color: syntaxColors.string,
});

export const SqlNumber = styled('span')({
  color: syntaxColors.number,
});

export const SqlOperator = styled('span')({
  color: syntaxColors.operator,
});

export const SqlTable = styled('span')({
  color: syntaxColors.table,
});

export const SqlColumn = styled('span')({
  color: syntaxColors.column,
});

export const SqlComment = styled('span')({
  color: syntaxColors.comment,
  fontStyle: 'italic',
});

export const SqlParameter = styled('span')({
  color: colors.warning,
  backgroundColor: alpha(colors.warning, 0.1),
  padding: '0 4px',
  borderRadius: '3px',
});

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================

export const ValidationContainer = styled(Box)({
  padding: '12px 16px',
  borderTop: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  maxHeight: '120px',
  overflow: 'auto',
});

export const ValidationMessage = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'severity',
})<{ severity: 'error' | 'warning' | 'info' }>(({ severity }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  padding: '6px 10px',
  marginBottom: '4px',
  borderRadius: '6px',
  backgroundColor:
    severity === 'error'
      ? alpha(colors.error, 0.1)
      : severity === 'warning'
      ? alpha(colors.warning, 0.1)
      : alpha(colors.info, 0.1),
  border: `1px solid ${
    severity === 'error'
      ? alpha(colors.error, 0.3)
      : severity === 'warning'
      ? alpha(colors.warning, 0.3)
      : alpha(colors.info, 0.3)
  }`,
}));

export const ValidationIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'severity',
})<{ severity: 'error' | 'warning' | 'info' }>(({ severity }) => ({
  color:
    severity === 'error'
      ? colors.error
      : severity === 'warning'
      ? colors.warning
      : colors.info,
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    fontSize: '16px',
  },
}));

export const ValidationText = styled(Typography)({
  fontSize: '12px',
  color: colors.text,
  flex: 1,
});

// ============================================================================
// PARAMETERS LIST
// ============================================================================

export const ParametersContainer = styled(Box)({
  padding: '12px 16px',
  borderTop: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
});

export const ParametersTitle = styled(Typography)({
  fontSize: '12px',
  fontWeight: 600,
  color: colors.textSecondary,
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

export const ParameterItem = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  backgroundColor: alpha(colors.warning, 0.1),
  border: `1px solid ${alpha(colors.warning, 0.3)}`,
  borderRadius: '6px',
  marginRight: '6px',
  marginBottom: '6px',
});

export const ParameterName = styled(Typography)({
  fontSize: '12px',
  fontWeight: 500,
  color: colors.warning,
});

export const ParameterType = styled(Typography)({
  fontSize: '10px',
  color: colors.textMuted,
  fontFamily: 'monospace',
});

// ============================================================================
// ACTION BUTTONS
// ============================================================================

export const ActionsContainer = styled(Box)({
  display: 'flex',
  gap: '8px',
  padding: '12px 16px',
  borderTop: `1px solid ${colors.border}`,
  backgroundColor: colors.background,
});

export const ExecuteButton = styled(Button)({
  flex: 1,
  backgroundColor: colors.success,
  color: '#fff',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: '#0d9668',
  },
  '&:disabled': {
    backgroundColor: alpha(colors.success, 0.3),
    color: alpha('#fff', 0.5),
  },
});

export const SaveButton = styled(Button)({
  flex: 1,
  backgroundColor: colors.primary,
  color: '#fff',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: colors.primaryHover,
  },
  '&:disabled': {
    backgroundColor: alpha(colors.primary, 0.3),
    color: alpha('#fff', 0.5),
  },
});

// ============================================================================
// RESULTS TABLE
// ============================================================================

export const ResultsContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const ResultsHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  borderBottom: `1px solid ${colors.border}`,
  backgroundColor: colors.background,
});

export const ResultsTitle = styled(Typography)({
  fontSize: '13px',
  fontWeight: 600,
  color: colors.text,
});

export const ResultsInfo = styled(Typography)({
  fontSize: '12px',
  color: colors.textSecondary,
});

export const ResultsTable = styled(TableContainer)({
  flex: 1,
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: colors.border,
    borderRadius: '4px',
  },
});

export const StyledTable = styled(Table)({
  '& .MuiTableCell-root': {
    borderColor: colors.border,
    padding: '8px 12px',
  },
});

export const StyledTableHead = styled(TableHead)({
  backgroundColor: colors.background,
  '& .MuiTableCell-head': {
    fontWeight: 600,
    fontSize: '12px',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    position: 'sticky',
    top: 0,
    backgroundColor: colors.background,
    zIndex: 1,
  },
});

export const StyledTableBody = styled(TableBody)({
  '& .MuiTableRow-root': {
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.05),
    },
  },
  '& .MuiTableCell-body': {
    fontSize: '12px',
    color: colors.text,
    fontFamily: 'monospace',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

// ============================================================================
// EMPTY STATE
// ============================================================================

export const EmptyState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px',
  textAlign: 'center',
  height: '100%',
});

export const EmptyIcon = styled(Box)({
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '12px',
  backgroundColor: alpha(colors.textMuted, 0.1),
  color: colors.textMuted,
  marginBottom: '12px',
  '& svg': {
    fontSize: '24px',
  },
});

export const EmptyText = styled(Typography)({
  fontSize: '13px',
  color: colors.textSecondary,
  lineHeight: 1.5,
});

// ============================================================================
// TABS
// ============================================================================

export const TabsContainer = styled(Box)({
  display: 'flex',
  borderBottom: `1px solid ${colors.border}`,
});

export const Tab = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive?: boolean }>(({ isActive }) => ({
  padding: '10px 16px',
  fontSize: '12px',
  fontWeight: 600,
  color: isActive ? colors.primary : colors.textMuted,
  borderBottom: `2px solid ${isActive ? colors.primary : 'transparent'}`,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  '&:hover': {
    color: colors.text,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));
