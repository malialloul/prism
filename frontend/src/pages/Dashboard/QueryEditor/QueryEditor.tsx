import { useState, useCallback } from 'react';
import {
  CircularProgress,
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
import { useExecuteQuery, useSavedQueries, useSaveQuery, useDeleteSavedQuery } from '../../../api/entities/schema';
import type { QueryResultDto, SavedQueryDto } from '../../../api/models/SchemaDto';
import { toastService } from '../../../services';
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
  databaseId: string | undefined;
  engine?: 'postgres' | 'mysql';
  initialQuery?: string;
}

export default function QueryEditor({
  databaseId,
  engine: _engine,
  initialQuery = '',
}: QueryEditorProps) {
  const [sql, setSql] = useState(initialQuery);
  const [result, setResult] = useState<QueryResultDto | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [showSavedQueries, setShowSavedQueries] = useState(false);

  const { data: savedQueriesData, refetch: refetchSavedQueries } = useSavedQueries(databaseId);
  const savedQueries = savedQueriesData?.queries || [];

  const { mutate: executeQuery, isPending: isExecuting } = useExecuteQuery(databaseId || '', {
    onSuccess: (queryResult) => {
      setResult(queryResult);
    },
  });

  const { mutate: saveQuery, isPending: isSaving } = useSaveQuery(databaseId || '', {
    onSuccess: () => {
      setSaveDialogOpen(false);
      setQueryName('');
      refetchSavedQueries();
    },
  });

  const { mutate: deleteQuery } = useDeleteSavedQuery(databaseId || '', {
    onSuccess: () => {
      refetchSavedQueries();
    },
  });

  const handleRunQuery = useCallback(() => {
    if (!sql.trim() || !databaseId) return;
    executeQuery(sql);
  }, [sql, databaseId, executeQuery]);

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
    if (confirm('Are you sure you want to delete this saved query?')) {
      deleteQuery(queryId);
    }
  }, [deleteQuery]);

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
          <SaveButton
            onClick={() => setSaveDialogOpen(true)}
            disabled={!sql.trim() || !databaseId}
            startIcon={<SaveIcon sx={{ fontSize: '1rem' }} />}
          >
            Save
          </SaveButton>
          <RunButton
            onClick={handleRunQuery}
            disabled={!sql.trim() || !databaseId || isExecuting}
            startIcon={isExecuting ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon sx={{ fontSize: '1rem' }} />}
          >
            {isExecuting ? 'Running...' : 'Run Query'}
          </RunButton>
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
                  <span>{result.rowCount} rows</span>
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
