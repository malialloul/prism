import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Select, MenuItem, FormControl, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, InputAdornment } from '@mui/material';
import { Pagination } from '../../components';
import { MySubmissionsSkeleton, AllFeedbackSkeleton } from '../../components/Skeletons';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCommentIcon from '@mui/icons-material/AddComment';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import InboxIcon from '@mui/icons-material/Inbox';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { ThemeToggleButton } from '../../components/ThemeToggle/ThemeToggle';
import { useIsAdmin, useMyFeedback, useAllFeedback, useFeedbackStats } from '../../api/entities/feedback';
import { useCreateFeedback } from '../../api/entities/feedback/useCreateFeedback';
import { useUpdateFeedback } from '../../api/entities/feedback/useUpdateFeedback';
import { useDeleteFeedback } from '../../api/entities/feedback/useDeleteFeedback';
import type { FeedbackDto, CreateFeedbackDto } from '../../api/models/FeedbackDto';
import { getWorkspaceColors } from '../../styles/theme';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { toastService } from '../../services/toastService';
import {
    FeedbackWrapper,
    FeedbackHeader,
    FeedbackLayout,
    FeedbackSidebar,
    SidebarItem,
    SidebarDivider,
    FeedbackContent,
    PageTitle,
    PageSubtitle,
    SectionCard,
    SectionBody,
    StyledTextField,
    TypeSelector,
    TypeChip,
    SubmitButton,
    FeedbackList,
    FeedbackItem,
    FeedbackItemHeader,
    FeedbackItemTitle,
    FeedbackItemDescription,
    FeedbackItemMeta,
    StatusChip,
    TypeBadge,
    EmptyState,
    StatsGrid,
    StatCard,
    StatValue,
    StatLabel,
    AdminActions,
} from './Feedback.styles';

type FeedbackSection = 'submit' | 'my-feedback' | 'all-feedback';
type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';
type FeedbackStatus = 'pending' | 'reviewed' | 'in-progress' | 'completed' | 'rejected';
type FeedbackPriority = 'low' | 'medium' | 'high';

const feedbackTypes: { value: FeedbackType; label: string }[] = [
    { value: 'bug', label: '🐛 Bug Report' },
    { value: 'feature', label: '✨ Feature Request' },
    { value: 'improvement', label: '💡 Improvement' },
    { value: 'other', label: '📝 Other' },
];

const priorityOptions: { value: FeedbackPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const statusLabels: Record<FeedbackStatus, string> = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    'in-progress': 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected',
};

