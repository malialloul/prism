import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  FormControlLabel,
  Checkbox,
  Skeleton,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DownloadIcon from '@mui/icons-material/Download';
import { useFullSchema } from '../../../../api/entities/schema/useFullSchema';
import { useExecuteQuery } from '../../../../api/entities/schema/useExecuteQuery';
import { SAVED_QUERIES_KEY } from '../../../../api/entities/schema/useSavedQueries';
import { SchemaService } from '../../../../api/services/SchemaService';
import { toastService } from '../../../../services';
import QueryWizard from './QueryWizard/QueryWizard';
import { DatabaseEngine, extractParameters, SchemaColumn, SchemaTable, WizardState } from './QueryWizard/types';

interface QueryWizardWrapperProps {
  connectedDatabase: {
    id: string | number;
    name: string;
    engine?: 'postgres' | 'mysql';
  };
  onApiSaved?: () => void;
}

interface QueryResult {
  success?: boolean;
  message?: string;
  rows: Record<string, unknown>[];
  fields: Array<{ name: string; type: string }>;
  rowCount: number;
  executionTime: number;
}

// ============================================================================
// Styled Components
// ============================================================================

const Container = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  backgroundColor: '#0a0a0f',
});

const ResultsDialogTitle = styled(DialogTitle)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#0a0a0f',
  color: '#e4e4e7',
  borderBottom: '1px solid #2a2a3a',
  padding: '16px 24px',
});

const ResultsDialogContent = styled(DialogContent)({
  backgroundColor: '#0d0d14',
  padding: 0,
  minHeight: '300px',
  maxHeight: '60vh',
});

const ResultsMeta = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '12px 24px',
  backgroundColor: '#12121a',
  borderBottom: '1px solid #2a2a3a',
  fontSize: '0.85rem',
  color: '#a1a1aa',
});

const MetaBadge = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  backgroundColor: alpha('#667eea', 0.1),
  borderRadius: '4px',
  color: '#a5b4fc',
  fontSize: '0.8rem',
});

const ResultsTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.8rem',
  '& th': {
    textAlign: 'left',
    padding: '10px 16px',
    backgroundColor: '#12121a',
    color: '#a1a1aa',
    fontWeight: 600,
    borderBottom: '1px solid #2a2a3a',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  '& td': {
    padding: '10px 16px',
    color: '#e4e4e7',
    borderBottom: '1px solid #1e1e2e',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& tr:hover td': {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
});

const LoadingOverlay = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px',
  gap: '16px',
  color: '#a1a1aa',
});

const NoResults = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px',
  gap: '12px',
  color: '#71717a',
});

const SaveDialogContent = styled(DialogContent)({
  backgroundColor: '#0d0d14',
  padding: '24px',
});

const SaveDialogActions = styled(DialogActions)({
  backgroundColor: '#0a0a0f',
  borderTop: '1px solid #2a2a3a',
  padding: '16px 24px',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#12121a',
    color: '#e4e4e7',
    '& fieldset': {
      borderColor: '#2a2a3a',
    },
    '&:hover fieldset': {
      borderColor: '#3a3a4a',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#71717a',
    '&.Mui-focused': {
      color: '#667eea',
    },
  },
});

// ============================================================================
// Component
// ============================================================================

