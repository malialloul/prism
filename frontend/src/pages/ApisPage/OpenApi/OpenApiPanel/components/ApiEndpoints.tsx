import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Typography, IconButton, Tooltip, alpha } from '@mui/material';
import type { ApiEndpointsProps } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function ApiEndpoints({
  api,
  copiedEndpoint,
  onCopyEndpoint,
  getPublicEndpoint,
  colors,
}: ApiEndpointsProps) {
  return (
    <>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.8rem', textTransform: 'uppercase', color: colors.textMuted }}>
        Endpoints
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          borderRadius: 1,
          backgroundColor: colors.backgroundSecondary,
          border: `1px solid ${colors.border}`,
          mb: 1,
        }}>
          <LockIcon sx={{ fontSize: 16, color: colors.textMuted }} />
          <Typography sx={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {API_BASE_URL}{api.endpoint}
          </Typography>
          <Tooltip title={copiedEndpoint === `${api.endpoint}-auth` ? 'Copied!' : 'Copy'}>
            <IconButton size="small" onClick={() => onCopyEndpoint(api.endpoint || '', 'auth')}>
              {copiedEndpoint === `${api.endpoint}-auth` ? (
                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        {api.isPublic && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: 1,
            backgroundColor: alpha('#49cc90', 0.1),
            border: `1px solid ${alpha('#49cc90', 0.3)}`,
          }}>
            <PublicIcon sx={{ fontSize: 16, color: '#49cc90' }} />
            <Typography sx={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {getPublicEndpoint(api)}
            </Typography>
            <Tooltip title={copiedEndpoint === `${api.endpoint}-public` ? 'Copied!' : 'Copy'}>
              <IconButton size="small" onClick={() => onCopyEndpoint(api.endpoint || '', 'public')}>
                {copiedEndpoint === `${api.endpoint}-public` ? (
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </>
  );
}
