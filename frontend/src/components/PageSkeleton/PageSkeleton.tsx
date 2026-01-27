import { Box, Skeleton, Card } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { getDashboardColors } from '../../styles/theme';

interface PageSkeletonProps {
  /**
   * Variant of skeleton to show
   * - 'dashboard' - Full dashboard with sidebar
   * - 'settings' - Settings page with sidebar
   * - 'list' - Simple list view
   * - 'form' - Form with multiple fields
   */
  variant?: 'dashboard' | 'settings' | 'list' | 'form';
  /**
   * Number of skeleton rows/cards to show
   */
  count?: number;
}

export default function PageSkeleton({
  variant = 'dashboard',
  count = 3,
}: PageSkeletonProps) {
  const muiTheme = useMuiTheme();
  const colors = getDashboardColors(muiTheme.palette.mode === 'dark');

  if (variant === 'dashboard') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: colors.background,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Skeleton */}
        <Box
          sx={{
            backgroundColor: colors.backgroundSecondary,
            borderBottom: `1px solid ${colors.border}`,
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>

        {/* Body Skeleton */}
        <Box sx={{ display: 'flex', flex: 1 }}>
          {/* Sidebar Skeleton */}
          <Box
            sx={{
              width: '280px',
              flexShrink: 0,
              borderRight: `1px solid ${colors.border}`,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '0.5rem' }} />
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={56}
                sx={{ borderRadius: '0.5rem' }}
              />
            ))}
          </Box>

          {/* Content Skeleton */}
          <Box sx={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Box>
              <Skeleton variant="text" width={200} height={32} sx={{ marginBottom: '0.5rem' }} />
            </Box>

            {/* Tabs Skeleton */}
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="text" width={100} height={32} />
              ))}
            </Box>

            {/* Content Cards Skeleton */}
            {Array.from({ length: count }).map((_, i) => (
              <Card
                key={i}
                sx={{
                  padding: '1.5rem',
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Skeleton variant="text" width="30%" height={24} sx={{ marginBottom: '1rem' }} />
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '0.25rem' }} />
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  if (variant === 'settings') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: colors.background,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Skeleton */}
        <Box
          sx={{
            backgroundColor: colors.backgroundSecondary,
            borderBottom: `1px solid ${colors.border}`,
            padding: '1rem 1.5rem',
          }}
        >
          <Skeleton variant="text" width={150} height={32} />
        </Box>

        {/* Body Skeleton */}
        <Box sx={{ display: 'flex', flex: 1 }}>
          {/* Settings Sidebar Skeleton */}
          <Box
            sx={{
              width: '260px',
              flexShrink: 0,
              borderRight: `1px solid ${colors.border}`,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={40}
                sx={{ borderRadius: '0.375rem' }}
              />
            ))}
          </Box>

          {/* Settings Content Skeleton */}
          <Box sx={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Box>
              <Skeleton variant="text" width={250} height={36} sx={{ marginBottom: '0.5rem' }} />
              <Skeleton variant="text" width={350} height={20} />
            </Box>

            {/* Settings Cards Skeleton */}
            {Array.from({ length: count }).map((_, i) => (
              <Card
                key={i}
                sx={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ padding: '1.5rem', borderBottom: `1px solid ${colors.border}` }}>
                  <Skeleton variant="text" width="25%" height={24} />
                </Box>
                <Box sx={{ padding: '1.5rem' }}>
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '0.25rem' }} />
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  if (variant === 'list') {
    return (
      <Box sx={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Skeleton variant="text" width={200} height={32} sx={{ marginBottom: '1rem' }} />
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} sx={{ padding: '1rem', backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
            <Skeleton variant="text" width="40%" height={24} sx={{ marginBottom: '0.5rem' }} />
            <Skeleton variant="text" width="60%" height={16} />
          </Card>
        ))}
      </Box>
    );
  }

  if (variant === 'form') {
    return (
      <Box sx={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
        <Skeleton variant="text" width={300} height={36} />
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i}>
            <Skeleton variant="text" width="30%" height={20} sx={{ marginBottom: '0.5rem' }} />
            <Skeleton
              variant="rectangular"
              height={44}
              sx={{ borderRadius: '0.5rem' }}
            />
          </Box>
        ))}
        <Skeleton
          variant="rectangular"
          height={44}
          sx={{ borderRadius: '0.5rem', marginTop: '1rem' }}
        />
      </Box>
    );
  }

  return null;
}
