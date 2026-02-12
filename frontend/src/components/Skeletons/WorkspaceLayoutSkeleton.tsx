import { Box, Skeleton, Card } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { getWorkspaceColors } from '../../styles/theme';

export default function WorkspaceLayoutSkeleton() {
    const muiTheme = useMuiTheme();
    const colors = getWorkspaceColors(muiTheme.palette.mode === 'dark');

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
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backgroundColor: colors.backgroundSecondary,
                    borderBottom: `1px solid ${colors.border}`,
                    height: '64px',
                }}
            >
                <Skeleton variant="rectangular" height={64} />
            </Box>

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
                <Box
                    sx={{
                        flex: 1,
                        padding: '1.5rem',
                        maxWidth: '1400px',
                        width: '100%',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Skeleton variant="text" width={200} height={32} />
                    </Box>

                    {/* Tabs Skeleton */}
                    <Box sx={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} variant="text" width={100} height={32} />
                        ))}
                    </Box>

                    {/* Content Cards Skeleton */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[1, 2, 3].map((i) => (
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
        </Box>
    );
}
