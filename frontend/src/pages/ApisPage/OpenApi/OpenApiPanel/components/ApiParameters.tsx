import { Box, Typography, TextField, alpha } from '@mui/material';
import type { ApiParametersProps } from './types';

export function ApiParameters({
  api,
  testParams,
  onParamChange,
  paramErrors,
  colors,
}: ApiParametersProps) {
  return (
    <>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.8rem', textTransform: 'uppercase', color: colors.textMuted }}>
        Parameters
      </Typography>
      <Box sx={{
        mb: 2,
        borderRadius: 1,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '150px 100px 1fr',
          gap: 2,
          p: 1,
          backgroundColor: colors.backgroundSecondary,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Name</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Type</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Value</Typography>
        </Box>
        {/* Rows */}
        {(api.parameters || []).map((param, index) => {
          const hasError = paramErrors[param.name];
          return (
            <Box
              key={param.name}
              sx={{
                display: 'grid',
                gridTemplateColumns: '150px 100px 1fr',
                gap: 2,
                p: 1,
                alignItems: 'flex-start',
                borderBottom: index < (api.parameters || []).length - 1 ? `1px solid ${colors.border}` : 'none',
                backgroundColor: hasError ? alpha('#f93e3e', 0.05) : 'transparent',
              }}
            >
              <Box sx={{ pt: 1 }}>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                  {param.name}
                  {param.required && <span style={{ color: '#f93e3e' }}> *</span>}
                </Typography>
                {!param.required && (
                  <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.7rem' }}>
                    optional
                  </Typography>
                )}
              </Box>
              <Box sx={{ pt: 1 }}>
                <Typography variant="caption" sx={{ color: colors.textMuted }}>
                  {param.columnType}
                </Typography>
              </Box>
              <TextField
                size="small"
                type={
                  param.columnType?.toLowerCase().includes('timestamp') ||
                    (param.columnType?.toLowerCase().includes('date') && param.columnType?.toLowerCase().includes('time'))
                    ? 'datetime-local'
                    : param.columnType?.toLowerCase().includes('date')
                      ? 'date'
                      : param.columnType?.toLowerCase() === 'integer' || param.columnType?.toLowerCase() === 'number'
                        ? 'number'
                        : 'text'
                }
                placeholder={param.name === 'pagesize' ? '100' : param.name === 'pagecount' ? '1' : `Enter ${param.name}${param.required ? '' : ' (optional)'}`}
                value={testParams[param.name] || ''}
                onChange={(e) => onParamChange(param.name, e.target.value)}
                fullWidth
                error={hasError}
                helperText={hasError ? 'This field is required' : ''}
                InputLabelProps={{
                  shrink: param.columnType?.toLowerCase().includes('date') || param.columnType?.toLowerCase().includes('timestamp'),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.background,
                    fontSize: '0.85rem',
                  },
                  '& .MuiFormHelperText-root': {
                    marginLeft: 0,
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>
    </>
  );
}
