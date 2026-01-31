import { styled } from '@mui/material/styles';
import { Box, Button, Paper } from '@mui/material';

export const QueryBuilderWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  backgroundColor: theme.palette.mode === 'dark' ? '#0a0e1a' : '#fafafa',
}));

export const Header = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#141825' : 'white',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#1e293b' : '#e0e0e0'}`,
  padding: '20px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 1px 4px rgba(0, 0, 0, 0.3)' 
    : '0 1px 4px rgba(0, 0, 0, 0.08)',
  gap: '16px',
}));

export const Title = styled(Box)(({ theme }) => ({
  margin: 0,
  fontSize: '20px',
  fontWeight: 600,
  color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1a1a1a',
}));

export const SaveButton = styled(Button)({
  backgroundColor: '#2196f3',
  color: 'white',

  '&:hover': {
    backgroundColor: '#1976d2',
  },

  '&:disabled': {
    backgroundColor: '#ccc',
  },
});

export const Canvas = styled('svg')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#0f1629' : 'white',
  flex: 1,
  display: 'block',
  overflow: 'visible',
  width: '100%',
  height: '100%',
  minHeight: 500,
}));

export const TableCard = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1f35' : 'white',
  borderRadius: '8px',
  padding: '16px',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#334155' : '#e0e0e0'}`,
  minWidth: '240px',
  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',

  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 12px rgba(0,0,0,0.4)' 
      : '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

export const TableCardTitle = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 600,
  color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1a1a1a',
  flex: 1,
}));

export const TableCardFields = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '300px',
  overflowY: 'auto',

  scrollbarWidth: 'thin',
  scrollbarColor: theme.palette.mode === 'dark' ? '#475569 #1a1f35' : '#ccc #f5f5f5',

  '&::-webkit-scrollbar': {
    width: '6px',
  },

  '&::-webkit-scrollbar-track': {
    background: theme.palette.mode === 'dark' ? '#1a1f35' : '#f5f5f5',
    borderRadius: '3px',
  },

  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'dark' ? '#475569' : '#ccc',
    borderRadius: '3px',

    '&:hover': {
      background: theme.palette.mode === 'dark' ? '#64748b' : '#999',
    },
  },
}));

export const ConnectionPoint = styled(Box)<{ isSelected?: boolean }>(
  ({ isSelected }) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isSelected ? '#2196F3' : '#999',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  })
);

export const FieldItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px',
  borderRadius: '4px',
  transition: 'all 0.2s ease',
  cursor: 'grab',

  '&:active': {
    cursor: 'grabbing',
  },

  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#252b42' : '#e8e8e8',
  },
}));

export const EmptyStateMessage = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem 2rem',
  color: theme.palette.mode === 'dark' ? '#64748b' : '#999',

  '& p': {
    fontSize: '1.1rem',
    margin: 0,
  },
}));
