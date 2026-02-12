import { ReactNode } from 'react';
import InboxIcon from '@mui/icons-material/Inbox';
import { EmptyState as StyledEmptyState } from '../Feedback.styles';

interface FeedbackEmptyStateProps {
    message: string;
    icon?: ReactNode;
}

export default function FeedbackEmptyState({ 
    message, 
    icon = <InboxIcon /> 
}: FeedbackEmptyStateProps) {
    return (
        <StyledEmptyState>
            {icon}
            <p>{message}</p>
        </StyledEmptyState>
    );
}
