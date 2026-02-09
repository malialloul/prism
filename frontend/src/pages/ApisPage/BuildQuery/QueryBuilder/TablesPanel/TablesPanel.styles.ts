import { styled, alpha } from '@mui/material/styles';
import { Box, Paper, Typography, TextField, IconButton, Collapse } from '@mui/material';

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
  pkColor: '#f59e0b',
  fkColor: '#8b5cf6',
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
  padding: '16px',
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

export const TableCount = styled(Typography)({
  fontSize: '12px',
  color: colors.textSecondary,
  backgroundColor: alpha(colors.primary, 0.1),
  padding: '2px 8px',
  borderRadius: '10px',
});

// ============================================================================
// SEARCH
// ============================================================================

export const SearchContainer = styled(Box)({
  padding: '12px 16px',
  borderBottom: `1px solid ${colors.border}`,
});

export const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: colors.background,
    borderRadius: '8px',
    fontSize: '13px',
    '& fieldset': {
      borderColor: colors.border,
    },
    '&:hover fieldset': {
      borderColor: colors.borderActive,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '10px 12px',
    color: colors.text,
    '&::placeholder': {
      color: colors.textMuted,
      opacity: 1,
    },
  },
  '& .MuiInputAdornment-root': {
    color: colors.textMuted,
  },
});

// ============================================================================
// TABLE LIST
// ============================================================================

export const TableList = styled(Box)({
  flex: 1,
  overflow: 'auto',
  padding: '8px',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: colors.border,
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: colors.textMuted,
  },
});

export const TableItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded' && prop !== 'isOnCanvas',
})<{ isExpanded?: boolean; isOnCanvas?: boolean }>(({ isExpanded, isOnCanvas }) => ({
  marginBottom: '4px',
  borderRadius: '8px',
  border: `1px solid ${isExpanded ? colors.borderActive : colors.border}`,
  backgroundColor: isExpanded ? alpha(colors.primary, 0.05) : 'transparent',
  opacity: isOnCanvas ? 0.5 : 1,
  transition: 'all 0.15s ease',
  '&:hover': {
    borderColor: colors.borderActive,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

export const TableHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  cursor: 'pointer',
  userSelect: 'none',
});

export const TableIcon = styled(Box)({
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
  backgroundColor: alpha(colors.primary, 0.1),
  color: colors.primary,
  marginRight: '10px',
  '& svg': {
    fontSize: '16px',
  },
});

export const TableName = styled(Typography)({
  flex: 1,
  fontSize: '13px',
  fontWeight: 500,
  color: colors.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const ColumnCount = styled(Typography)({
  fontSize: '11px',
  color: colors.textMuted,
  marginRight: '8px',
});

export const ExpandIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded',
})<{ isExpanded?: boolean }>(({ isExpanded }) => ({
  color: colors.textMuted,
  transition: 'transform 0.2s ease',
  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
  '& svg': {
    fontSize: '18px',
  },
}));

export const AddButton = styled(IconButton)({
  padding: '4px',
  marginLeft: '4px',
  color: colors.textMuted,
  '&:hover': {
    color: colors.primary,
    backgroundColor: alpha(colors.primary, 0.1),
  },
});

// ============================================================================
// COLUMN LIST
// ============================================================================

export const ColumnList = styled(Collapse)({
  '& .MuiCollapse-wrapperInner': {
    padding: '0 8px 8px 8px',
  },
});

export const ColumnItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '6px 10px',
  marginTop: '2px',
  borderRadius: '6px',
  backgroundColor: colors.background,
  cursor: 'grab',
  transition: 'all 0.15s ease',
  '&:hover': {
    backgroundColor: colors.surfaceHover,
  },
  '&:active': {
    cursor: 'grabbing',
  },
});

export const ColumnIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPrimaryKey' && prop !== 'isForeignKey',
})<{ isPrimaryKey?: boolean; isForeignKey?: boolean }>(({ isPrimaryKey, isForeignKey }) => ({
  width: '18px',
  height: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '8px',
  '& svg': {
    fontSize: '12px',
    color: isPrimaryKey ? colors.pkColor : isForeignKey ? colors.fkColor : colors.textMuted,
  },
}));

export const ColumnName = styled(Typography)({
  flex: 1,
  fontSize: '12px',
  color: colors.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const ColumnType = styled(Typography)({
  fontSize: '10px',
  color: colors.textMuted,
  backgroundColor: alpha(colors.textMuted, 0.1),
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  textTransform: 'lowercase',
});

export const KeyBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'keyType',
})<{ keyType: 'pk' | 'fk' }>(({ keyType }) => ({
  fontSize: '9px',
  fontWeight: 600,
  color: keyType === 'pk' ? colors.pkColor : colors.fkColor,
  backgroundColor: alpha(keyType === 'pk' ? colors.pkColor : colors.fkColor, 0.1),
  padding: '2px 4px',
  borderRadius: '3px',
  marginLeft: '6px',
}));

// ============================================================================
// EMPTY STATE
// ============================================================================

export const EmptyState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px 16px',
  textAlign: 'center',
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
// DRAG PREVIEW
// ============================================================================

export const DragPreview = styled(Box)({
  padding: '8px 12px',
  backgroundColor: colors.primary,
  color: '#fff',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 500,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  pointerEvents: 'none',
});
