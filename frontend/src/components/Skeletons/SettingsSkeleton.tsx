import { Box, Skeleton } from '@mui/material';

/**
 * Skeleton for Settings page
 */
export default function SettingsSkeleton() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0f' }}>
      {/* Settings Sidebar */}
      <Box
        sx={{
          width: '260px',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          p: '1.5rem',
        }}
      >
        {/* Back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', mb: 3 }}>
          <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
          <Skeleton variant="text" width={80} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
        </Box>

        {/* Settings Title */}
        <Skeleton variant="text" width={100} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />

        {/* Navigation Items */}
        {[1, 2, 3, 4, 5].map((i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              p: '0.75rem 1rem',
              mb: '0.25rem',
              borderRadius: '8px',
              bgcolor: i === 1 ? 'rgba(102,126,234,0.15)' : 'transparent',
            }}
          >
            <Skeleton
              variant="circular"
              width={20}
              height={20}
              sx={{ bgcolor: i === 1 ? 'rgba(102,126,234,0.4)' : 'rgba(255,255,255,0.08)' }}
            />
            <Skeleton
              variant="text"
              width={100}
              height={18}
              sx={{ bgcolor: i === 1 ? 'rgba(102,126,234,0.3)' : 'rgba(255,255,255,0.06)' }}
            />
          </Box>
        ))}
      </Box>

      {/* Settings Content */}
      <Box sx={{ flex: 1, p: '2rem' }}>
        {/* Header */}
        <Skeleton variant="text" width={200} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 1 }} />
        <Skeleton variant="text" width={350} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 3 }} />

        {/* Settings Cards */}
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              mb: 2,
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <Skeleton variant="text" width={120} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
            </Box>
            <Box sx={{ p: '1.25rem' }}>
              {[1, 2].map((j) => (
                <Box key={j} sx={{ mb: j === 1 ? 2 : 0 }}>
                  <Skeleton variant="text" width={100} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 0.5 }} />
                  <Skeleton variant="rectangular" height={44} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
