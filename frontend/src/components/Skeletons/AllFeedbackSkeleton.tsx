import { Box, Skeleton } from '@mui/material';

const StatCardSkeleton = () => (
    <Box
        sx={{
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            textAlign: 'center',
        }}
    >
        <Skeleton variant="text" width={40} height={36} sx={{ margin: '0 auto' }} />
        <Skeleton variant="text" width={60} height={16} sx={{ margin: '0.25rem auto 0' }} />
    </Box>
);

const FeedbackItemSkeleton = () => (
    <Box
        sx={{
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '0.75rem',
            padding: '1.25rem',
        }}
    >
        {/* Header with title and badges */}
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem',
                gap: '1rem',
            }}
        >
            <Skeleton variant="text" width="60%" height={24} />
            <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '0.375rem' }} />
                <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '0.375rem' }} />
            </Box>
        </Box>

        {/* Description */}
        <Skeleton variant="text" width="90%" height={20} />
        <Skeleton variant="text" width="75%" height={20} />

        {/* Meta info */}
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Skeleton variant="text" width={150} height={16} />
            <Skeleton variant="text" width={120} height={16} />
        </Box>

        {/* Admin actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
            <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: '0.5rem' }} />
            <Skeleton variant="circular" width={32} height={32} />
        </Box>
    </Box>
);

export const AllFeedbackSkeleton = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>
            {/* Stats Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                }}
            >
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </Box>

            {/* Filters */}
            <Box
                sx={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    marginBottom: '1.5rem',
                    alignItems: 'center',
                }}
            >
                <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: '0.5rem', flex: 1, minWidth: 200 }} />
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: '0.5rem' }} />
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: '0.5rem' }} />
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: '0.5rem' }} />
            </Box>

            {/* Feedback list */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <FeedbackItemSkeleton />
                    <FeedbackItemSkeleton />
                    <FeedbackItemSkeleton />
                    <FeedbackItemSkeleton />
                    <FeedbackItemSkeleton />
                </Box>

                {/* Pagination */}
                <Box sx={{ marginTop: '1.5rem', flexShrink: 0 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1.5rem',
                            padding: '1rem 1.5rem',
                            backgroundColor: 'background.paper',
                            borderRadius: '0.75rem',
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Skeleton variant="text" width={180} height={24} />
                        <Box sx={{ display: 'flex', gap: '0.375rem' }}>
                            <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: '0.5rem' }} />
                            <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: '0.5rem' }} />
                            <Skeleton variant="text" width={80} height={36} />
                            <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: '0.5rem' }} />
                            <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: '0.5rem' }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Skeleton variant="text" width={100} height={24} />
                            <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: '0.5rem' }} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AllFeedbackSkeleton;
