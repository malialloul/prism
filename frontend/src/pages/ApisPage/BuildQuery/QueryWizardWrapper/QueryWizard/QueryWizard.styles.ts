import { styled, alpha } from '@mui/material/styles';
import { Box, Paper, Button, TextField, Chip, IconButton, Select } from '@mui/material';

// ============================================================================
// LAYOUT
// ============================================================================

export const WizardContainer = styled(Box)({
  display: 'flex',
  height: '100%',
  width: '100%',
  backgroundColor: '#0a0a0f',
  overflow: 'hidden',
});

export const WizardMain = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  overflow: 'hidden',
});

export const WizardSidebar = styled(Box)({
  width: '360px',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  borderLeft: '1px solid #1e1e2e',
  backgroundColor: '#0d0d14',
});

// ============================================================================
// STEPPER
// ============================================================================

export const StepperContainer = styled(Box)({
  padding: '16px 24px',
  borderBottom: '1px solid #1e1e2e',
  backgroundColor: '#0d0d14',
});

export const StepperTrack = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const StepItem = styled(Box, {
  shouldForwardProp: (prop) => !['isActive', 'isCompleted', 'isClickable'].includes(prop as string),
})<{ isActive?: boolean; isCompleted?: boolean; isClickable?: boolean }>(
  ({ isActive, isCompleted, isClickable }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: isClickable ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? alpha('#667eea', 0.15) : 'transparent',
    '&:hover': isClickable ? {
      backgroundColor: isActive ? alpha('#667eea', 0.2) : alpha('#ffffff', 0.05),
    } : {},
  })
);

export const StepNumber = styled(Box, {
  shouldForwardProp: (prop) => !['isActive', 'isCompleted'].includes(prop as string),
})<{ isActive?: boolean; isCompleted?: boolean }>(
  ({ isActive, isCompleted }) => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: isCompleted
      ? '#22c55e'
      : isActive
      ? '#667eea'
      : '#2a2a3a',
    color: isCompleted || isActive ? '#ffffff' : '#71717a',
    transition: 'all 0.2s ease',
  })
);

export const StepLabel = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive?: boolean }>(({ isActive }) => ({
  fontSize: '13px',
  fontWeight: isActive ? 600 : 500,
  color: isActive ? '#e4e4e7' : '#71717a',
  whiteSpace: 'nowrap',
}));

export const StepConnector = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCompleted',
})<{ isCompleted?: boolean }>(({ isCompleted }) => ({
  flex: 1,
  height: '2px',
  backgroundColor: isCompleted ? '#22c55e' : '#2a2a3a',
  minWidth: '20px',
  maxWidth: '40px',
  transition: 'background-color 0.2s ease',
}));

// ============================================================================
// STEP CONTENT
// ============================================================================

export const StepContent = styled(Box)({
  flex: 1,
  overflow: 'auto',
  padding: '24px',
});

export const StepHeader = styled(Box)({
  marginBottom: '24px',
});

export const StepTitle = styled('h2')({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#e4e4e7',
  margin: 0,
  marginBottom: '8px',
});

export const StepDescription = styled('p')({
  fontSize: '0.9rem',
  color: '#71717a',
  margin: 0,
  lineHeight: 1.5,
});

export const StepInstructions = styled(Box)({
  padding: '12px 16px',
  backgroundColor: alpha('#667eea', 0.1),
  borderRadius: '8px',
  marginBottom: '20px',
  fontSize: '0.85rem',
  color: '#a5b4fc',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  '& svg': {
    marginTop: '2px',
    flexShrink: 0,
  },
});

// ============================================================================
// NAVIGATION
// ============================================================================

export const NavigationBar = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
  borderTop: '1px solid #1e1e2e',
  backgroundColor: '#0d0d14',
});

export const NavButton = styled(Button)<{ variant?: 'text' | 'outlined' | 'contained' }>(
  ({ variant }) => ({
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    textTransform: 'none',
    ...(variant === 'contained' && {
      backgroundColor: '#667eea',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#5a6fd6',
      },
      '&:disabled': {
        backgroundColor: '#2a2a3a',
        color: '#52525b',
      },
    }),
    ...(variant === 'text' && {
      color: '#71717a',
      '&:hover': {
        backgroundColor: alpha('#ffffff', 0.05),
        color: '#a1a1aa',
      },
    }),
    ...(variant === 'outlined' && {
      borderColor: '#3a3a4a',
      color: '#a1a1aa',
      '&:hover': {
        borderColor: '#667eea',
        backgroundColor: alpha('#667eea', 0.1),
      },
    }),
  })
);

// ============================================================================
// CARDS & ITEMS
// ============================================================================

export const SelectableCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected?: boolean }>(({ isSelected }) => ({
  padding: '16px',
  backgroundColor: isSelected ? alpha('#667eea', 0.1) : '#12121a',
  border: `1px solid ${isSelected ? '#667eea' : '#2a2a3a'}`,
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: isSelected ? '#667eea' : '#3f3f50',
    backgroundColor: isSelected ? alpha('#667eea', 0.15) : '#16161e',
  },
}));

export const CardTitle = styled(Box)({
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#e4e4e7',
  marginBottom: '4px',
});

export const CardSubtitle = styled(Box)({
  fontSize: '0.8rem',
  color: '#71717a',
});

export const CardMeta = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginTop: '8px',
  fontSize: '0.75rem',
  color: '#52525b',
});

export const ListContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const GridContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '12px',
});

// ============================================================================
// FORM ELEMENTS
// ============================================================================

export const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#12121a',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#2a2a3a',
    },
    '&:hover fieldset': {
      borderColor: '#3f3f50',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
    },
  },
  '& .MuiInputBase-input': {
    color: '#e4e4e7',
    fontSize: '0.9rem',
    padding: '12px 14px',
  },
  '& .MuiInputLabel-root': {
    color: '#71717a',
  },
});

