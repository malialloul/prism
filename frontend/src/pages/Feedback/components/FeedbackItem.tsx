import { Box, Select, MenuItem, FormControl, IconButton, Tooltip } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { getWorkspaceColors } from '../../../styles/theme';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
    FeedbackItem as StyledFeedbackItem,
    FeedbackItemHeader,
    FeedbackItemTitle,
    FeedbackItemDescription,
    FeedbackItemMeta,
    StatusChip,
    TypeBadge,
    AdminActions,
} from '../Feedback.styles';
import { FeedbackItemProps, FeedbackStatus, FeedbackType, statusLabels, formatDate } from './FeedbackTypes';

export default function FeedbackItem({
    item,
    showAdmin = false,
    showUserActions = false,
    onEdit,
    onDelete,
    onStatusChange,
}: FeedbackItemProps) {
    const muiTheme = useMuiTheme();
    const colors = getWorkspaceColors(muiTheme.palette.mode === 'dark');

    return (
        <StyledFeedbackItem>
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
                {item.userEmail && showAdmin && (
                    <span>By: {item.userEmail}</span>
                )}
            </FeedbackItemMeta>
            {showUserActions && onEdit && onDelete && (
                <AdminActions>
                    <Tooltip title="Edit">
                        <IconButton
                            size="small"
                            onClick={() => onEdit(item)}
                            sx={{ color: colors.primary }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            onClick={() => onDelete(item.id)}
                            sx={{ color: colors.error }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </AdminActions>
            )}
            {showAdmin && onStatusChange && onDelete && (
                <AdminActions>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                            value={item.status}
                            onChange={(e) => onStatusChange(item.id, e.target.value as FeedbackStatus)}
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
                            onClick={() => onDelete(item.id)}
                            sx={{ color: colors.error }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </AdminActions>
            )}
        </StyledFeedbackItem>
    );
}
