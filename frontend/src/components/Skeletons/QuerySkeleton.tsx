import { Box, Skeleton } from '@mui/material';

/**
 * Skeleton for Query page
 */
export default function QuerySkeleton() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="text" width={150} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.04)' }} />
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.08)', pb: 1 }}>
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} variant="text" width={80} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                ))}
            </Box>

            {/* Editor Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* SQL Editor */}
                <Box sx={{ flex: 1, minHeight: '200px' }}>
                    <Skeleton
                        variant="rectangular"
                        height="100%"
                        sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.04)' }}
                    />
                </Box>

                {/* Action Bar */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.04)' }} />
                    <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: '8px', bgcolor: 'rgba(102,126,234,0.2)' }} />
                </Box>

                {/* Results Area */}
                <Box sx={{ minHeight: '150px' }}>
                    <Skeleton
                        variant="rectangular"
                        height={150}
                        sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.04)' }}
                    />
                </Box>
            </Box>
        </Box>
    );
}
