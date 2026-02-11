import { Box, Skeleton } from '@mui/material';

/**
 * Skeleton for Home/Landing page
 */
export default function HomeSkeleton() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0a0a0f' }}>
      {/* Navigation Skeleton */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Skeleton variant="text" width={120} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="text" width={80} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: '0.75rem' }}>
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.08)' }} />
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: '8px', bgcolor: '#667eea' }} />
        </Box>
      </Box>

      {/* Hero Section Skeleton */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6rem 2rem',
          textAlign: 'center',
        }}
      >
        <Skeleton variant="text" width={600} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 2, maxWidth: '90%' }} />
        <Skeleton variant="text" width={500} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 1, maxWidth: '80%' }} />
        <Skeleton variant="text" width={450} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 4, maxWidth: '70%' }} />
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Skeleton variant="rectangular" width={160} height={48} sx={{ borderRadius: '8px', bgcolor: '#667eea' }} />
          <Skeleton variant="rectangular" width={140} height={48} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.08)' }} />
        </Box>
      </Box>

      {/* Features Grid Skeleton */}
      <Box sx={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Skeleton variant="text" width={300} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mx: 'auto', mb: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box key={i} sx={{ p: 3, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Skeleton variant="circular" width={48} height={48} sx={{ bgcolor: 'rgba(102,126,234,0.2)', mb: 2 }} />
              <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 1 }} />
              <Skeleton variant="text" width="100%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
              <Skeleton variant="text" width="80%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
