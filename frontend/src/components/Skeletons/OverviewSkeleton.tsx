import { Box, Skeleton } from '@mui/material';

/**
 * Skeleton for Dashboard Overview page
 */
export default function OverviewSkeleton() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="text" width={200} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.04)' }} />
                    <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: '8px', bgcolor: 'rgba(102,126,234,0.2)' }} />
                </Box>
            </Box>

            {/* Active Database Summary Card */}
            <Skeleton
                variant="rectangular"
                height={160}
                sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.04)' }}
            />

            {/* Stats Cards Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton
                        key={i}
                        variant="rectangular"
                        height={100}
                        sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.04)' }}
                    />
                ))}
            </Box>

            {/* Charts Section */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: '1.5rem' }}>
                <Skeleton
                    variant="rectangular"
                    height={300}
                    sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.04)' }}
                />
                <Skeleton
                    variant="rectangular"
                    height={300}
                    sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.04)' }}
                />
            </Box>
        </Box>
    );
}
