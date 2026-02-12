import { ReactNode } from 'react';
import { Box } from '@mui/material';
import {
    FeedbackContent,
    PageTitle,
    PageSubtitle,
    SectionCard,
    SectionBody,
} from '../Feedback.styles';

interface FeedbackSectionContentProps {
    title: string;
    subtitle: string;
    children: ReactNode;
}

export default function FeedbackSectionContent({
    title,
    subtitle,
    children,
}: FeedbackSectionContentProps) {
    return (
        <FeedbackContent>
            <Box sx={{ marginBottom: '0.5rem' }}>
                <PageTitle>{title}</PageTitle>
                <PageSubtitle>{subtitle}</PageSubtitle>
            </Box>

            <SectionCard>
                <SectionBody>{children}</SectionBody>
            </SectionCard>
        </FeedbackContent>
    );
}
