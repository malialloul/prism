import { styled } from '@mui/material/styles';
import { TextField, Select } from '@mui/material';

export const SearchContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  maxWidth: '300px',
  marginRight: '1rem',
});

export const SearchInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#f3f4f6',
    border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
    '&:hover': {
      borderColor: theme.palette.mode === 'dark' ? '#4b5563' : '#d1d5db',
    },
    '&.Mui-focused': {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#ffffff',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
  },
}));

export const SortContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

export const SortSelect = styled(Select)(({ theme }) => ({
  minWidth: '120px',
  backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#f3f4f6',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? '#4b5563' : '#d1d5db',
  },
}));

