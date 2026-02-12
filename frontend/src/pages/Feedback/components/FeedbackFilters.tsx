import { Box, TextField, Select, MenuItem, FormControl, IconButton, Tooltip, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { getWorkspaceColors } from '../../../styles/theme';
import { useTheme as useMuiTheme } from '@mui/material/styles';

interface FeedbackFiltersProps {
    searchQuery: string;
    filterStatus: string;
    filterType: string;
    filterPriority: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onTypeChange: (value: string) => void;
    onPriorityChange: (value: string) => void;
    onClearFilters: () => void;
}

export default function FeedbackFilters({
    searchQuery,
    filterStatus,
    filterType,
    filterPriority,
    onSearchChange,
    onStatusChange,
    onTypeChange,
    onPriorityChange,
    onClearFilters,
}: FeedbackFiltersProps) {
    const muiTheme = useMuiTheme();
    const colors = getWorkspaceColors(muiTheme.palette.mode === 'dark');

    const hasActiveFilters = filterStatus || filterType || filterPriority || searchQuery;

    return (
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
                onChange={(e) => onSearchChange(e.target.value)}
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
                    onChange={(e) => onStatusChange(e.target.value)}
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
                    onChange={(e) => onTypeChange(e.target.value)}
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
                    onChange={(e) => onPriorityChange(e.target.value)}
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
                        onClick={onClearFilters}
                        sx={{ color: colors.textSecondary }}
                    >
                        <ClearIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
}
