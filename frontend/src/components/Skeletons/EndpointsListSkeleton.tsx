import { Box, Skeleton } from '@mui/material';

/**
 * Skeleton for endpoints list in Auto Generated APIs page - matches actual UI
 */
export default function EndpointsListSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Table groups with endpoints */}
      {[1, 2, 3, 4].map((groupIdx) => (
        <Box
          key={groupIdx}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Group Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.03)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
              <Skeleton variant="text" width={80 + groupIdx * 20} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton variant="text" width={70} height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              <Skeleton variant="circular" width={18} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
            </Box>
          </Box>

          {/* Endpoints (shown expanded for first two groups) */}
          {groupIdx <= 2 && [1, 2, 3, 4, 5].slice(0, groupIdx === 1 ? 5 : 3).map((endpointIdx) => (
            <Box
              key={endpointIdx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              {/* Method Badge */}
              <Skeleton
                variant="rectangular"
                width={60}
                height={24}
                sx={{
                  borderRadius: '12px',
                  bgcolor: endpointIdx === 1 ? 'rgba(97, 175, 254, 0.15)' :
                    endpointIdx === 2 ? 'rgba(73, 204, 144, 0.15)' :
                      endpointIdx === 3 ? 'rgba(252, 161, 48, 0.15)' :
                        endpointIdx === 4 ? 'rgba(80, 227, 194, 0.15)' :
                          'rgba(249, 62, 62, 0.15)',
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="text" width="70%" height={18} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 0.25 }} />
                <Skeleton variant="text" width="90%" height={14} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}