const Feedback = () => {
    const navigate = useNavigate();
    const muiTheme = useMuiTheme();
    const colors = getWorkspaceColors(muiTheme.palette.mode === 'dark');

    const [activeSection, setActiveSection] = useState<FeedbackSection>('submit');

    // Form state
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('feature');
    const [priority, setPriority] = useState<FeedbackPriority>('medium');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Admin filter/pagination state
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('');
    const [filterPriority, setFilterPriority] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed
    const [pageSize, setPageSize] = useState(25);

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState<FeedbackDto | null>(null);
    const [editType, setEditType] = useState<FeedbackType>('feature');
    const [editPriority, setEditPriority] = useState<FeedbackPriority>('medium');
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // React Query hooks
    const { data: adminData, isLoading: isLoadingAdmin } = useIsAdmin();
    const isAdmin = adminData?.isAdmin ?? false;

    const { data: myFeedbackData, isLoading: isLoadingMyFeedback } = useMyFeedback();
    const myFeedback = myFeedbackData?.feedback ?? [];

    const filterParams = {
        page: currentPage + 1, // API expects 1-indexed
        limit: pageSize,
        ...(filterStatus && { status: filterStatus }),
        ...(filterType && { type: filterType }),
        ...(filterPriority && { priority: filterPriority }),
        ...(searchQuery && { search: searchQuery }),
    };

    const { data: allFeedbackData, isLoading: isLoadingAllFeedback } = useAllFeedback(
        filterParams,
        isAdmin && activeSection === 'all-feedback'
    );
    const allFeedback = allFeedbackData?.feedback ?? [];
    const totalPages = allFeedbackData?.pagination?.totalPages ?? 1;
    const totalItems = allFeedbackData?.pagination?.total ?? 0;

    const { data: stats } = useFeedbackStats(isAdmin && activeSection === 'all-feedback');

    // Mutations
    const createFeedback = useCreateFeedback();
    const updateFeedback = useUpdateFeedback();
    const deleteFeedback = useDeleteFeedback();

    const isLoading = isLoadingAdmin;
    const dataLoading = activeSection === 'my-feedback' ? isLoadingMyFeedback : isLoadingAllFeedback;

    // Reset pagination when filters change
    const handleFilterChange = (type: 'status' | 'type' | 'priority', value: string) => {
        setCurrentPage(0);
        if (type === 'status') setFilterStatus(value);
        if (type === 'type') setFilterType(value);
        if (type === 'priority') setFilterPriority(value);
    };

    const handleSearchChange = (value: string) => {
        setCurrentPage(0);
        setSearchQuery(value);
    };

    const clearFilters = () => {
        setCurrentPage(0);
        setFilterStatus('');
        setFilterType('');
        setFilterPriority('');
        setSearchQuery('');
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            toastService.error('Please fill in all fields');
            return;
        }

        const data: CreateFeedbackDto = {
            type: feedbackType,
            title: title.trim(),
            description: description.trim(),
            priority,
        };

        createFeedback.mutate(data, {
            onSuccess: () => {
                toastService.success('Thank you for your feedback!');
                setTitle('');
                setDescription('');
                setFeedbackType('feature');
                setPriority('medium');
            },
            onError: (error) => {
                console.error('Failed to submit feedback:', error);
                toastService.error('Failed to submit feedback');
            },
        });
    };

    const handleStatusChange = async (id: number, status: FeedbackStatus) => {
        updateFeedback.mutate({ id, data: { status } }, {
            onSuccess: () => {
                toastService.success('Status updated');
            },
            onError: (error) => {
                console.error('Failed to update status:', error);
                toastService.error('Failed to update status');
            },
        });
    };

    const openDeleteDialog = (id: number, _isMyFeedback: boolean = false) => {
        setDeletingId(id);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeletingId(null);
    };

    const handleDelete = async () => {
        if (deletingId === null) return;

        deleteFeedback.mutate(deletingId, {
            onSuccess: () => {
                toastService.success('Feedback deleted');
                closeDeleteDialog();
            },
            onError: (error) => {
                console.error('Failed to delete feedback:', error);
                toastService.error('Failed to delete feedback');
            },
        });
    };

    const openEditDialog = (item: FeedbackDto) => {
        setEditingFeedback(item);
        setEditType(item.type as FeedbackType);
        setEditPriority(item.priority as FeedbackPriority);
        setEditTitle(item.title);
        setEditDescription(item.description);
        setEditDialogOpen(true);
    };

    const closeEditDialog = () => {
        setEditDialogOpen(false);
        setEditingFeedback(null);
    };

    const handleUpdateFeedback = async () => {
        if (!editingFeedback || !editTitle.trim() || !editDescription.trim()) {
            toastService.error('Please fill in all fields');
            return;
        }

        updateFeedback.mutate({
            id: editingFeedback.id,
            data: {
                type: editType,
                title: editTitle.trim(),
                description: editDescription.trim(),
                priority: editPriority,
            },
        }, {
            onSuccess: () => {
                toastService.success('Feedback updated');
                closeEditDialog();
            },
            onError: (error) => {
                console.error('Failed to update feedback:', error);
                toastService.error('Failed to update feedback');
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const sectionConfig = {
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

    const renderSubmitForm = () => (
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
                            onClick={() => setFeedbackType(type.value)}
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
                            onClick={() => setPriority(p.value)}
                        />
                    ))}
                </TypeSelector>
            </Box>

            <StyledTextField
                label="Title"
                placeholder="Brief summary of your feedback"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
            />

            <StyledTextField
                label="Description"
                placeholder="Provide more details about your feedback..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={6}
                fullWidth
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SubmitButton
                    onClick={handleSubmit}
                    disabled={createFeedback.isPending || !title.trim() || !description.trim()}
                >
                    {createFeedback.isPending ? <CircularProgress size={20} color="inherit" /> : 'Submit Feedback'}
                </SubmitButton>
            </Box>
        </Box>
    );

    const renderFeedbackItem = (item: FeedbackDto, options: { showAdmin?: boolean; showUserActions?: boolean } = {}) => (
        <FeedbackItem key={item.id}>
            <FeedbackItemHeader>
                <FeedbackItemTitle>{item.title}</FeedbackItemTitle>
                <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <TypeBadge
                        feedbackType={item.type as FeedbackType}
                        label={item.type}
                        size="small"
                    />
                    <StatusChip
                        statusType={item.status as FeedbackStatus}
                        label={statusLabels[item.status as FeedbackStatus]}
                        size="small"
                    />
                </Box>
            </FeedbackItemHeader>
            <FeedbackItemDescription>{item.description}</FeedbackItemDescription>
            <FeedbackItemMeta>
                <span>Submitted {formatDate(item.createdAt)}</span>
                {item.userEmail && options.showAdmin && (
                    <span>By: {item.userEmail}</span>
                )}
            </FeedbackItemMeta>
            {options.showUserActions && (
                <AdminActions>
                    <Tooltip title="Edit">
                        <IconButton
                            size="small"
                            onClick={() => openEditDialog(item)}
                            sx={{ color: colors.primary }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            onClick={() => openDeleteDialog(item.id, true)}
                            sx={{ color: colors.error }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </AdminActions>
            )}
            {options.showAdmin && (
                <AdminActions>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
                            sx={{
                                fontSize: '0.75rem',
                                color: colors.textSecondary,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.border,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.borderLight,
                                },
                                '& .MuiSelect-select': {
                                    padding: '0.5rem 0.75rem',
                                },
                            }}
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="reviewed">Reviewed</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            onClick={() => openDeleteDialog(item.id)}
                            sx={{ color: colors.error }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </AdminActions>
            )}
        </FeedbackItem>
    );

    const renderMyFeedback = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {dataLoading ? (
                <MySubmissionsSkeleton />
            ) : myFeedback.length === 0 ? (
                <EmptyState>
                    <InboxIcon />
                    <p>You haven't submitted any feedback yet.</p>
                </EmptyState>
            ) : (
                <FeedbackList>
                    {myFeedback.map((item) => renderFeedbackItem(item, { showUserActions: true }))}
                </FeedbackList>
            )}
        </Box>
    );

    const hasActiveFilters = filterStatus || filterType || filterPriority || searchQuery;

    const renderAllFeedback = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>
            {stats && (
                <StatsGrid>
                    <StatCard>
                        <StatValue>{stats.total}</StatValue>
                        <StatLabel>Total</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatValue>{stats.byStatus?.pending || 0}</StatValue>
                        <StatLabel>Pending</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatValue>{stats.byStatus?.['in-progress'] || 0}</StatValue>
                        <StatLabel>In Progress</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatValue>{stats.byStatus?.completed || 0}</StatValue>
                        <StatLabel>Completed</StatLabel>
                    </StatCard>
                </StatsGrid>
            )}

            {/* Filters */}
            <Box sx={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
                alignItems: 'center',
            }}>
                <TextField
                    placeholder="Search feedback..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    size="small"
                    sx={{
                        flex: 1,
                        minWidth: '200px',
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: colors.backgroundSecondary,
                            color: colors.text,
                            fontSize: '0.875rem',
                            '& fieldset': { borderColor: colors.border },
                            '&:hover fieldset': { borderColor: colors.borderLight },
                            '&.Mui-focused fieldset': { borderColor: colors.primary },
                        },
                        '& .MuiInputBase-input::placeholder': { color: colors.textMuted },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: colors.textMuted, fontSize: '1.25rem' }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={filterStatus}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        displayEmpty
                        sx={{
                            fontSize: '0.875rem',
                            color: colors.text,
                            backgroundColor: colors.backgroundSecondary,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderLight },
                        }}
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="reviewed">Reviewed</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={filterType}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        displayEmpty
                        sx={{
                            fontSize: '0.875rem',
                            color: colors.text,
                            backgroundColor: colors.backgroundSecondary,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderLight },
                        }}
                    >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="bug">Bug</MenuItem>
                        <MenuItem value="feature">Feature</MenuItem>
                        <MenuItem value="improvement">Improvement</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={filterPriority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        displayEmpty
                        sx={{
                            fontSize: '0.875rem',
                            color: colors.text,
                            backgroundColor: colors.backgroundSecondary,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderLight },
                        }}
                    >
                        <MenuItem value="">All Priority</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                    </Select>
                </FormControl>

                {hasActiveFilters && (
                    <Tooltip title="Clear filters">
                        <IconButton
                            size="small"
                            onClick={clearFilters}
                            sx={{ color: colors.textSecondary }}
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {dataLoading ? (
                <AllFeedbackSkeleton />
            ) : allFeedback.length === 0 ? (
                <EmptyState>
                    <InboxIcon />
                    <p>{hasActiveFilters ? 'No feedback matches your filters.' : 'No feedback submissions yet.'}</p>
                </EmptyState>
            ) : (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Box sx={{ flex: 1, overflow: 'auto', paddingRight: '1rem' }}>
                        <FeedbackList>
                            {allFeedback.map((item) => renderFeedbackItem(item, { showAdmin: true }))}
                        </FeedbackList>
                    </Box>

                    {/* Pagination */}
                    <Box sx={{ marginTop: '1.5rem', flexShrink: 0 }}>
                        <Pagination
                            page={currentPage}
                            pageSize={pageSize}
                            totalRows={totalItems}
                            totalPages={totalPages}
                            startRow={currentPage * pageSize + 1}
                            endRow={Math.min((currentPage + 1) * pageSize, totalItems)}
                            isLoading={dataLoading}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setCurrentPage(0);
                            }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'submit':
                return renderSubmitForm();
            case 'my-feedback':
                return renderMyFeedback();
            case 'all-feedback':
                return isAdmin ? renderAllFeedback() : null;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <FeedbackWrapper>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </FeedbackWrapper>
        );
    }

    return (
        <FeedbackWrapper>
            <FeedbackHeader>
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
                            onClick={() => navigate(-1)}
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
            </FeedbackHeader>

            <FeedbackLayout>
                <FeedbackSidebar>
                    <SidebarItem
                        active={activeSection === 'submit'}
                        onClick={() => setActiveSection('submit')}
                    >
                        <AddCommentIcon sx={{ fontSize: 20 }} />
                        Submit Feedback
                    </SidebarItem>
                    <SidebarItem
                        active={activeSection === 'my-feedback'}
                        onClick={() => setActiveSection('my-feedback')}
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
                                onClick={() => setActiveSection('all-feedback')}
                            >
                                <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />
                                All Feedback
                            </SidebarItem>
                        </>
                    )}
                </FeedbackSidebar>

                <FeedbackContent>
                    <Box sx={{ marginBottom: '0.5rem' }}>
                        <PageTitle>{sectionConfig[activeSection].title}</PageTitle>
                        <PageSubtitle>{sectionConfig[activeSection].subtitle}</PageSubtitle>
                    </Box>

                    <SectionCard>
                        <SectionBody>{renderSectionContent()}</SectionBody>
                    </SectionCard>
                </FeedbackContent>
            </FeedbackLayout>

            {/* Edit Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={closeEditDialog}
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
                                        onClick={() => setEditType(type.value)}
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
                                        onClick={() => setEditPriority(p.value)}
                                    />
                                ))}
                            </TypeSelector>
                        </Box>

                        <StyledTextField
                            label="Title"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            fullWidth
                        />

                        <StyledTextField
                            label="Description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            multiline
                            rows={4}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={closeEditDialog}
                        sx={{ color: colors.textSecondary }}
                    >
                        Cancel
                    </Button>
                    <SubmitButton
                        onClick={handleUpdateFeedback}
                        disabled={updateFeedback.isPending || !editTitle.trim() || !editDescription.trim()}
                    >
                        {updateFeedback.isPending ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                    </SubmitButton>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
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
                        onClick={closeDeleteDialog}
                        sx={{ color: colors.textSecondary }}
                        disabled={deleteFeedback.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={deleteFeedback.isPending}
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
                        {deleteFeedback.isPending ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </FeedbackWrapper>
    );
};

export default Feedback;
