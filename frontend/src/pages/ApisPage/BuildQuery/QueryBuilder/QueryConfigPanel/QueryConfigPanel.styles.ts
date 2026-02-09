import { styled, alpha } from '@mui/material/styles';
import { Box, Paper, Typography, Accordion, AccordionSummary, AccordionDetails, Chip, TextField, Select, IconButton } from '@mui/material';

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

// ============================================================================
// SCROLLABLE CONTENT
// ============================================================================

export const PanelContent = styled(Box)({
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
});

// ============================================================================
// COLLAPSIBLE SECTION
// ============================================================================

export const Section = styled(Accordion)({
  backgroundColor: 'transparent',
  boxShadow: 'none',
  border: `1px solid ${colors.border}`,
  borderRadius: '8px !important',
  marginBottom: '8px',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: '0 0 8px 0',
    borderColor: colors.borderActive,
  },
});

export const SectionHeader = styled(AccordionSummary)({
  minHeight: '44px',
  padding: '0 12px',
  backgroundColor: 'transparent',
  borderRadius: '8px',
  '&.Mui-expanded': {
    minHeight: '44px',
    borderBottom: `1px solid ${colors.border}`,
    borderRadius: '8px 8px 0 0',
  },
  '& .MuiAccordionSummary-content': {
    margin: '8px 0',
    alignItems: 'center',
    gap: '8px',
  },
});

export const SectionIcon = styled(Box)({
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
  backgroundColor: alpha(colors.primary, 0.1),
  color: colors.primary,
  '& svg': {
    fontSize: '14px',
  },
});

export const SectionTitle = styled(Typography)({
  fontSize: '13px',
  fontWeight: 600,
  color: colors.text,
  flex: 1,
});

export const SectionBadge = styled(Chip)({
  height: '20px',
  fontSize: '11px',
  fontWeight: 600,
  backgroundColor: alpha(colors.primary, 0.1),
  color: colors.primary,
  '& .MuiChip-label': {
    padding: '0 8px',
  },
});

export const SectionContent = styled(AccordionDetails)({
  padding: '12px',
  backgroundColor: alpha(colors.background, 0.5),
});

export const DisabledOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  backgroundColor: alpha(colors.background, 0.7),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  zIndex: 10,
});

export const DisabledText = styled(Typography)({
  fontSize: '12px',
  color: colors.textMuted,
  fontStyle: 'italic',
});

// ============================================================================
// FIELD LIST (for Select Fields section)
// ============================================================================

export const FieldList = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const FieldItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragging',
})<{ isDragging?: boolean }>(({ isDragging }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 10px',
  backgroundColor: colors.background,
  borderRadius: '6px',
  border: `1px solid ${isDragging ? colors.primary : colors.border}`,
  cursor: 'grab',
  transition: 'all 0.15s ease',
  '&:hover': {
    borderColor: colors.borderActive,
    backgroundColor: colors.surfaceHover,
  },
  '&:active': {
    cursor: 'grabbing',
  },
}));

export const FieldDragHandle = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginRight: '8px',
  color: colors.textMuted,
  '& svg': {
    fontSize: '16px',
  },
});

export const FieldInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const FieldName = styled(Typography)({
  fontSize: '12px',
  fontWeight: 500,
  color: colors.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const FieldTable = styled(Typography)({
  fontSize: '10px',
  color: colors.textMuted,
});

export const FieldAlias = styled(TextField)({
  width: '100px',
  marginLeft: '8px',
  '& .MuiOutlinedInput-root': {
    backgroundColor: colors.surface,
    borderRadius: '4px',
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
    padding: '4px 8px',
    fontSize: '11px',
    color: colors.text,
    '&::placeholder': {
      color: colors.textMuted,
      opacity: 1,
    },
  },
});

export const FieldActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  marginLeft: '8px',
});

export const FieldActionButton = styled(IconButton)({
  padding: '4px',
  color: colors.textMuted,
  '&:hover': {
    color: colors.text,
    backgroundColor: alpha(colors.primary, 0.1),
  },
  '& svg': {
    fontSize: '14px',
  },
});

export const RemoveFieldButton = styled(IconButton)({
  padding: '4px',
  color: colors.textMuted,
  '&:hover': {
    color: colors.error,
    backgroundColor: alpha(colors.error, 0.1),
  },
  '& svg': {
    fontSize: '14px',
  },
});

// ============================================================================
// FILTER ROW
// ============================================================================

export const FilterRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 10px',
  backgroundColor: colors.background,
  borderRadius: '6px',
  border: `1px solid ${colors.border}`,
  marginBottom: '6px',
});

