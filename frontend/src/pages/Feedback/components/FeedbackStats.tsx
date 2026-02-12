import {
    StatsGrid,
    StatCard,
    StatValue,
    StatLabel,
} from '../Feedback.styles';

interface FeedbackStatsProps {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
}

export default function FeedbackStats({
    total,
    pending,
    inProgress,
    completed,
}: FeedbackStatsProps) {
    return (
        <StatsGrid>
            <StatCard>
                <StatValue>{total}</StatValue>
                <StatLabel>Total</StatLabel>
            </StatCard>
            <StatCard>
                <StatValue>{pending}</StatValue>
                <StatLabel>Pending</StatLabel>
            </StatCard>
            <StatCard>
                <StatValue>{inProgress}</StatValue>
                <StatLabel>In Progress</StatLabel>
            </StatCard>
            <StatCard>
                <StatValue>{completed}</StatValue>
                <StatLabel>Completed</StatLabel>
            </StatCard>
        </StatsGrid>
    );
}