export const FormField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#0a0a0f',
    borderRadius: '6px',
    '& fieldset': {
      borderColor: '#2a2a3a',
    },
    '&:hover fieldset': {
      borderColor: '#3f3f50',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
    },
  },
  '& .MuiInputBase-input': {
    color: '#e4e4e7',
    fontSize: '0.85rem',
  },
  '& .MuiInputLabel-root': {
    color: '#71717a',
    fontSize: '0.85rem',
  },
  '& .MuiFormHelperText-root': {
    color: '#52525b',
    fontSize: '0.75rem',
  },
});

export const StyledSelect = styled(Select)({
  backgroundColor: '#0a0a0f',
  borderRadius: '6px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#2a2a3a',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#3f3f50',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#667eea',
  },
  '& .MuiSelect-select': {
    color: '#e4e4e7',
    fontSize: '0.85rem',
  },
  '& .MuiSvgIcon-root': {
    color: '#71717a',
  },
});

// ============================================================================
// BADGES & CHIPS
// ============================================================================

export const Badge = styled(Chip)<{ colorVariant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' }>(
  ({ colorVariant = 'neutral' }) => {
    const colors = {
      primary: { bg: alpha('#667eea', 0.15), text: '#a5b4fc' },
      success: { bg: alpha('#22c55e', 0.15), text: '#86efac' },
      warning: { bg: alpha('#f59e0b', 0.15), text: '#fcd34d' },
      error: { bg: alpha('#ef4444', 0.15), text: '#fca5a5' },
      neutral: { bg: '#2a2a3a', text: '#a1a1aa' },
    };
    const { bg, text } = colors[colorVariant];
    return {
      backgroundColor: bg,
      color: text,
      fontSize: '0.75rem',
      fontWeight: 500,
      height: '24px',
      '& .MuiChip-label': {
        padding: '0 10px',
      },
    };
  }
);

export const TypeBadge = styled(Box)({
  fontSize: '0.7rem',
  fontWeight: 500,
  color: '#71717a',
  backgroundColor: '#1e1e2e',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'monospace',
});

// ============================================================================
// JOIN VISUAL
// ============================================================================

export const JoinVisual = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  backgroundColor: '#12121a',
  borderRadius: '10px',
  border: '1px solid #2a2a3a',
});

export const JoinTable = styled(Box)({
  flex: 1,
  padding: '12px',
  backgroundColor: '#0a0a0f',
  borderRadius: '8px',
  border: '1px solid #2a2a3a',
});

export const JoinTableName = styled(Box)({
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#e4e4e7',
  marginBottom: '8px',
});

export const JoinArrow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  color: '#667eea',
  fontSize: '1.5rem',
});

// ============================================================================
// SQL PREVIEW SIDEBAR
// ============================================================================

export const PreviewHeader = styled(Box)({
  padding: '16px',
  borderBottom: '1px solid #1e1e2e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const PreviewTitle = styled(Box)({
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#e4e4e7',
});

export const PreviewContent = styled(Box)({
  flex: 1,
  overflow: 'auto',
  padding: '16px',
});

export const SqlCode = styled('pre')({
  margin: 0,
  padding: '16px',
  backgroundColor: '#0a0a0f',
  borderRadius: '8px',
  fontSize: '0.8rem',
  lineHeight: 1.6,
  fontFamily: '"Fira Code", "JetBrains Mono", monospace',
  color: '#e4e4e7',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  border: '1px solid #1e1e2e',
});

export const ValidationList = styled(Box)({
  marginTop: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const ValidationItem = styled(Box)<{ severity: 'error' | 'warning' | 'info' }>(
  ({ severity }) => {
    const colors = {
      error: { bg: alpha('#ef4444', 0.1), border: alpha('#ef4444', 0.3), text: '#fca5a5', icon: '#ef4444' },
      warning: { bg: alpha('#f59e0b', 0.1), border: alpha('#f59e0b', 0.3), text: '#fcd34d', icon: '#f59e0b' },
      info: { bg: alpha('#667eea', 0.1), border: alpha('#667eea', 0.3), text: '#a5b4fc', icon: '#667eea' },
    };
    const { bg, border, text } = colors[severity];
    return {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '10px 12px',
      backgroundColor: bg,
      border: `1px solid ${border}`,
      borderRadius: '6px',
      fontSize: '0.8rem',
      color: text,
      '& svg': {
        marginTop: '2px',
        flexShrink: 0,
      },
    };
  }
);

// ============================================================================
// EMPTY STATES
// ============================================================================

export const EmptyState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 24px',
  textAlign: 'center',
});

export const EmptyIcon = styled(Box)({
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: '#1e1e2e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  color: '#52525b',
  '& svg': {
    fontSize: '28px',
  },
});

export const EmptyTitle = styled(Box)({
  fontSize: '1rem',
  fontWeight: 600,
  color: '#a1a1aa',
  marginBottom: '8px',
});

export const EmptyText = styled(Box)({
  fontSize: '0.85rem',
  color: '#71717a',
  maxWidth: '300px',
});

// ============================================================================
// MISC
// ============================================================================

export const Divider = styled(Box)({
  height: '1px',
  backgroundColor: '#1e1e2e',
  margin: '16px 0',
});

export const ActionButton = styled(IconButton)({
  color: '#71717a',
  padding: '6px',
  '&:hover': {
    backgroundColor: alpha('#ffffff', 0.05),
    color: '#a1a1aa',
  },
});

export const RemoveButton = styled(IconButton)({
  color: '#71717a',
  padding: '4px',
  '&:hover': {
    backgroundColor: alpha('#ef4444', 0.1),
    color: '#ef4444',
  },
});
