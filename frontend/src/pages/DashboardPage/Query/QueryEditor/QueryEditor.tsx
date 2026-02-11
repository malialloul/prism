import { useState, useCallback, useEffect, useRef } from 'react';
import { ButtonLoadingSkeleton, usePermissions, AccessRestricted } from '../../../../components';
import {
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import { useExecuteQuery, useSavedQueries, useSaveQuery, useDeleteSavedQuery } from '../../../../api/entities/schema';
import type { QueryResultDto, SavedQueryDto } from '../../../../api/models/SchemaDto';
import { toastService } from '../../../../services';
import { Pagination } from '../../../../components';
import { useWorkspace } from '../../DashboardLayout';
import {
  EditorWrapper,
  EditorHeader,
  EditorTitle,
  EditorActions,
  RunButton,
  SaveButton,
  EditorContent,
  SqlEditorArea,
  SqlTextarea,
  ResultsArea,
  ResultsHeader,
  ResultsTitle,
  ResultsMeta,
  ResultsContent,
  ResultsTable,
  NullValue,
  ErrorMessage,
  SuccessMessage,
  EmptyResults,
  SavedQueriesPanel,
  SavedQueriesHeader,
  SavedQueriesList,
  SavedQueryItem,
  SavedQueryName,
  SaveQueryInput,
  ExportButton,
} from './QueryEditor.styles';

interface QueryEditorProps {
  databaseId: number | undefined;
  engine?: 'postgres' | 'mysql';
  initialQuery?: string;
}

export default function QueryEditor({
  databaseId,
  engine: _engine,
  initialQuery = '',
}: QueryEditorProps) {
  const { canRunQuery, canCreateApi, canCreateDatabase } = usePermissions();
  const workspace = useWorkspace();
  const handleCreateDatabase = workspace?.handleCreateDatabase;
  const [sql, setSql] = useState(initialQuery);
  const [executedSql, setExecutedSql] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResultDto | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [showSavedQueries, setShowSavedQueries] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<string | null>(null);
  const [showCreateDbRestricted, setShowCreateDbRestricted] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  // Track if pagination change should trigger re-execution
  const isPageChangeRef = useRef(false);

  // Calculate pagination display values
  const totalRows = result?.totalCount ?? result?.rowCount ?? 0;
  const totalPages = Math.ceil(totalRows / pageSize);
  const startRow = totalRows > 0 ? page * pageSize + 1 : 0;
  const endRow = Math.min((page + 1) * pageSize, totalRows);

  const { data: savedQueriesData, refetch: refetchSavedQueries } = useSavedQueries(databaseId);
  const savedQueries = savedQueriesData?.queries || [];

  const { mutate: executeQuery, isPending: isExecuting } = useExecuteQuery(databaseId ?? 0, {
    onSuccess: (queryResult) => {
      setResult(queryResult);
    },
    onError: (error) => {
      setResult({
        success: false,
        message: error.message || 'Query execution failed',
      });
    },
  });

  const { mutate: saveQuery, isPending: isSaving } = useSaveQuery(databaseId ?? 0, {
    onSuccess: (response) => {
      toastService.success(response.message);
      setSaveDialogOpen(false);
      setQueryName('');
      refetchSavedQueries();
    },
    onError: (error) => {
      toastService.error(error.message || 'Failed to save query');
    },
  });

  const { mutate: deleteQuery } = useDeleteSavedQuery(databaseId ?? 0, {
    onSuccess: () => {
      refetchSavedQueries();
    },
  });

  // Helper to detect CREATE DATABASE command
  const isCreateDatabaseQuery = useCallback((query: string): boolean => {
    const normalizedSql = query.toLowerCase().replace(/\s+/g, ' ').trim();
    return /\bcreate\s+database\b/.test(normalizedSql);
  }, []);

  const handleRunQuery = useCallback(() => {
    if (!sql.trim() || !databaseId) return;

    // Intercept CREATE DATABASE commands
    if (isCreateDatabaseQuery(sql)) {
      if (canCreateDatabase && handleCreateDatabase) {
        // User has permission - open the Create Database dialog
        handleCreateDatabase();
        toastService.info('Use the Create Database dialog to create a new database.');
      } else if (!canCreateDatabase) {
        // User doesn't have permission - show access restricted dialog
        setShowCreateDbRestricted(true);
      }
      return;
    }

    setExecutedSql(sql);
    setPage(0);
    executeQuery({ sql, page: 0, pageSize });
  }, [sql, databaseId, executeQuery, pageSize, isCreateDatabaseQuery, canCreateDatabase, handleCreateDatabase]);

  // Re-execute query when page or pageSize changes
  useEffect(() => {
    if (isPageChangeRef.current && executedSql && databaseId) {
      executeQuery({ sql: executedSql, page, pageSize });
      isPageChangeRef.current = false;
    }
  }, [page, pageSize, executedSql, databaseId, executeQuery]);

  const handlePageChange = useCallback((newPage: number) => {
    isPageChangeRef.current = true;
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    isPageChangeRef.current = true;
    setPageSize(newSize);
    setPage(0);
  }, []);

  const handleSaveQuery = useCallback(() => {
    if (!queryName.trim() || !sql.trim()) return;
    saveQuery({ name: queryName, sql });
  }, [queryName, sql, saveQuery]);

  const handleLoadQuery = useCallback((query: SavedQueryDto) => {
    setSql(query.sql);
    setShowSavedQueries(false);
  }, []);

  const handleDeleteQuery = useCallback((e: React.MouseEvent, queryId: string) => {
    e.stopPropagation();
    setQueryToDelete(queryId);
  }, []);

  const handleConfirmDeleteQuery = useCallback(() => {
    if (queryToDelete) {
      deleteQuery(queryToDelete);
      setQueryToDelete(null);
    }
  }, [queryToDelete, deleteQuery]);

  const handleExportCSV = useCallback(() => {
    if (!result?.rows || !result.columns) return;

    const csvContent = [
      result.columns.join(','),
      ...result.rows.map(row =>
        result.columns!.map(col => {
          const value = row[col];
          if (value === null) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    URL.revokeObjectURL(url);
    toastService.success('Results exported to CSV');
  }, [result]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunQuery();
    }
  }, [handleRunQuery]);

  // Update SQL when initialQuery changes
  if (initialQuery && initialQuery !== sql && !sql) {
    setSql(initialQuery);
  }

  return (
    <EditorWrapper>
      <EditorHeader>
        <EditorTitle>Query Editor</EditorTitle>
        <EditorActions>
          <Tooltip title="Saved Queries">
            <IconButton
              size="small"
              onClick={() => setShowSavedQueries(!showSavedQueries)}
              sx={{ color: showSavedQueries ? 'primary.main' : 'text.secondary' }}
            >
              <BookmarkIcon sx={{ fontSize: '1.125rem' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={!canCreateApi ? "You're not permitted to do this action" : "Save Query"} arrow>
            <span>
              <SaveButton
                onClick={() => setSaveDialogOpen(true)}
                disabled={!sql.trim() || !databaseId || !canCreateApi}
                style={!canCreateApi ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                startIcon={<SaveIcon sx={{ fontSize: '1rem' }} />}
              >
                Save
              </SaveButton>
            </span>
          </Tooltip>
          <Tooltip title={!canRunQuery ? "You're not permitted to do this action" : "Run Query (Ctrl+Enter)"} arrow>
            <span>
              <RunButton
                onClick={handleRunQuery}
                disabled={!sql.trim() || !databaseId || isExecuting || !canRunQuery}
                style={!canRunQuery ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                startIcon={isExecuting ? <ButtonLoadingSkeleton size="small" /> : <PlayArrowIcon sx={{ fontSize: '1rem' }} />}
              >
                {isExecuting ? 'Running...' : 'Run Query'}
              </RunButton>
            </span>
          </Tooltip>
        </EditorActions>
      </EditorHeader>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {showSavedQueries && (
          <SavedQueriesPanel>
            <SavedQueriesHeader>
              Saved Queries
              <span style={{ fontSize: '0.6875rem', color: 'inherit', opacity: 0.7 }}>
                {savedQueries.length}
              </span>
            </SavedQueriesHeader>
            <SavedQueriesList>
              {savedQueries.map((query) => (
                <SavedQueryItem key={query.id} onClick={() => handleLoadQuery(query)}>
                  <SavedQueryName>{query.name}</SavedQueryName>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteQuery(e, query.id)}
                    sx={{ padding: '0.25rem' }}
                  >
                    <DeleteIcon sx={{ fontSize: '0.875rem' }} />
                  </IconButton>
                </SavedQueryItem>
              ))}
              {savedQueries.length === 0 && (
                <EmptyResults style={{ padding: '1.5rem' }}>
                  <BookmarkIcon sx={{ fontSize: '1.5rem !important' }} />
                  <span style={{ fontSize: '0.75rem' }}>No saved queries</span>
                </EmptyResults>
              )}
            </SavedQueriesList>
          </SavedQueriesPanel>
        )}

        <EditorContent>
          <SqlEditorArea>
            <SqlTextarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={databaseId ? 'SELECT * FROM table_name LIMIT 100;\n\nPress Ctrl+Enter to run' : 'Connect to a database to run queries'}
              disabled={!databaseId}
            />
          </SqlEditorArea>

          <ResultsArea>
            <ResultsHeader>
              <ResultsTitle>Results</ResultsTitle>
              {result && result.success && result.rows && (
                <ResultsMeta>
                  <span>{totalRows} rows</span>
                  <span>{result.executionTimeMs}ms</span>
                  <ExportButton onClick={handleExportCSV} startIcon={<DownloadIcon sx={{ fontSize: '0.875rem' }} />}>
                    Export CSV
                  </ExportButton>
                </ResultsMeta>
              )}
            </ResultsHeader>
            <ResultsContent>
              {!result && (
                <EmptyResults>
                  <CodeIcon />
                  <span>Run a query to see results</span>
                </EmptyResults>
              )}

              {result && !result.success && (
                <ErrorMessage>{result.message}</ErrorMessage>
              )}

              {result && result.success && !result.rows && (
                <SuccessMessage>
                  {result.message || 'Query executed successfully.'}
                  {result.affectedRows !== undefined && result.affectedRows > 0 && (
                    <span> ({result.affectedRows} rows affected)</span>
                  )}
                </SuccessMessage>
              )}

              {result && result.success && result.rows && result.columns && (
                <ResultsTable>
                  <thead>
                    <tr>
                      {result.columns.map((col, colIdx) => (
                        <th key={colIdx}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, idx) => (
                      <tr key={idx}>
                        {result.columns!.map((col, colIdx) => (
                          <td key={colIdx}>
                            {row[col] === null ? (
                              <NullValue>NULL</NullValue>
                            ) : (
                              formatCellValue(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </ResultsTable>
              )}
            </ResultsContent>
            {result && result.success && result.rows && result.columns && (
              <Pagination
                page={page}
                pageSize={pageSize}
                totalRows={totalRows}
                totalPages={totalPages}
                startRow={startRow}
                endRow={endRow}
                isLoading={isExecuting}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </ResultsArea>
        </EditorContent>
      </div>

      {/* Save Query Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Save Query</DialogTitle>
        <DialogContent>
          <SaveQueryInput
            autoFocus
            margin="dense"
            label="Query Name"
            fullWidth
            variant="outlined"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            placeholder="My useful query"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveQuery}
            variant="contained"
            disabled={!queryName.trim() || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Query Confirmation Dialog */}
      <Dialog open={!!queryToDelete} onClose={() => setQueryToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Saved Query</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this saved query? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQueryToDelete(null)}>Cancel</Button>
          <Button
            onClick={handleConfirmDeleteQuery}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Database Access Restricted Dialog */}
      <Dialog open={showCreateDbRestricted} onClose={() => setShowCreateDbRestricted(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <AccessRestricted
            message="Create Database Access Restricted"
            description="You don't have permission to create databases. Please contact the account owner to request access."
            permission="createDatabase"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDbRestricted(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </EditorWrapper>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if (value instanceof Date) return value.toISOString();
    return JSON.stringify(value);
  }
  return String(value);
}
