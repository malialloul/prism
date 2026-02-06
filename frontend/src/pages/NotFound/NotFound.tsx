import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getDashboardColors } from '../../styles/theme';

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getDashboardColors(theme.palette.mode === 'dark');

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 80,
            color: colors.error,
          }}
        />
        
        <Typography variant="h1" sx={{ fontSize: 48, fontWeight: 700 }}>
          404
        </Typography>
        
        <Typography variant="h4" sx={{ color: colors.text }}>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" sx={{ color: colors.textSecondary }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard', { replace: true })}
          sx={{
            mt: 2,
            backgroundColor: colors.primary,
            '&:hover': {
              backgroundColor: colors.primary,
              opacity: 0.9,
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
