import { Box, Skeleton } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { getDashboardColors } from '../../styles/theme';

interface LoadingSkeletonProps {
  /**
   * Type of skeleton loader
   * - 'button' - Button loader (small)
   * - 'badge' - Badge/small loader
   * - 'text' - Text placeholder
   */
  variant?: 'button' | 'badge' | 'text';
  /**
   * Size of the loader
   */
  size?: 'small' | 'medium' | 'large';
}

export function ButtonLoadingSkeleton({
  size = 'medium',
}: Pick<LoadingSkeletonProps, 'size'>) {
  const muiTheme = useMuiTheme();
  const colors = getDashboardColors(muiTheme.palette.mode === 'dark');

  const sizeMap = {
    small: { width: 16, height: 16 },
    medium: { width: 20, height: 20 },
    large: { width: 24, height: 24 },
  };

  const dimensions = sizeMap[size];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 1.5s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
      }}
    >
      <Skeleton
        variant="circular"
        width={dimensions.width}
        height={dimensions.height}
        sx={{
          backgroundColor: colors.text,
        }}
      />
    </Box>
  );
}

export function TextLoadingSkeleton() {
  return (
    <Skeleton
      variant="text"
      width="40%"
      height={20}
      sx={{ animation: 'pulse 1.5s ease-in-out infinite' }}
    />
  );
}

export function BadgeLoadingSkeleton() {
  return (
    <Skeleton
      variant="circular"
      width={16}
      height={16}
      sx={{ animation: 'pulse 1.5s ease-in-out infinite' }}
    />
  );
}

export function ContentLoadingSkeleton() {
  const muiTheme = useMuiTheme();
  const colors = getDashboardColors(muiTheme.palette.mode === 'dark');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          variant="text"
          height={20}
          width={i === 3 ? '60%' : '100%'}
          sx={{
            backgroundColor: colors.border,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </Box>
  );
}