export const FilterLogic = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive?: boolean }>(({ isActive }) => ({
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
  backgroundColor: isActive ? alpha(colors.primary, 0.2) : alpha(colors.textMuted, 0.1),
  color: isActive ? colors.primary : colors.textMuted,
  transition: 'all 0.15s ease',
  '&:hover': {
    backgroundColor: alpha(colors.primary, 0.15),
    color: colors.primary,
  },
}));

export const FilterSelect = styled(Select)({
  flex: 1,
  minWidth: '100px',
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
    padding: '6px 10px',
    fontSize: '12px',
    color: colors.text,
  },
});

export const FilterInput = styled(TextField)({
  flex: 1,
  minWidth: '80px',
  '& .MuiOutlinedInput-root': {
    backgroundColor: colors.surface,
    borderRadius: '4px',
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
    padding: '6px 10px',
    fontSize: '12px',
    color: colors.text,
    '&::placeholder': {
      color: colors.textMuted,
      opacity: 1,
    },
  },
});

export const ParameterCheckbox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isChecked',
})<{ isChecked?: boolean }>(({ isChecked }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '10px',
  fontWeight: 500,
  cursor: 'pointer',
  backgroundColor: isChecked ? alpha(colors.warning, 0.1) : 'transparent',
  color: isChecked ? colors.warning : colors.textMuted,
  border: `1px solid ${isChecked ? colors.warning : 'transparent'}`,
  transition: 'all 0.15s ease',
  '&:hover': {
    backgroundColor: alpha(colors.warning, 0.1),
  },
}));

// ============================================================================
// AGGREGATION CHIP
// ============================================================================

export const AggregationChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected?: boolean }>(({ isSelected }) => ({
  height: '26px',
  fontSize: '11px',
  fontWeight: 600,
  backgroundColor: isSelected ? alpha(colors.primary, 0.2) : alpha(colors.textMuted, 0.1),
  color: isSelected ? colors.primary : colors.textMuted,
  border: `1px solid ${isSelected ? colors.primary : colors.border}`,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  '&:hover': {
    backgroundColor: alpha(colors.primary, 0.15),
    color: colors.primary,
    borderColor: colors.primary,
  },
  '& .MuiChip-label': {
    padding: '0 10px',
  },
}));

// ============================================================================
// GROUP BY ITEM
// ============================================================================

export const GroupByItem = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  backgroundColor: alpha(colors.primary, 0.1),
  borderRadius: '6px',
  marginRight: '6px',
  marginBottom: '6px',
});

export const GroupByText = styled(Typography)({
  fontSize: '12px',
  color: colors.text,
});

export const GroupByRemove = styled(IconButton)({
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

export const SuggestedGroupBy = styled(Box)({
  marginTop: '8px',
  padding: '8px',
  backgroundColor: alpha(colors.warning, 0.05),
  border: `1px dashed ${colors.warning}`,
  borderRadius: '6px',
});

export const SuggestedText = styled(Typography)({
  fontSize: '11px',
  color: colors.warning,
  marginBottom: '6px',
});

// ============================================================================
// SORTING ITEM
// ============================================================================

export const SortItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 10px',
  backgroundColor: colors.background,
  borderRadius: '6px',
  border: `1px solid ${colors.border}`,
  marginBottom: '6px',
});

export const SortDirection = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isAsc',
})<{ isAsc?: boolean }>(({ isAsc }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  backgroundColor: alpha(colors.primary, 0.1),
  color: colors.primary,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  '& svg': {
    fontSize: '16px',
  },
  '&:hover': {
    backgroundColor: alpha(colors.primary, 0.2),
  },
}));

// ============================================================================
// LIMIT/OFFSET
// ============================================================================

export const LimitOffsetRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

export const LimitLabel = styled(Typography)({
  fontSize: '12px',
  color: colors.textSecondary,
  minWidth: '50px',
});

export const LimitInput = styled(TextField)({
  width: '100px',
  '& .MuiOutlinedInput-root': {
    backgroundColor: colors.background,
    borderRadius: '6px',
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
    padding: '8px 12px',
    fontSize: '13px',
    color: colors.text,
    textAlign: 'center',
  },
});

// ============================================================================
// ADD BUTTON
// ============================================================================

export const AddButton = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '8px 12px',
  backgroundColor: 'transparent',
  border: `1px dashed ${colors.border}`,
  borderRadius: '6px',
  color: colors.textMuted,
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  '&:hover': {
    borderColor: colors.primary,
    color: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
  '& svg': {
    fontSize: '16px',
  },
});

// ============================================================================
// EMPTY STATE
// ============================================================================

export const EmptySection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  textAlign: 'center',
});

export const EmptySectionText = styled(Typography)({
  fontSize: '12px',
  color: colors.textMuted,
  lineHeight: 1.5,
});
