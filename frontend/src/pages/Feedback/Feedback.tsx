import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { Pagination } from '../../components';
import { MySubmissionsSkeleton, AllFeedbackSkeleton } from '../../components/Skeletons';
import { useIsAdmin, useMyFeedback, useAllFeedback, useFeedbackStats } from '../../api/entities/feedback';
import { useCreateFeedback } from '../../api/entities/feedback/useCreateFeedback';
import { useUpdateFeedback } from '../../api/entities/feedback/useUpdateFeedback';
import { useDeleteFeedback } from '../../api/entities/feedback/useDeleteFeedback';
import type { FeedbackDto, CreateFeedbackDto } from '../../api/models/FeedbackDto';
import { toastService } from '../../services/toastService';
import { isDemoModeActive } from '../../context/TourContext';
import {
    FeedbackWrapper,
    FeedbackLayout,
    FeedbackList,
} from './Feedback.styles';
import {
    FeedbackHeader,
    FeedbackSidebar,
    FeedbackSubmitForm,
    FeedbackItem,
    FeedbackStats,
    FeedbackFilters,
    FeedbackEditDialog,
    FeedbackDeleteDialog,
    FeedbackEmptyState,
    FeedbackSectionContent,
    FeedbackSection,
    FeedbackType,
    FeedbackPriority,
    FeedbackStatus,
    sectionConfig,
} from './components';

const Feedback = () => {
    const navigate = useNavigate();

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
    const [currentPage, setCurrentPage] = useState(0);
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
        page: currentPage + 1,
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

    // Handlers
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

        // In demo mode, just show success without calling API
        if (isDemoModeActive()) {
            toastService.success('Thank you for your feedback!');
            setTitle('');
            setDescription('');
            setFeedbackType('feature');
            setPriority('medium');
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
        if (isDemoModeActive()) {
            toastService.success('Status updated');
            return;
        }
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

    const openDeleteDialog = (id: number) => {
        setDeletingId(id);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeletingId(null);
    };

    const handleDelete = async () => {
        if (deletingId === null) return;
        
        if (isDemoModeActive()) {
            toastService.success('Feedback deleted');
            closeDeleteDialog();
            return;
        }

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

        if (isDemoModeActive()) {
            toastService.success('Feedback updated');
            closeEditDialog();
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

    const hasActiveFilters = filterStatus || filterType || filterPriority || searchQuery;

    const renderMyFeedback = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {dataLoading ? (
                <MySubmissionsSkeleton />
            ) : myFeedback.length === 0 ? (
                <FeedbackEmptyState message="You haven't submitted any feedback yet." />
            ) : (
                <FeedbackList>
                    {myFeedback.map((item) => (
                        <FeedbackItem
                            key={item.id}
                            item={item}
                            showUserActions
                            onEdit={openEditDialog}
                            onDelete={openDeleteDialog}
                        />
                    ))}
                </FeedbackList>
            )}
        </Box>
    );

    const renderAllFeedback = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>
            {stats && (
                <FeedbackStats
                    total={stats.totalFeedback}
                    pending={stats.byStatus?.open || 0}
                    inProgress={stats.byStatus?.in_progress || 0}
                    completed={stats.byStatus?.resolved || 0}
                />
            )}

            <FeedbackFilters
                searchQuery={searchQuery}
                filterStatus={filterStatus}
                filterType={filterType}
                filterPriority={filterPriority}
                onSearchChange={handleSearchChange}
                onStatusChange={(v) => handleFilterChange('status', v)}
                onTypeChange={(v) => handleFilterChange('type', v)}
                onPriorityChange={(v) => handleFilterChange('priority', v)}
                onClearFilters={clearFilters}
            />

            {dataLoading ? (
                <AllFeedbackSkeleton />
            ) : allFeedback.length === 0 ? (
                <FeedbackEmptyState message={hasActiveFilters ? 'No feedback matches your filters.' : 'No feedback submissions yet.'} />
            ) : (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Box sx={{ flex: 1, overflow: 'auto', paddingRight: '1rem' }}>
                        <FeedbackList>
                            {allFeedback.map((item) => (
                                <FeedbackItem
                                    key={item.id}
                                    item={item}
                                    showAdmin
                                    onStatusChange={handleStatusChange}
                                    onDelete={openDeleteDialog}
                                />
                            ))}
                        </FeedbackList>
                    </Box>

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
                return (
                    <FeedbackSubmitForm
                        feedbackType={feedbackType}
                        priority={priority}
                        title={title}
                        description={description}
                        isSubmitting={createFeedback.isPending}
                        onTypeChange={setFeedbackType}
                        onPriorityChange={setPriority}
                        onTitleChange={setTitle}
                        onDescriptionChange={setDescription}
                        onSubmit={handleSubmit}
                    />
                );
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
            <FeedbackHeader onBack={() => navigate(-1)} />

            <FeedbackLayout>
                <FeedbackSidebar
                    activeSection={activeSection}
                    isAdmin={isAdmin}
                    onSectionChange={setActiveSection}
                />

                <FeedbackSectionContent
                    title={sectionConfig[activeSection].title}
                    subtitle={sectionConfig[activeSection].subtitle}
                >
                    {renderSectionContent()}
                </FeedbackSectionContent>
            </FeedbackLayout>

            <FeedbackEditDialog
                open={editDialogOpen}
                editType={editType}
                editPriority={editPriority}
                editTitle={editTitle}
                editDescription={editDescription}
                isUpdating={updateFeedback.isPending}
                onClose={closeEditDialog}
                onTypeChange={setEditType}
                onPriorityChange={setEditPriority}
                onTitleChange={setEditTitle}
                onDescriptionChange={setEditDescription}
                onSave={handleUpdateFeedback}
            />

            <FeedbackDeleteDialog
                open={deleteDialogOpen}
                isDeleting={deleteFeedback.isPending}
                onClose={closeDeleteDialog}
                onConfirm={handleDelete}
            />
        </FeedbackWrapper>
    );
};

export default Feedback;
