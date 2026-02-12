import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import { getWorkspaceColors } from '../../../styles/theme';
import { useTheme as useMuiTheme } from '@mui/material/styles';

interface FeedbackDeleteDialogProps {
    open: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function FeedbackDeleteDialog({
    open,
    isDeleting,
    onClose,
    onConfirm,
}: FeedbackDeleteDialogProps) {
    const muiTheme = useMuiTheme();
    const colors = getWorkspaceColors(muiTheme.palette.mode === 'dark');

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: colors.backgroundCard,
                    backgroundImage: 'none',
                    border: `1px solid ${colors.border}`,
                }
            }}
        >
            <DialogTitle sx={{ color: colors.text }}>Delete Feedback</DialogTitle>
            <DialogContent>
                <Box sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                    Are you sure you want to delete this feedback? This action cannot be undone.
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{ color: colors.textSecondary }}
                    disabled={isDeleting}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    sx={{
                        backgroundColor: colors.error,
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: colors.error,
                            opacity: 0.9,
                        },
                        '&:disabled': {
                            backgroundColor: colors.backgroundHover,
                            color: colors.textMuted,
                        },
                    }}
                >
                    {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
