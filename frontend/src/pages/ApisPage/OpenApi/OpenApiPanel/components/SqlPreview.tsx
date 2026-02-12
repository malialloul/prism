import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Typography, IconButton, Tooltip, Collapse } from '@mui/material';
import type { OpenApiColors } from './types';

interface SqlPreviewProps {
  show: boolean;
  sql: string;
  copied: boolean;
  onCopy: () => void;
  darkMode: boolean;
  colors: OpenApiColors;
}

export function SqlPreview({
  show,
  sql,
  copied,
  onCopy,
  darkMode,
  colors,
}: SqlPreviewProps) {
  return (
    <Collapse in={show}>
      <Box sx={{
        p: 2,
        mb: 2,
        borderRadius: 1,
        backgroundColor: darkMode ? '#0d0d14' : '#272822',
        border: `1px solid ${colors.border}`,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>
            SQL Query
          </Typography>
          <Tooltip title={copied ? 'Copied!' : 'Copy SQL'}>
            <IconButton size="small" onClick={onCopy}>
              {copied ? (
                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        <pre style={{
          margin: 0,
          fontSize: '0.8rem',
          fontFamily: '"Fira Code", "Consolas", monospace',
          color: '#f8f8f2',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}>
          {sql}
        </pre>
      </Box>
    </Collapse>
  );
}