export default function QueryWizardWrapper({
  connectedDatabase,
  onApiSaved,
}: QueryWizardWrapperProps) {
  const queryClient = useQueryClient();

  // Get database engine (default to postgres)
  const engine: DatabaseEngine = connectedDatabase?.engine === 'mysql' ? 'mysql' : 'postgres';

  // Parse database ID as number
  const databaseId = connectedDatabase?.id
    ? typeof connectedDatabase.id === 'string'
      ? parseInt(connectedDatabase.id, 10)
      : connectedDatabase.id
    : undefined;

  // Fetch schema data
  const { data: schemaData, isLoading: schemaLoading } = useFullSchema(databaseId);

  // Execute query hook
  const { mutate: executeQuery, isPending: isExecuting } = useExecuteQuery(databaseId || 0);

  // State
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [lastExecutedSQL, setLastExecutedSQL] = useState<string>('');
  const [lastSQLParams, setLastSQLParams] = useState<(string | number | null)[]>([]);
  const [lastWizardState, setLastWizardState] = useState<WizardState | null>(null);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Transform schema data to match QueryWizard expected format
  const tables: SchemaTable[] = useMemo(() => {
    if (!schemaData?.tables) return [];

    return schemaData.tables.map((t: any) => ({
      name: t.name,
      schema: t.schema || 'public',
      columns: (t.columns || []).map((c: any): SchemaColumn => ({
        name: c.name,
        type: c.type || 'text',
        nullable: c.nullable ?? true,
        isPrimaryKey: c.isPrimaryKey || false,
        foreignKey: c.isForeignKey && c.foreignKeyRef
          ? {
            table: c.foreignKeyRef.table,
            column: c.foreignKeyRef.column,
          }
          : undefined,
        defaultValue: c.defaultValue,
      })),
    }));
  }, [schemaData]);

  // Handle query execution with parameters
  const handleExecute = useCallback(
    (sql: string, params: (string | number | null)[], parameterValues: Record<string, string>) => {
      if (!sql.trim()) {
        toastService.warning('No SQL query to execute');
        return;
      }

      // Resolve placeholder params to actual values
      const resolvedParams = params.map((param) => {
        if (typeof param === 'string' && param.startsWith('{{') && param.endsWith('}}')) {
          const paramName = param.slice(2, -2); // Remove {{ and }}
          return parameterValues[paramName] ?? '';
        }
        return param;
      });

      // Substitute parameter values directly into SQL since backend doesn't support parameterized queries
      // Replace $1, $2, etc. with actual quoted values
      let finalSQL = sql;
      resolvedParams.forEach((value, index) => {
        const placeholder = `$${index + 1}`;
        const escapedValue = String(value).replace(/'/g, "''");
        // Replace the placeholder with quoted value (be careful to not replace $10 when replacing $1)
        const placeholderRegex = new RegExp(`\\$${index + 1}(?!\\d)`, 'g');
        finalSQL = finalSQL.replace(placeholderRegex, `'${escapedValue}'`);
      });

      setLastExecutedSQL(finalSQL);
      setQueryResult(null);
      setResultsDialogOpen(true);

      executeQuery(
        { sql: finalSQL },
        {
          onSuccess: (result: any) => {
            // Check if the API returned an error (success: false)
            if (result.success === false) {
              setQueryResult({
                success: false,
                message: result.message || 'Query execution failed',
                rows: [],
                fields: [],
                rowCount: 0,
                executionTime: result.executionTimeMs || 0,
              });
              toastService.error(result.message || 'Query execution failed');
              return;
            }

            setQueryResult({
              success: true,
              rows: result.rows || [],
              // Handle both 'fields' (array of objects) and 'columns' (array of strings)
              fields: result.fields || (result.columns || []).map((col: string) => ({ name: col, type: 'unknown' })),
              rowCount: result.rowCount || result.rows?.length || 0,
              executionTime: result.executionTime || result.executionTimeMs || 0,
            });
            toastService.success(
              `Query executed successfully (${result.rowCount || result.rows?.length || 0} rows)`
            );
          },
          onError: (error: any) => {
            toastService.error(error.message || 'Failed to execute query');
            setResultsDialogOpen(false);
          },
        }
      );
    },
    [executeQuery]
  );

  // Handle save API dialog open
  const handleOpenSaveDialog = useCallback((sql: string, params: (string | number | null)[], state: WizardState) => {
    setLastExecutedSQL(sql);
    setLastSQLParams(params);
    setLastWizardState(state);
    setSaveName('');
    setSaveDescription('');
    setIsPublic(false);
    setSaveDialogOpen(true);
  }, []);

  // Handle save API
  const handleSaveApi = useCallback(async () => {
    if (!lastExecutedSQL || !databaseId || !saveName.trim()) {
      toastService.warning('Please enter a name for your API');
      return;
    }

    setIsSaving(true);
    try {
      // Extract parameters from the state for the OpenAPI spec
      const extractedParams = lastWizardState ? extractParameters(lastWizardState) : [];

      // Transform SQL: replace $1, $2 etc. with :paramName format for backend
      let sqlForApi = lastExecutedSQL;
      lastSQLParams.forEach((param, index) => {
        if (typeof param === 'string' && param.startsWith('{{') && param.endsWith('}}')) {
          const paramName = param.slice(2, -2); // Remove {{ and }}
          const placeholderRegex = new RegExp(`\\$${index + 1}(?!\\d)`, 'g');
          sqlForApi = sqlForApi.replace(placeholderRegex, `:${paramName}`);
        }
      });

      // Map parameters to the format expected by the backend
      const parameters = extractedParams.map((param) => {
        // Find the filter to get column info
        const filter = lastWizardState?.filters.find((f) => f.id === param.filterId);
        const having = lastWizardState?.havingConditions.find((h) => h.id === param.filterId);

        // For pagination params
        if (param.name === 'pagesize' || param.name === 'pagecount') {
          return {
            name: param.name,
            columnName: param.name,
            columnType: 'integer',
            operator: '=',
            required: param.isRequired,
          };
        }

        // For filter params
        if (filter) {
          return {
            name: param.name,
            columnName: filter.column,
            columnType: filter.columnType || 'text',
            operator: filter.operator,
            required: param.isRequired,
          };
        }

        // For HAVING params
        if (having) {
          const agg = lastWizardState?.aggregates.find((a) => a.id === having.aggregateId);
          return {
            name: param.name,
            columnName: agg?.column || param.name,
            columnType: 'numeric',
            operator: having.operator,
            required: param.isRequired,
          };
        }

        return {
          name: param.name,
          columnName: param.name,
          columnType: 'text',
          operator: '=',
          required: param.isRequired,
        };
      });

      await SchemaService.saveQuery(databaseId, saveName.trim(), sqlForApi, {
        description: saveDescription.trim(),
        isPublic,
        parameters: parameters.length > 0 ? parameters : undefined,
      });

      // Invalidate saved queries cache
      queryClient.invalidateQueries({ queryKey: [SAVED_QUERIES_KEY, databaseId] });

      toastService.success('API saved successfully');
      setSaveDialogOpen(false);
      onApiSaved?.();
    } catch (error: any) {
      toastService.error(error.message || 'Failed to save API');
    } finally {
      setIsSaving(false);
    }
  }, [lastExecutedSQL, lastSQLParams, lastWizardState, databaseId, saveName, saveDescription, isPublic, queryClient, onApiSaved]);

  // Export results as CSV
  const handleExportCSV = useCallback(() => {
    if (!queryResult || queryResult.rows.length === 0) return;

    const headers = queryResult.fields.map((f) => f.name).join(',');
    const rows = queryResult.rows
      .map((row) =>
        queryResult.fields
          .map((f) => {
            const val = row[f.name];
            if (val === null) return '';
            const str = String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(',')
      )
      .join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [queryResult]);

  // Loading state - show full-page skeleton matching wizard design
  if (schemaLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
          {/* Main section - WizardMain */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Stepper - StepperContainer */}
            <Box sx={{
              p: '16px 24px',
              borderBottom: '1px solid #1e1e2e',
              backgroundColor: '#0d0d14',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[
                  { label: 'Table', width: 50 },
                  { label: 'Joins', width: 45 },
                  { label: 'Fields', width: 50 },
                  { label: 'Filters', width: 55 },
                  { label: 'Aggregate', width: 75 },
                  { label: 'Sort', width: 40 },
                  { label: 'Review', width: 60 },
                ].map((step, i) => (
                  <React.Fragment key={i}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      p: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: i === 0 ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                    }}>
                      <Skeleton
                        variant="circular"
                        width={28}
                        height={28}
                        sx={{ bgcolor: i === 0 ? '#667eea' : '#2a2a3a' }}
                      />
                      <Skeleton
                        variant="text"
                        width={step.width}
                        height={20}
                        sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}
                      />
                    </Box>
                    {i < 6 && (
                      <Skeleton
                        variant="rectangular"
                        width={24}
                        height={2}
                        sx={{ bgcolor: '#2a2a3a', flexShrink: 0 }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>

            {/* Step Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: '24px' }}>
              {/* Step Header */}
              <Box sx={{ mb: '24px' }}>
                <Skeleton variant="text" width={280} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: '8px' }} />
                <Skeleton variant="text" width={450} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              </Box>

              {/* Instructions box */}
              <Box sx={{
                p: '12px 16px',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '8px',
                mb: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: 'rgba(165, 180, 252, 0.3)' }} />
                <Skeleton variant="text" width={400} height={18} sx={{ bgcolor: 'rgba(165, 180, 252, 0.2)' }} />
              </Box>

              {/* Search field */}
              <Skeleton
                variant="rectangular"
                height={48}
                sx={{ bgcolor: '#12121a', borderRadius: '8px', mb: '20px', border: '1px solid #2a2a3a' }}
              />

              {/* Grid of table cards */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px'
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      p: '16px',
                      backgroundColor: '#12121a',
                      border: '1px solid #2a2a3a',
                      borderRadius: '10px',
                    }}
                  >
                    <Skeleton variant="text" width={120} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: '4px' }} />
                    <Skeleton variant="text" width={80} height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Box sx={{ display: 'flex', gap: '12px', mt: '8px' }}>
                      <Skeleton variant="text" width={60} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
                      <Skeleton variant="text" width={50} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Navigation Bar */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: '16px 24px',
              borderTop: '1px solid #1e1e2e',
              backgroundColor: '#0d0d14',
            }}>
              <Skeleton variant="rectangular" width={70} height={40} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.05)' }} />
              <Skeleton variant="rectangular" width={70} height={40} sx={{ borderRadius: '8px', bgcolor: '#667eea' }} />
            </Box>
          </Box>

          {/* SQL Preview Sidebar - WizardSidebar */}
          <Box sx={{
            width: '360px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #1e1e2e',
            backgroundColor: '#0d0d14',
          }}>
            {/* Preview Header */}
            <Box sx={{
              p: '16px',
              borderBottom: '1px solid #1e1e2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Skeleton variant="text" width={90} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Box>

            {/* Preview Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: '16px' }}>
              <Box sx={{
                p: '16px',
                backgroundColor: '#0a0a0f',
                borderRadius: '8px',
                minHeight: 150,
              }}>
                <Skeleton variant="text" width="90%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 1 }} />
                <Skeleton variant="text" width="70%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 1 }} />
                <Skeleton variant="text" width="80%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      {/* Query Wizard */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <QueryWizard
          tables={tables}
          engine={engine}
          onExecute={handleExecute}
          onSave={handleOpenSaveDialog}
          isExecuting={isExecuting}
        />
      </Box>

      {/* Results Dialog */}
      <Dialog
        open={resultsDialogOpen}
        onClose={() => !isExecuting && setResultsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#0a0a0f',
            border: '1px solid #2a2a3a',
            borderRadius: '12px',
          },
        }}
      >
        <ResultsDialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isExecuting && queryResult && (
              <CheckCircleIcon sx={{ color: '#22c55e' }} />
            )}
            Query Results
          </Box>
          <IconButton
            onClick={() => setResultsDialogOpen(false)}
            disabled={isExecuting}
            sx={{ color: '#71717a' }}
          >
            <CloseIcon />
          </IconButton>
        </ResultsDialogTitle>

        <ResultsDialogContent>
          {isExecuting ? (
            <LoadingOverlay>
              <CircularProgress size={48} sx={{ color: '#667eea' }} />
              <Box sx={{ fontSize: '0.9rem' }}>Executing query...</Box>
            </LoadingOverlay>
          ) : queryResult ? (
            <>
              {queryResult.success !== false && (
                <ResultsMeta>
                  <MetaBadge>
                    <strong>{queryResult.rowCount}</strong> rows
                  </MetaBadge>
                  {queryResult.executionTime > 0 && (
                    <MetaBadge>
                      <strong>{queryResult.executionTime}</strong> ms
                    </MetaBadge>
                  )}
                  <MetaBadge>
                    <strong>{queryResult.fields.length}</strong> columns
                  </MetaBadge>
                </ResultsMeta>
              )}

              {queryResult.rows.length > 0 ? (
                <Box sx={{ overflow: 'auto', maxHeight: 'calc(60vh - 100px)' }}>
                  <ResultsTable>
                    <thead>
                      <tr>
                        {queryResult.fields.map((field) => (
                          <th key={field.name}>{field.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.slice(0, 100).map((row, idx) => (
                        <tr key={idx}>
                          {queryResult.fields.map((field) => (
                            <td key={field.name}>
                              {row[field.name] === null ? (
                                <span style={{ color: '#52525b', fontStyle: 'italic' }}>null</span>
                              ) : (
                                String(row[field.name])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </ResultsTable>
                  {queryResult.rows.length > 100 && (
                    <Box sx={{ p: 2, textAlign: 'center', color: '#71717a', fontSize: '0.8rem' }}>
                      Showing first 100 rows of {queryResult.rows.length}
                    </Box>
                  )}
                </Box>
              ) : queryResult.success === false ? (
                <NoResults>
                  <ErrorOutlineIcon sx={{ fontSize: 48, color: '#ef4444' }} />
                  <Box sx={{ fontSize: '1rem', fontWeight: 600, color: '#ef4444' }}>
                    Query Failed
                  </Box>
                  <Box sx={{ color: '#f87171', maxWidth: '500px', textAlign: 'center' }}>
                    {queryResult.message || 'An error occurred while executing the query'}
                  </Box>
                </NoResults>
              ) : (
                <NoResults>
                  <CheckCircleIcon sx={{ fontSize: 48, color: '#22c55e' }} />
                  <Box sx={{ fontSize: '1rem', fontWeight: 600, color: '#e4e4e7' }}>
                    Query executed successfully
                  </Box>
                  <Box>No rows returned</Box>
                </NoResults>
              )}
            </>
          ) : null}
        </ResultsDialogContent>

        {!isExecuting && queryResult && queryResult.rows.length > 0 && (
          <DialogActions sx={{ backgroundColor: '#0a0a0f', borderTop: '1px solid #2a2a3a', p: 2 }}>
            <Button
              onClick={handleExportCSV}
              startIcon={<DownloadIcon />}
              sx={{
                color: '#667eea',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: alpha('#667eea', 0.1),
                },
              }}
            >
              Export CSV
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              onClick={() => setResultsDialogOpen(false)}
              variant="contained"
              sx={{
                backgroundColor: '#667eea',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#5a6fd6',
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Save API Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => !isSaving && setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#0a0a0f',
            border: '1px solid #2a2a3a',
            borderRadius: '12px',
          },
        }}
      >
        <ResultsDialogTitle>
          Save API
          <IconButton
            onClick={() => setSaveDialogOpen(false)}
            disabled={isSaving}
            sx={{ color: '#71717a' }}
          >
            <CloseIcon />
          </IconButton>
        </ResultsDialogTitle>

        <SaveDialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
            <StyledTextField
              label="API Name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g., Get Active Users"
              fullWidth
              required
              autoFocus
            />
            <StyledTextField
              label="Description (optional)"
              value={saveDescription}
              onChange={(e) => setSaveDescription(e.target.value)}
              placeholder="Describe what this API does..."
              fullWidth
              multiline
              rows={3}
            />


            {/* Public Access Toggle */}
            <Box
              sx={{
                padding: '16px',
                backgroundColor: isPublic ? alpha('#49cc90', 0.1) : '#12121a',
                borderRadius: '8px',
                border: `1px solid ${isPublic ? alpha('#49cc90', 0.3) : '#2a2a3a'}`,
                transition: 'all 0.2s ease',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    sx={{
                      color: '#49cc90',
                      '&.Mui-checked': { color: '#49cc90' },
                    }}
                  />
                }
                label={
                  <Box>
                    <Box sx={{ fontWeight: 600, color: '#e4e4e7' }}>
                      {isPublic ? '🌐 Public Access' : '🔒 Private Access'}
                    </Box>
                    <Box sx={{ fontSize: '0.75rem', color: '#71717a', mt: 0.5 }}>
                      {isPublic
                        ? 'Anyone with the link can access this API without authentication'
                        : 'Only authenticated users can access this API'}
                    </Box>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', m: 0 }}
              />
            </Box>
          </Box>
        </SaveDialogContent>

        <SaveDialogActions>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            disabled={isSaving}
            sx={{ color: '#71717a', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveApi}
            variant="contained"
            disabled={isSaving || !saveName.trim()}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              backgroundColor: '#22c55e',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#16a34a',
              },
            }}
          >
            {isSaving ? 'Saving...' : 'Save API'}
          </Button>
        </SaveDialogActions>
      </Dialog>
    </Container>
  );
}
