import { Box, Skeleton } from '@mui/material';

/**
 * Skeleton for Schema Explorer page - matches actual UI layout
 */
export default function SchemaSkeleton() {
    return (
        <Box sx={{ display: 'flex', gap: 2, height: '100%', minHeight: 0 }}>
            {/* Schema Explorer Sidebar */}
            <Box
                sx={{
                    width: '320px',
                    minWidth: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                }}
            >
                {/* Header with actions */}
                <Box
                    sx={{
                        p: '12px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Skeleton variant="text" width={100} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                        <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                    </Box>
                </Box>

                {/* Search */}
                <Box sx={{ p: '12px 16px' }}>
                    <Skeleton
                        variant="rectangular"
                        height={36}
                        sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}
                    />
                </Box>

                {/* Filter tabs */}
                <Box sx={{ px: '16px', pb: '8px', display: 'flex', gap: 1 }}>
                    <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: '14px', bgcolor: 'rgba(102,126,234,0.2)' }} />
                    <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.04)' }} />
                    <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.04)' }} />
                </Box>

                {/* Object list */}
                <Box sx={{ flex: 1, overflow: 'hidden', p: '8px 12px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Box
                            key={i}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                p: '10px 12px',
                                mb: '4px',
                                borderRadius: '6px',
                                bgcolor: i === 1 ? 'rgba(102,126,234,0.1)' : 'transparent',
                            }}
                        >
                            <Skeleton
                                variant="circular"
                                width={20}
                                height={20}
                                sx={{ bgcolor: i === 1 ? 'rgba(102,126,234,0.3)' : 'rgba(255,255,255,0.08)' }}
                            />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton
                                    variant="text"
                                    width={80 + (i % 3) * 30}
                                    height={18}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}
                                />
                            </Box>
                            <Skeleton variant="text" width={30} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Object Details Panel */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                }}
            >
                {/* Details Header */}
                <Box
                    sx={{
                        p: '16px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: 'rgba(102,126,234,0.2)' }} />
                        <Box>
                            <Skeleton variant="text" width={140} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Skeleton variant="text" width={80} height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: '6px', bgcolor: 'rgba(255,255,255,0.06)' }} />
                        <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: '6px', bgcolor: 'rgba(255,255,255,0.06)' }} />
                    </Box>
                </Box>

                {/* Table Info */}
                <Box sx={{ p: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        {[1, 2, 3].map((i) => (
                            <Box key={i}>
                                <Skeleton variant="text" width={60} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 0.5 }} />
                                <Skeleton variant="text" width={40} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Columns Table */}
                <Box sx={{ flex: 1, p: '16px 20px', overflow: 'hidden' }}>
                    <Skeleton variant="text" width={100} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 2 }} />

                    {/* Table header */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 80px 80px 100px',
                            gap: 2,
                            p: '10px 16px',
                            bgcolor: 'rgba(255,255,255,0.03)',
                            borderRadius: '6px 6px 0 0',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                        }}
                    >
                        {['Column', 'Type', 'Nullable', 'Key', 'Default'].map((col) => (
                            <Skeleton key={col} variant="text" width={col.length * 8} height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                        ))}
                    </Box>

                    {/* Table rows */}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Box
                            key={i}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 80px 80px 100px',
                                gap: 2,
                                p: '12px 16px',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <Skeleton variant="text" width={60 + (i % 3) * 20} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                            <Skeleton variant="text" width={50 + (i % 2) * 30} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                            <Skeleton variant="text" width={40} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                            <Skeleton variant="text" width={i === 1 ? 30 : 20} height={18} sx={{ bgcolor: i === 1 ? 'rgba(102,126,234,0.2)' : 'rgba(255,255,255,0.05)' }} />
                            <Skeleton variant="text" width={i % 2 === 0 ? 60 : 30} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
