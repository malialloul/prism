import { styled, alpha, keyframes } from '@mui/material/styles';
import { Box, Paper, Typography, IconButton, Select } from '@mui/material';

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
  joinLine: '#667eea',
  canvasGrid: '#1a1a24',
};

// ============================================================================
// CANVAS CONTAINER
// ============================================================================

export const CanvasContainer = styled(Paper)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: colors.surface,
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
  overflow: 'hidden',
});

export const CanvasHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: `1px solid ${colors.border}`,
  backgroundColor: colors.background,
});

export const CanvasTitle = styled(Typography)({
  fontSize: '14px',
  fontWeight: 600,
  color: colors.text,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

export const CanvasControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const ControlButton = styled(IconButton)({
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
// CANVAS VIEWPORT
// ============================================================================

export const CanvasViewport = styled(Box)({
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: colors.background,
  backgroundImage: `
    linear-gradient(${colors.canvasGrid} 1px, transparent 1px),
    linear-gradient(90deg, ${colors.canvasGrid} 1px, transparent 1px)
  `,
  backgroundSize: '20px 20px',
});

export const CanvasInner = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  transformOrigin: '0 0',
  willChange: 'transform',
});

// ============================================================================
// DROP ZONE
// ============================================================================

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
`;

export const DropZone = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragOver',
})<{ isDragOver?: boolean }>(({ isDragOver }) => ({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px dashed ${isDragOver ? colors.primary : colors.border}`,
  borderRadius: '8px',
  margin: '16px',
  backgroundColor: isDragOver ? alpha(colors.primary, 0.1) : 'transparent',
  transition: 'all 0.2s ease',
  pointerEvents: isDragOver ? 'auto' : 'none',
  opacity: isDragOver ? 1 : 0,
  zIndex: 100,
}));

export const DropZoneText = styled(Typography)({
  fontSize: '14px',
  color: colors.primary,
  fontWeight: 500,
});

// ============================================================================
// TABLE CARD ON CANVAS
// ============================================================================

export const TableCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected?: boolean }>(({ isSelected }) => ({
  position: 'absolute',
  width: '260px',
  backgroundColor: colors.surface,
  borderRadius: '10px',
  border: `2px solid ${isSelected ? colors.primary : colors.border}`,
  boxShadow: isSelected
    ? `0 0 0 3px ${alpha(colors.primary, 0.2)}, 0 8px 24px rgba(0, 0, 0, 0.4)`
    : '0 4px 12px rgba(0, 0, 0, 0.3)',
  overflow: 'hidden',
  cursor: 'move',
  userSelect: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  '&:hover': {
    borderColor: colors.borderActive,
  },
}));

export const TableCardHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  backgroundColor: alpha(colors.primary, 0.1),
  borderBottom: `1px solid ${colors.border}`,
});

export const TableCardIcon = styled(Box)({
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
  backgroundColor: colors.primary,
  color: '#fff',
  marginRight: '8px',
  '& svg': {
    fontSize: '14px',
  },
});

export const TableCardName = styled(Typography)({
  flex: 1,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const TableCardActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
});

export const TableCardButton = styled(IconButton)({
  padding: '4px',
  color: colors.textMuted,
  '&:hover': {
    color: colors.text,
    backgroundColor: alpha(colors.primary, 0.1),
  },
  '& svg': {
    fontSize: '16px',
  },
});

export const RemoveButton = styled(IconButton)({
  padding: '4px',
  color: colors.textMuted,
  '&:hover': {
    color: colors.error,
    backgroundColor: alpha(colors.error, 0.1),
  },
  '& svg': {
    fontSize: '16px',
  },
});

// ============================================================================
// TABLE CARD COLUMNS
// ============================================================================

export const TableCardColumns = styled(Box)({
  maxHeight: '240px',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: colors.border,
    borderRadius: '2px',
  },
});

export const ColumnRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isJoinColumn',
})<{ isSelected?: boolean; isJoinColumn?: boolean }>(({ isSelected, isJoinColumn }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  cursor: 'pointer',
  backgroundColor: isSelected
    ? alpha(colors.success, 0.1)
    : isJoinColumn
    ? alpha(colors.fkColor, 0.1)
    : 'transparent',
  borderLeft: isSelected
    ? `3px solid ${colors.success}`
    : isJoinColumn
    ? `3px solid ${colors.fkColor}`
    : '3px solid transparent',
  transition: 'all 0.1s ease',
  '&:hover': {
    backgroundColor: isSelected
      ? alpha(colors.success, 0.15)
      : alpha(colors.primary, 0.1),
  },
}));

export const ColumnCheckbox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isChecked',
})<{ isChecked?: boolean }>(({ isChecked }) => ({
  width: '16px',
  height: '16px',
  borderRadius: '4px',
  border: `2px solid ${isChecked ? colors.success : colors.border}`,
  backgroundColor: isChecked ? colors.success : 'transparent',
  marginRight: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
  '& svg': {
    fontSize: '12px',
    color: '#fff',
  },
}));

