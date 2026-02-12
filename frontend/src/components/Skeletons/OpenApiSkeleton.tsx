import { Box, Skeleton, useTheme } from '@mui/material';

/**
 * Skeleton for OpenAPI page - matches Swagger-style layout
 */
export default function OpenApiSkeleton() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: isDark ? '#1a1a2e' : '#fafafa',
    }}>
      {/* Swagger-style Header */}
      <Box sx={{
        background: isDark
          ? 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)'
          : 'linear-gradient(135deg, #89bf04 0%, #547f00 100%)',
        p: 3,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Skeleton variant="text" width={200} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
            <Skeleton variant="text" width={180} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mt: 0.5 }} />
          </Box>
          <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
        </Box>

        {/* Search and Filters */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Skeleton
            variant="rectangular"
            width={250}
            height={40}
            sx={{ borderRadius: '4px', bgcolor: 'rgba(255,255,255,0.1)' }}
          />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {['GET', 'POST', 'PUT', 'DELETE'].map(method => (
              <Skeleton
                key={method}
                variant="rectangular"
                width={50}
                height={24}
                sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.15)' }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* API List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              mb: 1,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            {/* API Item Header */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              bgcolor: 'background.paper',
            }}>
              <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '4px' }} />
              <Skeleton variant="text" width={200} height={20} />
              <Box sx={{ flex: 1 }} />
              <Skeleton variant="text" width={150} height={16} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
