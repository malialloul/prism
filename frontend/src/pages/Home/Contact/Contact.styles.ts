import { styled } from '@mui/material/styles';
import { Box, TextField, Button } from '@mui/material';

export const ContactWrapper = styled(Box)(({ theme }) => ({
  padding: '5rem 0',
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.background.paper 
    : '#f8fafc',
}));

export const HeaderBox = styled(Box)({
  textAlign: 'center',
  marginBottom: '3rem',
});

export const FormContainer = styled(Box)(({ theme }) => ({
  maxWidth: '600px',
  margin: '0 auto',
  padding: '2.5rem',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 24px rgba(0, 0, 0, 0.3)'
    : '0 4px 24px rgba(0, 0, 0, 0.08)',
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: '1.5rem',
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.03)' 
      : 'rgba(0,0,0,0.02)',
  },
}));

export const SubmitButton = styled(Button)({
  padding: '12px 32px',
  fontSize: '1rem',
  fontWeight: 600,
  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    opacity: 0.6,
  },
});

export const HighlightText = styled('span')({
  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});
