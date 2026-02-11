import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { setAuthToken, clearAuthToken, getAuthToken } from '../../api/httpClient';
import { toastService } from '../../services';
import { ROUTES } from '../../constants';

const Container = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
  color: '#fff',
});

const Card = styled(Box)({
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '3rem',
  textAlign: 'center',
  maxWidth: '400px',
});

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(decodeURIComponent(error));
        toastService.error(decodeURIComponent(error));
        setTimeout(() => {
          window.location.href = ROUTES.SIGN_IN;
        }, 2000);
        return;
      }

      if (token) {
        // Clear any existing auth state first (may have stale shared access token)
        clearAuthToken();

        // Small delay to ensure cookie is cleared
        await new Promise(resolve => setTimeout(resolve, 50));

        // Store the new token
        setAuthToken(token);

        // Verify token was set correctly
        const verifyToken = getAuthToken();
        if (verifyToken !== token) {
          console.error('Token verification failed');
          setStatus('error');
          setErrorMessage('Failed to save authentication token');
          setTimeout(() => {
            window.location.href = ROUTES.SIGN_IN;
          }, 2000);
          return;
        }

        setStatus('success');
        toastService.success('Successfully signed in!');

        // Redirect to dashboard with full page reload to reset all React state
        setTimeout(() => {
          window.location.href = ROUTES.DASHBOARD.ROOT;
        }, 500);
      } else {
        setStatus('error');
        setErrorMessage('No token received from authentication');
        setTimeout(() => {
          window.location.href = ROUTES.SIGN_IN;
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <Container>
      <Card>
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ color: '#667eea', mb: 2 }} />
            <Typography variant="h6">Completing sign in...</Typography>
          </>
        )}
        {status === 'success' && (
          <>
            <Typography variant="h6" sx={{ color: '#4caf50', mb: 1 }}>
              ✓ Successfully signed in!
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Redirecting to dashboard...
            </Typography>
          </>
        )}
        {status === 'error' && (
          <>
            <Typography variant="h6" sx={{ color: '#f44336', mb: 1 }}>
              Authentication Failed
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {errorMessage || 'An error occurred during authentication'}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1, fontSize: '0.875rem' }}>
              Redirecting to sign in...
            </Typography>
          </>
        )}
      </Card>
    </Container>
  );
}
