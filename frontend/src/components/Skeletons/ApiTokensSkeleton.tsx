import { Box, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getWorkspaceColors } from '../../styles/theme';

/**
 * Skeleton for API Tokens page
 */
export default function ApiTokensSkeleton() {
  const theme = useTheme();
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header Text */}
      <Box sx={{ marginBottom: '0.5rem' }}>
        <Skeleton
          variant="text"
          width="85%"
          height={18}
          sx={{ bgcolor: `${colors.textSecondary}15`, mb: 0.5 }}
        />
        <Skeleton
          variant="text"
          width="70%"
          height={18}
          sx={{ bgcolor: `${colors.textSecondary}15` }}
        />
      </Box>

      {/* Create Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.5rem' }}>
        <Skeleton
          variant="rectangular"
          width={120}
          height={36}
          sx={{ bgcolor: `${colors.primary}30`, borderRadius: '0.5rem' }}
        />
      </Box>

      {/* Token List Container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginTop: '0.5rem',
          padding: '1rem',
          backgroundColor: colors.backgroundTertiary,
          borderRadius: '0.5rem',
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Token Items */}
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem',
              backgroundColor: colors.background,
              borderRadius: '0.375rem',
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Token Info */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
              {/* Token Name */}
              <Skeleton
                variant="text"
                width={100 + i * 20}
                height={20}
                sx={{ bgcolor: `${colors.text}15` }}
              />
              
              {/* Token Prefix with Icons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Skeleton
                  variant="text"
                  width={200}
                  height={16}
                  sx={{ bgcolor: `${colors.textSecondary}12`, fontFamily: 'monospace' }}
                />
                <Skeleton
                  variant="circular"
                  width={18}
                  height={18}
                  sx={{ bgcolor: `${colors.textSecondary}15` }}
                />
                <Skeleton
                  variant="circular"
                  width={18}
                  height={18}
                  sx={{ bgcolor: `${colors.textSecondary}15` }}
                />
              </Box>

              {/* Token Meta - Dates */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Skeleton
                  variant="text"
                  width={100}
                  height={14}
                  sx={{ bgcolor: `${colors.textSecondary}10` }}
                />
                <Skeleton
                  variant="text"
                  width={85}
                  height={14}
                  sx={{ bgcolor: `${colors.textSecondary}10` }}
                />
              </Box>
            </Box>

            {/* Revoke Button */}
            <Skeleton
              variant="rectangular"
              width={70}
              height={28}
              sx={{ bgcolor: `${colors.error || '#f44336'}15`, borderRadius: '0.375rem' }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
