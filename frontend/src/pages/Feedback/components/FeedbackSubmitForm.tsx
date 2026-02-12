import { Box, CircularProgress } from '@mui/material';
import { getWorkspaceColors } from '../../../styles/theme';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
    StyledTextField,
    TypeSelector,
    TypeChip,
    SubmitButton,
} from '../Feedback.styles';
import { feedbackTypes, priorityOptions, FeedbackType, FeedbackPriority } from './FeedbackTypes';

interface FeedbackSubmitFormProps {
    feedbackType: FeedbackType;
    priority: FeedbackPriority;
    title: string;
    description: string;
    isSubmitting: boolean;
    onTypeChange: (type: FeedbackType) => void;
    onPriorityChange: (priority: FeedbackPriority) => void;
    onTitleChange: (title: string) => void;
    onDescriptionChange: (description: string) => void;
    onSubmit: () => void;
}

export default function FeedbackSubmitForm({
    feedbackType,
    priority,
    title,
    description,
    isSubmitting,
    onTypeChange,
    onPriorityChange,
    onTitleChange,
    onDescriptionChange,
    onSubmit,
}: FeedbackSubmitFormProps) {
    const muiTheme = useMuiTheme();
    const colors = getWorkspaceColors(muiTheme.palette.mode === 'dark');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Box>
                <Box sx={{ fontSize: '0.875rem', fontWeight: 500, color: colors.text, marginBottom: '0.75rem' }}>
                    What type of feedback?
                </Box>
                <TypeSelector>
                    {feedbackTypes.map((type) => (
                        <TypeChip
                            key={type.value}
                            label={type.label}
                            selected={feedbackType === type.value}
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
                            selected={priority === p.value}
                            onClick={() => onPriorityChange(p.value)}
                        />
                    ))}
                </TypeSelector>
            </Box>

            <StyledTextField
                label="Title"
                placeholder="Brief summary of your feedback"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                fullWidth
            />

            <StyledTextField
                label="Description"
                placeholder="Provide more details about your feedback..."
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                multiline
                rows={6}
                fullWidth
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SubmitButton
                    onClick={onSubmit}
                    disabled={isSubmitting || !title.trim() || !description.trim()}
                >
                    {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Submit Feedback'}
                </SubmitButton>
            </Box>
        </Box>
    );
}
