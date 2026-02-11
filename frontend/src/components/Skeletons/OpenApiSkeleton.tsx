import { Box, Skeleton } from '@mui/material';

/**
 * Skeleton for OpenAPI page
 */
export default function OpenApiSkeleton() {
  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 2, p: 2, backgroundColor: '#0a0a0f' }}>
      {/* API list sidebar */}
      <Box sx={{ width: '300px', flexShrink: 0 }}>
        {/* Search */}
        <Skeleton
          variant="rectangular"
          height={40}
          sx={{ borderRadius: 1, mb: 2, bgcolor: 'rgba(255,255,255,0.04)' }}
        />

        {/* API Items */}
        {[1, 2, 3, 4, 5].map((i) => (
          <Box
            key={i}
            sx={{
              p: '12px',
              mb: 1,
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              bgcolor: i === 1 ? 'rgba(102,126,234,0.1)' : 'transparent',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Skeleton
                variant="rectangular"
                width={40}
                height={20}
                sx={{ borderRadius: '4px', bgcolor: i === 1 ? '#22c55e' : 'rgba(255,255,255,0.1)' }}
              />
              <Skeleton variant="text" width={120} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
            </Box>
            <Skeleton variant="text" width="100%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
          </Box>
        ))}
      </Box>

      {/* API Detail Panel */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="rectangular" width={50} height={28} sx={{ borderRadius: '6px', bgcolor: '#22c55e' }} />
          <Skeleton variant="text" width={200} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        </Box>

        {/* Endpoint URL */}
        <Box
          sx={{
            p: '12px',
            borderRadius: '8px',
            bgcolor: 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
          <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
        </Box>

        {/* Parameters */}
        <Box>
          <Skeleton variant="text" width={100} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Skeleton variant="text" width={100} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                <Skeleton
                  variant="rectangular"
                  height={36}
                  sx={{ flex: 1, borderRadius: '6px', bgcolor: 'rgba(255,255,255,0.04)' }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: '8px', bgcolor: '#667eea' }} />
          <Skeleton variant="rectangular" width={80} height={40} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.06)' }} />
        </Box>

        {/* Response */}
        <Box sx={{ flex: 1, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <Box sx={{ p: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Skeleton variant="text" width={80} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
          </Box>
          <Box sx={{ p: '16px' }}>
            <Skeleton variant="text" width="90%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 0.5 }} />
            <Skeleton variant="text" width="70%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 0.5 }} />
            <Skeleton variant="text" width="80%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 0.5 }} />
            <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
