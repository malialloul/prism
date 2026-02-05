import { styled } from '@mui/material/styles';
import { Box, Tabs, Tab, Chip } from '@mui/material';
import { getDashboardColors } from '../../styles/theme';

export const ApisPageWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  gap: '1rem',
});

export const ApisHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 0.5rem',
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '1rem',
  };
});

export const ApisTitle = styled('h2')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  };
});

export const ApisTabs = styled(Tabs)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    minHeight: 'auto',
    '& .MuiTabs-indicator': {
      backgroundColor: colors.primary,
      height: '2px',
    },
  };
});

export const ApisTab = styled(Tab)(({ theme }) => {
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
    '& .MuiTab-iconWrapper': {
      marginRight: '0.25rem',
    },
  };
});

export const ApisContent = styled(Box)({
  display: 'flex',
  flex: 1,
  gap: '1rem',
  minHeight: 0,
  overflow: 'hidden',
  width: '100%',
});



export const EndpointGroup = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
  };
});

export const EndpointGroupHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    backgroundColor: colors.backgroundTertiary,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const EndpointGroupTitle = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const EndpointItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: selected ? colors.backgroundHover : 'transparent',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const MethodBadge = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'method',
})<{ method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' }>(({ method }) => {
  const methodColors: Record<string, { bg: string; color: string }> = {
    GET: { bg: '#61affe20', color: '#61affe' },
    POST: { bg: '#49cc9020', color: '#49cc90' },
    PUT: { bg: '#fca13020', color: '#fca130' },
    PATCH: { bg: '#50e3c220', color: '#50e3c2' },
    DELETE: { bg: '#f93e3e20', color: '#f93e3e' },
  };
  const colors = methodColors[method] || methodColors.GET;
  return {
    height: '24px',
    minWidth: '60px',
    fontSize: '0.7rem',
    fontWeight: 700,
    backgroundColor: colors.bg,
    color: colors.color,
    borderRadius: '4px',
    '& .MuiChip-label': {
      padding: '0 8px',
    },
  };
});

export const EndpointPath = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
});

export const EndpointDescription = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textMuted,
  };
});

export const TryItPanel = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
  };
});

export const TryItHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.backgroundTertiary,
  };
});

export const TryItTitle = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const TryItEndpoint = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text,
  };
});

export const TryItBody = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const TryItSection = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem',
    borderBottom: `1px solid ${colors.border}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  };
});

export const SectionTitle = styled('h4')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 0.75rem 0',
  };
});

export const ParameterRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '0.5rem',
  '&:last-child': {
    marginBottom: 0,
  },
});

export const ParameterLabel = styled('label')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: colors.text,
    minWidth: '120px',
  };
});

export const ParameterInput = styled('input')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    padding: '0.5rem 0.75rem',
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    color: colors.text,
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary,
    },
    '&::placeholder': {
      color: colors.textMuted,
    },
  };
});

export const ParameterType = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.7rem',
    color: colors.textMuted,
    fontStyle: 'italic',
    minWidth: '60px',
  };
});

export const ExecuteButton = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: colors.primary,
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.primaryHover,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };
});

export const ResponseSection = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderTop: `1px solid ${colors.border}`,
  };
});

export const ResponseHeader = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    backgroundColor: colors.backgroundTertiary,
  };
});

export const ResponseStatus = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'success',
})<{ success?: boolean }>(({ success }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: success ? '#49cc90' : '#f93e3e',
}));

export const ResponseTime = styled('span')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    fontSize: '0.75rem',
    color: colors.textMuted,
  };
});

export const ResponseBody = styled('pre')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    margin: 0,
    padding: '1rem',
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };
});

export const EmptyTryIt = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textMuted,
    gap: '0.5rem',
  };
});

export const NoDatabaseMessage = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '1rem',
    color: colors.textMuted,
    textAlign: 'center',
    padding: '2rem',
  };
});

export const RequestBodyEditor = styled('textarea')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '100%',
    minHeight: '150px',
    padding: '0.75rem',
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    color: colors.text,
    resize: 'vertical',
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary,
    },
    '&::placeholder': {
      color: colors.textMuted,
    },
  };
});

export const FilterChip = styled(Chip)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    height: '28px',
    fontSize: '0.75rem',
    backgroundColor: colors.backgroundTertiary,
    color: colors.text,
    '& .MuiChip-deleteIcon': {
      color: colors.textMuted,
      fontSize: '1rem',
      '&:hover': {
        color: colors.text,
      },
    },
  };
});

export const FiltersContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: '0.5rem',
});

export const AddFilterButton = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    color: colors.primary,
    cursor: 'pointer',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});

export const SelectInput = styled('select')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    padding: '0.5rem 0.75rem',
    fontSize: '0.8rem',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    color: colors.text,
    cursor: 'pointer',
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary,
    },
  };
});
