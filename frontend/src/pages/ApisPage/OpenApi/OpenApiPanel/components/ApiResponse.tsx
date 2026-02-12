import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, Typography, alpha } from '@mui/material';
import type { ApiResponseProps } from './types';

export function ApiResponse({ result, colors, darkMode }: ApiResponseProps) {
  return (
    <Box sx={{
      borderRadius: 1,
      border: `1px solid ${result.success === false ? '#f93e3e' : '#49cc90'}`,
      overflow: 'hidden',
    }}>
      {/* Response Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        backgroundColor: result.success === false ? alpha('#f93e3e', 0.1) : alpha('#49cc90', 0.1),
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {result.success === false ? (
            <ErrorIcon sx={{ color: '#f93e3e', fontSize: 20 }} />
          ) : (
            <CheckCircleIcon sx={{ color: '#49cc90', fontSize: 20 }} />
          )}
          <Typography sx={{
            fontWeight: 600,
            color: result.success === false ? '#f93e3e' : '#49cc90',
          }}>
            {result.success === false ? 'Error' : 'Success'}
          </Typography>
        </Box>
        {result.success !== false && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" sx={{ color: colors.textMuted }}>
              {result.rowCount} rows
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 14, color: colors.textMuted }} />
              <Typography variant="caption" sx={{ color: colors.textMuted }}>
                {result.executionTimeMs}ms
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      {/* Response Body */}
      <Box sx={{
        p: 2,
        maxHeight: 300,
        overflowY: 'auto',
        backgroundColor: darkMode ? '#0d0d14' : '#fafafa',
      }}>
        {result.success === false ? (
          <Typography sx={{ color: '#f93e3e', fontSize: '0.85rem' }}>
            {result.error || 'Request failed'}
          </Typography>
        ) : (
          <pre style={{
            margin: 0,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: colors.text,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {JSON.stringify(result.rows, null, 2)}
          </pre>
        )}
      </Box>
    </Box>
  );
}
