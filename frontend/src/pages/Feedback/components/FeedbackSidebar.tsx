import AddCommentIcon from '@mui/icons-material/AddComment';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import {
    FeedbackSidebar as StyledFeedbackSidebar,
    SidebarItem,
    SidebarDivider,
} from '../Feedback.styles';
import { FeedbackSection } from './FeedbackTypes';

interface FeedbackSidebarProps {
    activeSection: FeedbackSection;
    isAdmin: boolean;
    onSectionChange: (section: FeedbackSection) => void;
}

export default function FeedbackSidebar({
    activeSection,
    isAdmin,
    onSectionChange,
}: FeedbackSidebarProps) {
    return (
        <StyledFeedbackSidebar>
            <SidebarItem
                active={activeSection === 'submit'}
                onClick={() => onSectionChange('submit')}
            >
                <AddCommentIcon sx={{ fontSize: 20 }} />
                Submit Feedback
            </SidebarItem>
            <SidebarItem
                active={activeSection === 'my-feedback'}
                onClick={() => onSectionChange('my-feedback')}
            >
                <FeedbackIcon sx={{ fontSize: 20 }} />
                My Submissions
            </SidebarItem>
            {isAdmin && (
                <>
                    <SidebarDivider />
                    <SidebarItem
                        active={activeSection === 'all-feedback'}
                        adminOnly
                        onClick={() => onSectionChange('all-feedback')}
                    >
                        <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />
                        All Feedback
                    </SidebarItem>
                </>
            )}
        </StyledFeedbackSidebar>
    );
}
