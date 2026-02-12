import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, CircularProgress, alpha } from '@mui/material';
import type { ApiActionsProps } from './types';

export function ApiActions({
  loading,
  showSql,
  onExecute,
  onToggleSql,
  onDelete,
  methodColors,
}: ApiActionsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
        onClick={onExecute}
        disabled={loading}
        sx={{
          backgroundColor: methodColors.bg,
          '&:hover': { backgroundColor: alpha(methodColors.bg, 0.85) },
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        {loading ? 'Executing...' : 'Execute'}
      </Button>
      <Button
        variant="outlined"
        startIcon={<CodeIcon />}
        onClick={onToggleSql}
        sx={{ textTransform: 'none' }}
      >
        {showSql ? 'Hide SQL' : 'Show SQL'}
      </Button>
      <Box sx={{ flex: 1 }} />
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={onDelete}
        sx={{ textTransform: 'none' }}
      >
        Delete
      </Button>
    </Box>
  );
}
