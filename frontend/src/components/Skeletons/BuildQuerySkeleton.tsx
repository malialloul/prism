import { Box, Skeleton } from '@mui/material';

/**
 * Skeleton for Build Query page
 */
export default function BuildQuerySkeleton() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="text" width={180} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.04)' }} />
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.08)', pb: 1 }}>
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="text" width={100} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                ))}
            </Box>

            {/* Query Builder Content */}
            <Box sx={{ flex: 1, display: 'flex', gap: '1.5rem' }}>
                {/* Left Panel - Table Selection */}
                <Box sx={{ width: '280px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Skeleton variant="text" width={100} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                    <Skeleton variant="rectangular" height={36} sx={{ borderRadius: '6px', bgcolor: 'rgba(255,255,255,0.04)' }} />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} variant="rectangular" height={44} sx={{ borderRadius: '6px', bgcolor: 'rgba(255,255,255,0.04)' }} />
                    ))}
                </Box>

                {/* Right Panel - Query Preview */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Skeleton variant="text" width={120} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                    <Skeleton
                        variant="rectangular"
                        height={200}
                        sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.04)' }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                        <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.04)' }} />
                        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: '8px', bgcolor: 'rgba(102,126,234,0.2)' }} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
