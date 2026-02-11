import { Box, Skeleton } from '@mui/material';

/**
 * Skeleton for OAuth Callback page (simple loading card)
 */
export default function OAuthCallbackSkeleton() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
      }}
    >
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Skeleton variant="circular" width={48} height={48} sx={{ bgcolor: 'rgba(102,126,234,0.3)', mb: 3 }} />
        <Skeleton variant="text" width={200} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 1 }} />
        <Skeleton variant="text" width={280} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
      </Box>
    </Box>
  );
}
