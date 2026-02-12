import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const AboutWrapper = styled(Box)(({ theme }) => ({
  padding: '5rem 0',
  backgroundColor: theme.palette.background.default,
}));

export const HeaderBox = styled(Box)({
  textAlign: 'center',
  marginBottom: '3rem',
});

export const ContentBox = styled(Box)(({ theme }) => ({
  maxWidth: '800px',
  margin: '0 auto',
  textAlign: 'center',
  padding: '2rem',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  border: `1px solid ${theme.palette.divider}`,
}));

export const HighlightText = styled('span')(({ theme }) => ({
  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}));
