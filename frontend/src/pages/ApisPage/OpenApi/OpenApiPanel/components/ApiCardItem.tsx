import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  Box,
  Typography,
  Tooltip,
  Switch,
  FormControlLabel,
  Collapse,
  alpha,
} from '@mui/material';
import { ApiEndpoints } from './ApiEndpoints';
import { ApiParameters } from './ApiParameters';
import { ApiActions } from './ApiActions';
import { ApiResponse } from './ApiResponse';
import { SqlPreview } from './SqlPreview';
import type { ApiCardItemProps } from './types';
import { getMethodColor } from './types';

export function ApiCardItem({
  api,
  isExpanded,
  onToggleExpanded,
  testParams,
  onParamChange,
  paramErrors,
  testResult,
  testLoading,
  toggleLoading,
  copiedEndpoint,
  copiedSql,
  showSql,
  onCopyEndpoint,
  onCopySql,
  onTogglePublic,
  onToggleSql,
  onTestApi,
  onDeleteClick,
  getPublicEndpoint,
  colors,
  darkMode,
}: ApiCardItemProps) {
  const methodColors = getMethodColor(api.method || 'GET');

  return (
    <Box
      sx={{
        mb: 1,
        borderRadius: 1,
        border: `1px solid ${methodColors.border}`,
        overflow: 'hidden',
        backgroundColor: darkMode ? '#1e1e2e' : '#fff',
      }}
    >
      {/* API Header - Clickable to expand */}
      <Box
        onClick={() => onToggleExpanded(api.id)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1.5,
          cursor: 'pointer',
          backgroundColor: alpha(methodColors.bg, isExpanded ? 0.15 : 0.08),
          '&:hover': {
            backgroundColor: alpha(methodColors.bg, 0.15),
          },
        }}
      >
        {/* Method Badge */}
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 0.5,
            backgroundColor: methodColors.bg,
            color: methodColors.text,
            fontWeight: 700,
            fontSize: '0.75rem',
            minWidth: 60,
            textAlign: 'center',
          }}
        >
          {api.method || 'GET'}
        </Box>

        {/* Endpoint Path */}
        <Typography
          sx={{
            flex: 1,
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: colors.text,
          }}
        >
          {api.endpoint}
        </Typography>

        {/* API Name */}
        <Typography
          sx={{
            color: colors.textMuted,
            fontSize: '0.85rem',
            maxWidth: 300,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {api.name}
        </Typography>

        {/* Status Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {api.isPublic ? (
            <Tooltip title="Public API">
              <PublicIcon sx={{ fontSize: 18, color: '#49cc90' }} />
            </Tooltip>
          ) : (
            <Tooltip title="Private API (requires auth)">
              <LockIcon sx={{ fontSize: 18, color: colors.textMuted }} />
            </Tooltip>
          )}
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>

      {/* Expanded Content */}
      <Collapse in={isExpanded}>
        <Box sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
          {/* Description */}
          {api.description && (
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
              {api.description}
            </Typography>
          )}

          {/* Public Toggle */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            mb: 2,
            borderRadius: 1,
            backgroundColor: api.isPublic ? alpha('#49cc90', 0.1) : colors.backgroundSecondary,
            border: `1px solid ${api.isPublic ? alpha('#49cc90', 0.3) : colors.border}`,
          }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {api.isPublic ? '🌐 Public Access' : '🔒 Private Access'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {api.isPublic
                  ? 'Anyone can access without authentication'
                  : 'Requires authentication token'}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={api.isPublic || false}
                  onChange={onTogglePublic}
                  disabled={toggleLoading}
                  color="success"
                  size="small"
                />
              }
              label=""
            />
          </Box>

          {/* Endpoints */}
          <ApiEndpoints
            api={api}
            copiedEndpoint={copiedEndpoint}
            onCopyEndpoint={onCopyEndpoint}
            getPublicEndpoint={getPublicEndpoint}
            colors={colors}
          />

          {/* Parameters */}
          {(api.parameters || []).length > 0 && (
            <ApiParameters
              api={api}
              testParams={testParams}
              onParamChange={onParamChange}
              paramErrors={paramErrors}
              colors={colors}
            />
          )}

          {/* Actions */}
          <ApiActions
            loading={testLoading}
            showSql={showSql}
            onExecute={onTestApi}
            onToggleSql={onToggleSql}
            onDelete={onDeleteClick}
            methodColors={methodColors}
          />

          {/* SQL Preview */}
          <SqlPreview
            show={showSql}
            sql={api.sql || ''}
            copied={copiedSql === api.id}
            onCopy={() => onCopySql(api.sql || '')}
            darkMode={darkMode}
            colors={colors}
          />

          {/* Response */}
          {testResult && (
            <ApiResponse
              result={testResult}
              colors={colors}
              darkMode={darkMode}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
