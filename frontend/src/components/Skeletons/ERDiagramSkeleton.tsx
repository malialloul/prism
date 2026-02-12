import { Box, Skeleton, alpha, useTheme } from '@mui/material';

/**
 * Skeleton for ER Diagram / RelationshipGraph - matches toolbar + table nodes grid layout
 */
export default function ERDiagramSkeleton() {
    const theme = useTheme();

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar Skeleton */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                px: 2,
                py: 1,
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Skeleton variant="rounded" width={100} height={32} />
                    <Skeleton variant="rounded" width={40} height={32} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                </Box>
            </Box>
            {/* Graph Area Skeleton */}
            <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Box key={i} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{ px: 2, py: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.08), borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Skeleton variant="text" width="60%" height={20} />
                            </Box>
                            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {[1, 2, 3, 4].map((j) => (
                                    <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Skeleton variant="circular" width={16} height={16} />
                                        <Skeleton variant="text" width="40%" height={16} />
                                        <Skeleton variant="text" width="30%" height={16} sx={{ ml: 'auto' }} />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
