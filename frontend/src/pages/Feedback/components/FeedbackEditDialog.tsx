import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import { getWorkspaceColors } from '../../../styles/theme';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
    StyledTextField,
    TypeSelector,
    TypeChip,
    SubmitButton,
} from '../Feedback.styles';
import { feedbackTypes, priorityOptions, FeedbackType, FeedbackPriority } from './FeedbackTypes';

interface FeedbackEditDialogProps {
    open: boolean;
    editType: FeedbackType;
    editPriority: FeedbackPriority;
    editTitle: string;
    editDescription: string;
    isUpdating: boolean;
    onClose: () => void;
    onTypeChange: (type: FeedbackType) => void;
    onPriorityChange: (priority: FeedbackPriority) => void;
    onTitleChange: (title: string) => void;
    onDescriptionChange: (description: string) => void;
    onSave: () => void;
}

export default function FeedbackEditDialog({
    open,
    editType,
    editPriority,
    editTitle,
    editDescription,
    isUpdating,
    onClose,
    onTypeChange,
    onPriorityChange,
    onTitleChange,
    onDescriptionChange,
    onSave,
}: FeedbackEditDialogProps) {
    const muiTheme = useMuiTheme();
    const colors = getWorkspaceColors(muiTheme.palette.mode === 'dark');

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: colors.backgroundCard,
                    backgroundImage: 'none',
                    border: `1px solid ${colors.border}`,
                }
            }}
        >
            <DialogTitle sx={{ color: colors.text }}>Edit Feedback</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', pt: 1 }}>
                    <Box>
                        <Box sx={{ fontSize: '0.875rem', fontWeight: 500, color: colors.text, marginBottom: '0.75rem' }}>
                            Type
                        </Box>
                        <TypeSelector>
                            {feedbackTypes.map((type) => (
                                <TypeChip
                                    key={type.value}
                                    label={type.label}
                                    selected={editType === type.value}
                                    onClick={() => onTypeChange(type.value)}
                                />
                            ))}
                        </TypeSelector>
                    </Box>

                    <Box>
                        <Box sx={{ fontSize: '0.875rem', fontWeight: 500, color: colors.text, marginBottom: '0.75rem' }}>
                            Priority
                        </Box>
                        <TypeSelector>
                            {priorityOptions.map((p) => (
                                <TypeChip
                                    key={p.value}
                                    label={p.label}
                                    selected={editPriority === p.value}
                                    onClick={() => onPriorityChange(p.value)}
                                />
                            ))}
                        </TypeSelector>
                    </Box>

                    <StyledTextField
                        label="Title"
                        value={editTitle}
                        onChange={(e) => onTitleChange(e.target.value)}
                        fullWidth
                    />

                    <StyledTextField
                        label="Description"
                        value={editDescription}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{ color: colors.textSecondary }}
                >
                    Cancel
                </Button>
                <SubmitButton
                    onClick={onSave}
                    disabled={isUpdating || !editTitle.trim() || !editDescription.trim()}
                >
                    {isUpdating ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                </SubmitButton>
            </DialogActions>
        </Dialog>
    );
}
