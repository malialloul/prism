import { Box, Skeleton } from '@mui/material';

export const FeedbackItemSkeleton = ({ showAdminActions = false }: { showAdminActions?: boolean }) => {
    return (
        <Box
            sx={{
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '0.75rem',
                padding: '1.25rem',
            }}
        >
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
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="text" width="75%" height={20} />
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
            {showAdminActions && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
                    <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: '0.5rem' }} />
                    <Skeleton variant="circular" width={32} height={32} />
                </Box>
            )}
        </Box>
    );
};