export const ColumnRowIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPrimaryKey' && prop !== 'isForeignKey',
})<{ isPrimaryKey?: boolean; isForeignKey?: boolean }>(({ isPrimaryKey, isForeignKey }) => ({
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '6px',
  '& svg': {
    fontSize: '12px',
    color: isPrimaryKey ? colors.pkColor : isForeignKey ? colors.fkColor : colors.textMuted,
  },
}));

export const ColumnRowName = styled(Typography)({
  flex: 1,
  fontSize: '12px',
  color: colors.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const ColumnRowType = styled(Typography)({
  fontSize: '10px',
  color: colors.textMuted,
  fontFamily: 'monospace',
  marginLeft: '8px',
});

// ============================================================================
// JOIN LINE SVG
// ============================================================================

export const JoinLinesSvg = styled('svg')({
  position: 'absolute',
  top: 0,
  left: 0,
  pointerEvents: 'none',
  overflow: 'visible',
});

export const JoinLine = styled('path', {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected?: boolean }>(({ isSelected }) => ({
  fill: 'none',
  stroke: isSelected ? colors.primary : colors.joinLine,
  strokeWidth: isSelected ? 3 : 2,
  strokeLinecap: 'round',
  filter: isSelected ? `drop-shadow(0 0 4px ${colors.primary})` : 'none',
  transition: 'stroke 0.15s ease, stroke-width 0.15s ease',
}));

export const JoinLineDot = styled('circle')({
  fill: colors.primary,
});

// ============================================================================
// JOIN BADGE ON LINE
// ============================================================================

export const JoinBadge = styled(Box)({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  zIndex: 10,
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.1),
  },
});

export const JoinBadgeText = styled(Typography)({
  fontSize: '10px',
  fontWeight: 600,
  color: colors.primary,
  textTransform: 'uppercase',
});

export const JoinBadgeDelete = styled(IconButton)({
  padding: '2px',
  color: colors.textMuted,
  '&:hover': {
    color: colors.error,
    backgroundColor: alpha(colors.error, 0.1),
  },
  '& svg': {
    fontSize: '12px',
  },
});

// ============================================================================
// JOIN DIALOG
// ============================================================================

export const JoinDialog = styled(Box)({
  position: 'absolute',
  width: '320px',
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
  zIndex: 100,
  overflow: 'hidden',
});

export const JoinDialogHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: colors.background,
  borderBottom: `1px solid ${colors.border}`,
});

export const JoinDialogTitle = styled(Typography)({
  fontSize: '13px',
  fontWeight: 600,
  color: colors.text,
});

export const JoinDialogContent = styled(Box)({
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const JoinTypeSelect = styled(Select)({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.border,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.borderActive,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary,
  },
  '& .MuiSelect-select': {
    padding: '10px 12px',
    fontSize: '13px',
    color: colors.text,
  },
});

export const JoinColumnSelector = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const JoinColumnSelect = styled(Select)({
  flex: 1,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.border,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.borderActive,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary,
  },
  '& .MuiSelect-select': {
    padding: '8px 12px',
    fontSize: '12px',
    color: colors.text,
  },
});

export const JoinEqualsIcon = styled(Box)({
  color: colors.textMuted,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    fontSize: '18px',
  },
});

export const JoinDialogActions = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  padding: '12px 16px',
  borderTop: `1px solid ${colors.border}`,
  backgroundColor: colors.background,
});

// ============================================================================
// EMPTY CANVAS STATE
// ============================================================================

export const EmptyCanvasState = styled(Box)({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '24px',
});

export const EmptyCanvasIcon = styled(Box)({
  width: '64px',
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '16px',
  backgroundColor: alpha(colors.textMuted, 0.1),
  color: colors.textMuted,
  marginBottom: '16px',
  '& svg': {
    fontSize: '32px',
  },
});

export const EmptyCanvasTitle = styled(Typography)({
  fontSize: '16px',
  fontWeight: 600,
  color: colors.text,
  marginBottom: '8px',
});

export const EmptyCanvasText = styled(Typography)({
  fontSize: '13px',
  color: colors.textSecondary,
  lineHeight: 1.5,
  maxWidth: '300px',
});

// ============================================================================
// ZOOM INDICATOR
// ============================================================================

export const ZoomIndicator = styled(Box)({
  position: 'absolute',
  bottom: '12px',
  right: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  backgroundColor: alpha(colors.surface, 0.9),
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  backdropFilter: 'blur(4px)',
});

export const ZoomText = styled(Typography)({
  fontSize: '12px',
  fontWeight: 500,
  color: colors.textSecondary,
  minWidth: '40px',
  textAlign: 'center',
});
