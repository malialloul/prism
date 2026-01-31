import { useState } from 'react';
import ApiIcon from '@mui/icons-material/Api';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  OpenApiWrapper,
  EmptyState,
  EmptyStateTitle,
  EmptyStateSubtitle,
} from './OpenApiPanel.styles';
import { useSavedQueries, useDeleteSavedQuery } from '../../../../api/entities/schema';
import { SchemaService } from '../../../../api/services/SchemaService';
import type { DatabaseDto } from '../../../../api/models/DatabaseDto';
import type { SavedQueryDto, SavedQueryParameterDto } from '../../../../api/models/SchemaDto';

interface OpenApiPanelProps {
  connectedDatabase: DatabaseDto | null;
}

export default function OpenApiPanel({ connectedDatabase }: OpenApiPanelProps) {
  const databaseId = connectedDatabase?.id ? Number(connectedDatabase.id) : undefined;
  const { data: savedQueriesData, isLoading, refetch } = useSavedQueries(databaseId);
  const { mutate: deleteQuery } = useDeleteSavedQuery(databaseId || 0, {
    onSuccess: () => refetch(),
  });
  
  const [expandedApi, setExpandedApi] = useState<string | false>(false);
  const [testParams, setTestParams] = useState<Record<string, Record<string, string>>>({});
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testLoading, setTestLoading] = useState<Record<string, boolean>>({});

  const savedApis = savedQueriesData?.queries || [];

  const handleCopyEndpoint = (endpoint: string) => {
    const fullUrl = `${window.location.origin}/api${endpoint}`;
    navigator.clipboard.writeText(fullUrl);
  };

  // Extract slug from endpoint like "/databases/2/api/users-orders" -> "users-orders"
  const getSlugFromEndpoint = (endpoint?: string) => {
    if (!endpoint) return '';
    const parts = endpoint.split('/');
    return parts[parts.length - 1];
  };

  const handleTestApi = async (api: SavedQueryDto) => {
    if (!databaseId) return;
    
    const slug = getSlugFromEndpoint(api.endpoint);
    
    setTestLoading(prev => ({ ...prev, [api.id]: true }));
    try {
      const params = testParams[api.id] || {};
      const result = await SchemaService.executeSavedQuery(databaseId, slug || api.id, params, api.method as 'GET' | 'POST');
      setTestResults(prev => ({ ...prev, [api.id]: result }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        [api.id]: { 
          success: false, 
          error: error?.body?.message || error?.message || 'Request failed' 
        } 
      }));
    } finally {
      setTestLoading(prev => ({ ...prev, [api.id]: false }));
    }
  };

  const handleParamChange = (apiId: string, paramName: string, value: string) => {
    setTestParams(prev => ({
      ...prev,
      [apiId]: {
        ...(prev[apiId] || {}),
        [paramName]: value,
      },
    }));
  };

  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});

  const handleTogglePublic = async (api: SavedQueryDto) => {
    if (!databaseId) return;
    
    setToggleLoading(prev => ({ ...prev, [api.id]: true }));
    try {
      await SchemaService.toggleApiPublic(databaseId, api.id, !api.isPublic);
      // Refetch saved queries to update the UI
      refetch();
    } catch (error: any) {
      console.error('Failed to toggle API public status:', error);
    } finally {
      setToggleLoading(prev => ({ ...prev, [api.id]: false }));
    }
  };

  const getPublicEndpoint = (api: SavedQueryDto) => {
    const slug = getSlugFromEndpoint(api.endpoint);
    return `${window.location.origin}/api/databases/public/${databaseId}/api/${slug}`;
  };

  if (!connectedDatabase) {
    return (
      <OpenApiWrapper>
        <EmptyState sx={{ flex: 1 }}>
          <ApiIcon sx={{ fontSize: '4rem', opacity: 0.3 }} />
          <EmptyStateTitle>No Database Connected</EmptyStateTitle>
          <EmptyStateSubtitle>
            Connect to a database to view your API endpoints.
          </EmptyStateSubtitle>
        </EmptyState>
      </OpenApiWrapper>
    );
  }

  if (isLoading) {
    return (
      <OpenApiWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      </OpenApiWrapper>
    );
  }

  if (savedApis.length === 0) {
    return (
      <OpenApiWrapper>
        <EmptyState sx={{ flex: 1 }}>
          <ApiIcon sx={{ fontSize: '4rem', opacity: 0.3 }} />
          <EmptyStateTitle>No APIs Created</EmptyStateTitle>
          <EmptyStateSubtitle>
            Use the Query Builder to create and save custom APIs.
          </EmptyStateSubtitle>
        </EmptyState>
      </OpenApiWrapper>
    );
  }

  return (
    <OpenApiWrapper>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Your APIs ({savedApis.length})
        </Typography>
        
        {savedApis.map((api) => {
          const parameters: SavedQueryParameterDto[] = api.parameters || [];
          const result = testResults[api.id];
          const isTestLoading = testLoading[api.id];
          
          return (
            <Accordion 
              key={api.id}
              expanded={expandedApi === api.id}
              onChange={(_, isExpanded) => setExpandedApi(isExpanded ? api.id : false)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                  <Chip 
                    label={api.method || 'GET'} 
                    size="small" 
                    color={api.method === 'POST' ? 'warning' : 'success'}
                    sx={{ fontWeight: 600, minWidth: 50 }}
                  />
                  <Typography sx={{ fontWeight: 500 }}>{api.name}</Typography>
                  <Tooltip title={api.isPublic ? 'Public API' : 'Private API'}>
                    {api.isPublic ? (
                      <PublicIcon sx={{ fontSize: 18, color: 'success.main' }} />
                    ) : (
                      <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    )}
                  </Tooltip>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      color: 'text.secondary',
                      ml: 'auto',
                      mr: 2,
                    }}
                  >
                    {api.endpoint}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Public Access Toggle */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Public Access
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {api.isPublic 
                          ? 'Anyone can access this API without authentication' 
                          : 'Only authenticated users can access this API'}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={api.isPublic || false}
                          onChange={() => handleTogglePublic(api)}
                          disabled={toggleLoading[api.id]}
                          color="success"
                        />
                      }
                      label={toggleLoading[api.id] ? <CircularProgress size={16} /> : (api.isPublic ? 'Public' : 'Private')}
                      labelPlacement="start"
                    />
                  </Box>

                  {/* Endpoint */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Endpoint {!api.isPublic && '(requires authentication)'}
                    </Typography>
                    <Paper sx={{ p: 1.5, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        sx={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.85rem',
                          flex: 1,
                          wordBreak: 'break-all',
                        }}
                      >
                        {window.location.origin}/api{api.endpoint}
                      </Typography>
                      <Tooltip title="Copy URL">
                        <IconButton size="small" onClick={() => handleCopyEndpoint(api.endpoint || '')}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Paper>
                  </Box>

                  {/* Public Endpoint */}
                  {api.isPublic && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: 'success.main' }}>
                        Public Endpoint (no authentication required)
                      </Typography>
                      <Paper sx={{ p: 1.5, backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PublicIcon sx={{ fontSize: 18, color: 'success.main' }} />
                        <Typography 
                          sx={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.85rem',
                            flex: 1,
                            wordBreak: 'break-all',
                          }}
                        >
                          {getPublicEndpoint(api)}
                        </Typography>
                        <Tooltip title="Copy Public URL">
                          <IconButton 
                            size="small" 
                            onClick={() => navigator.clipboard.writeText(getPublicEndpoint(api))}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Paper>
                    </Box>
                  )}

                  {/* Description */}
                  {api.description && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Description
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {api.description}
                      </Typography>
                    </Box>
                  )}

                  {/* Parameters */}
                  {parameters.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Parameters
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Operator</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Test Value</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {parameters.map((param) => (
                              <TableRow key={param.name}>
                                <TableCell>
                                  <code>{param.name}</code>
                                  {param.required && <span style={{ color: 'red' }}> *</span>}
                                </TableCell>
                                <TableCell>{param.columnType}</TableCell>
                                <TableCell>{param.operator}</TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    placeholder={`Enter ${param.name}`}
                                    value={testParams[api.id]?.[param.name] || ''}
                                    onChange={(e) => handleParamChange(api.id, param.name, e.target.value)}
                                    sx={{ width: 200 }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {/* Test Button */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={isTestLoading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                      onClick={() => handleTestApi(api)}
                      disabled={isTestLoading}
                    >
                      Test API
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this API?')) {
                          deleteQuery(api.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Box>

                  {/* Test Results */}
                  {result && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Response
                      </Typography>
                      {result.success === false ? (
                        <Alert severity="error">{result.error || 'Request failed'}</Alert>
                      ) : (
                        <Paper sx={{ p: 1.5, backgroundColor: '#f5f5f5', maxHeight: 300, overflow: 'auto' }}>
                          <Typography variant="caption" sx={{ color: 'success.main', display: 'block', mb: 1 }}>
                            ✅ {result.rowCount} rows returned • {result.executionTimeMs}ms
                          </Typography>
                          <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto' }}>
                            {JSON.stringify(result.rows?.slice(0, 10), null, 2)}
                          </pre>
                          {result.rows?.length > 10 && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                              Showing first 10 of {result.rowCount} rows
                            </Typography>
                          )}
                        </Paper>
                      )}
                    </Box>
                  )}

                  {/* SQL Preview */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      SQL Query
                    </Typography>
                    <Paper sx={{ p: 1.5, backgroundColor: '#1e1e1e', maxHeight: 150, overflow: 'auto' }}>
                      <pre style={{ margin: 0, color: '#d4d4d4', fontSize: '0.75rem' }}>
                        {api.sql}
                      </pre>
                    </Paper>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </OpenApiWrapper>
  );
}
