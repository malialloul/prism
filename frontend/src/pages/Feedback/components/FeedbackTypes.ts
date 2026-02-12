import type { FeedbackDto } from '../../../api/models/FeedbackDto';

export type FeedbackSection = 'submit' | 'my-feedback' | 'all-feedback';
export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';
export type FeedbackStatus = 'pending' | 'reviewed' | 'in-progress' | 'completed' | 'rejected';
export type FeedbackPriority = 'low' | 'medium' | 'high';

export const feedbackTypes: { value: FeedbackType; label: string }[] = [
    { value: 'bug', label: '🐛 Bug Report' },
    { value: 'feature', label: '✨ Feature Request' },
    { value: 'improvement', label: '💡 Improvement' },
    { value: 'other', label: '📝 Other' },
];

export const priorityOptions: { value: FeedbackPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

export const statusLabels: Record<FeedbackStatus, string> = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    'in-progress': 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected',
};

export const sectionConfig = {
    submit: {
        title: 'Submit Feedback',
        subtitle: 'Help us improve Prism by sharing your thoughts',
    },
    'my-feedback': {
        title: 'My Submissions',
        subtitle: 'Track the status of your feedback',
    },
    'all-feedback': {
        title: 'All Feedback',
        subtitle: 'Review and manage user submissions',
    },
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export interface FeedbackItemProps {
    item: FeedbackDto;
    showAdmin?: boolean;
    showUserActions?: boolean;
    onEdit?: (item: FeedbackDto) => void;
    onDelete?: (id: number) => void;
    onStatusChange?: (id: number, status: FeedbackStatus) => void;
}
