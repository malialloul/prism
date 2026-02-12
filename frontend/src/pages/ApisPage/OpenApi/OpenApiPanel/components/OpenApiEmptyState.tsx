import ApiIcon from '@mui/icons-material/Api';
import { Box, Typography, alpha } from '@mui/material';
import type { OpenApiEmptyStateProps } from './types';

export function OpenApiEmptyState({ colors }: OpenApiEmptyStateProps) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      minHeight: 400,
      gap: 2,
      p: 4,
    }}>
      <Box sx={{
        width: 80,
        height: 80,
        borderRadius: 3,
        bgcolor: alpha(colors.primary, 0.1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ApiIcon sx={{ fontSize: '2.5rem', color: colors.primary }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
        No Custom APIs Created
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
        Create custom API endpoints using the Query Builder tab. Your saved queries will appear here as callable REST APIs.
      </Typography>
    </Box>
  );
}
