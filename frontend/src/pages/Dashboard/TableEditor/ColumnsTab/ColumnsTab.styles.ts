import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { getDashboardColors } from '../../../../styles/theme';

export const ColumnsTabContent = styled(Box)(() => {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: '1rem 1.5rem',
    minHeight: '400px',
    maxHeight: '60vh',
  };
});

export const ColumnsTable = styled('table')(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8125rem',
    '& thead': {
      position: 'sticky',
      top: 0,
      zIndex: 2,
    },
    '& th': {
      padding: '0.75rem',
      textAlign: 'left',
      fontWeight: 600,
      color: colors.text,
      borderBottom: `2px solid ${colors.border}`,
      whiteSpace: 'nowrap',
      backgroundColor: colors.backgroundTertiary,
      position: 'relative',
      userSelect: 'none',
    },
    '& td': {
      padding: '0.5rem 0.75rem',
      borderBottom: `1px solid ${colors.border}`,
      color: colors.text,
      maxWidth: '300px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '& tbody tr:hover': {
      backgroundColor: colors.backgroundHover,
    },
  };
});
