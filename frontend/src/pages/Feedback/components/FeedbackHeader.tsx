import { Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getWorkspaceColors } from '../../../styles/theme';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { ThemeToggleButton } from '../../../components/ThemeToggle/ThemeToggle';
import { FeedbackHeader as StyledFeedbackHeader } from '../Feedback.styles';

interface FeedbackHeaderProps {
    onBack: () => void;
}

export default function FeedbackHeader({ onBack }: FeedbackHeaderProps) {
    const muiTheme = useMuiTheme();
    const colors = getWorkspaceColors(muiTheme.palette.mode === 'dark');

    return (
        <StyledFeedbackHeader>
            <Box
                sx={{
                    maxWidth: '1200px',
                    width: '100%',
                    margin: '0 auto',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Box
                        onClick={onBack}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '0.5rem',
                            backgroundColor: colors.backgroundTertiary,
                            cursor: 'pointer',
                            color: colors.textSecondary,
                            transition: 'all 0.15s ease',
                            '&:hover': {
                                backgroundColor: colors.backgroundHover,
                                color: colors.text,
                            },
                        }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: colors.text }}>
                        Feedback
                    </span>
                </Box>
                <ThemeToggleButton />
            </Box>
        </StyledFeedbackHeader>
    );
}
