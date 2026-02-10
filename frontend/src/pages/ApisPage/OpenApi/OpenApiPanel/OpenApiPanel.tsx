import { useState, useContext } from 'react';
import ApiIcon from '@mui/icons-material/Api';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StorageIcon from '@mui/icons-material/Storage';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CodeIcon from '@mui/icons-material/Code';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  TextField,
  Button,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Collapse,
} from '@mui/material';
import { AppContext } from '../../../../App';
import { useSavedQueries, useDeleteSavedQuery } from '../../../../api/entities/schema';
import { SchemaService } from '../../../../api/services/SchemaService';
import { getAuthToken } from '../../../../api/httpClient';
import type { DatabaseDto } from '../../../../api/models/DatabaseDto';
import type { SavedQueryDto } from '../../../../api/models/SchemaDto';
import { getDashboardColors } from '../../../../styles/theme';

interface OpenApiPanelProps {
  connectedDatabase: DatabaseDto | null;
}

export default function OpenApiPanel({ connectedDatabase }: OpenApiPanelProps) {
  const { darkMode } = useContext(AppContext);
  const colors = getDashboardColors(darkMode);
  const databaseId = connectedDatabase?.id ? Number(connectedDatabase.id) : undefined;
  const { data: savedQueriesData, isLoading, refetch } = useSavedQueries(databaseId);
  const { mutate: deleteQuery } = useDeleteSavedQuery(databaseId || 0, {
    onSuccess: () => refetch(),
  });

  const [expandedApis, setExpandedApis] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string | null>(null);
  const [testParams, setTestParams] = useState<Record<string, Record<string, string>>>({});
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testLoading, setTestLoading] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apiToDelete, setApiToDelete] = useState<SavedQueryDto | null>(null);
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<string | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [showSqlFor, setShowSqlFor] = useState<string | null>(null);
  const [paramErrors, setParamErrors] = useState<Record<string, Record<string, boolean>>>({});

  const savedApis = savedQueriesData?.queries || [];

  // Filter APIs based on search and method filter
  const filteredApis = savedApis.filter(api => {
    const matchesSearch = !searchQuery ||
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.endpoint?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = !filterMethod || api.method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  const handleCopyEndpoint = (endpoint: string, type: string) => {
    const fullUrl = type === 'public'
      ? getPublicEndpoint({ endpoint } as SavedQueryDto)
      : `${window.location.origin}${endpoint}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedEndpoint(`${endpoint}-${type}`);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const handleCopySql = (apiId: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedSql(apiId);
    setTimeout(() => setCopiedSql(null), 2000);
  };

  // Export project options
  const exportOptions = [
    {
      id: 'spring-boot',
      name: 'Spring Boot (Java)',
      description: 'Generate a Java Spring Boot REST API project',
      endpoint: `/databases/${databaseId}/generate-spring-boot`,
      defaultFilename: 'spring-boot-project.zip',
      color: '#6DB33F',
      icon: '☕',
    },
    {
      id: 'dotnet',
      name: '.NET (C#)',
      description: 'Generate a .NET Core Web API project',
      endpoint: `/databases/${databaseId}/generate-dotnet`,
      defaultFilename: 'dotnet-project.zip',
      color: '#512BD4',
      icon: '🔷',
    },
    {
      id: 'express',
      name: 'Express (Node.js)',
      description: 'Generate a Node.js Express REST API project',
      endpoint: `/databases/${databaseId}/generate-express`,
      defaultFilename: 'express-project.zip',
      color: '#339933',
      icon: '🟢',
    },
  ];

  // Generate and download project
  const handleExportProject = async (option: typeof exportOptions[0]) => {
    if (!databaseId) return;

    setExportMenuAnchor(null);
    setExportLoading(option.id);
    try {
      const token = getAuthToken();
      const response = await fetch(option.endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to generate ${option.name} project`);
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = option.defaultFilename;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) {
          filename = match[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error(`Failed to generate ${option.name} project:`, error);
      alert(error.message || `Failed to generate ${option.name} project`);
    } finally {
      setExportLoading(null);
    }
  };

  const getSlugFromEndpoint = (endpoint?: string) => {
    if (!endpoint) return '';
    const parts = endpoint.split('/');
    return parts[parts.length - 1];
  };

  const handleTestApi = async (api: SavedQueryDto) => {
    if (!databaseId) return;

    // Validate required parameters
    const errors: Record<string, boolean> = {};
    const currentParams = testParams[api.id] || {};
    const apiParams = api.parameters || [];
    
    for (const param of apiParams) {
      if (param.required && !currentParams[param.name]?.trim()) {
        errors[param.name] = true;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setParamErrors(prev => ({ ...prev, [api.id]: errors }));
      return;
    }
    
    // Clear errors and build params - only include non-empty values
    setParamErrors(prev => ({ ...prev, [api.id]: {} }));
    const filteredParams: Record<string, string> = {};
    for (const param of apiParams) {
      const value = currentParams[param.name]?.trim();
      if (value) {
        filteredParams[param.name] = value;
      }
    }

    const slug = getSlugFromEndpoint(api.endpoint);

    setTestLoading(prev => ({ ...prev, [api.id]: true }));
    try {
      const result = await SchemaService.executeSavedQuery(databaseId, slug || api.id, filteredParams, api.method as 'GET' | 'POST');
      setTestResults(prev => ({ ...prev, [api.id]: result }));
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [api.id]: {
          success: false,
          error: error?.message || error?.body?.message || 'Request failed'
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
    // Clear error for this param when user types
    if (paramErrors[apiId]?.[paramName]) {
      setParamErrors(prev => ({
        ...prev,
        [apiId]: {
          ...(prev[apiId] || {}),
          [paramName]: false,
        },
      }));
    }
  };

  const handleTogglePublic = async (api: SavedQueryDto) => {
    if (!databaseId) return;

    setToggleLoading(prev => ({ ...prev, [api.id]: true }));
    try {
      await SchemaService.toggleApiPublic(databaseId, api.id, !api.isPublic);
      await refetch();
    } catch (error: any) {
      console.error('Failed to toggle API public status:', error);
    } finally {
      setToggleLoading(prev => ({ ...prev, [api.id]: false }));
    }
  };

  const toggleApiExpanded = (apiId: string) => {
    setExpandedApis(prev => ({ ...prev, [apiId]: !prev[apiId] }));
  };

  const getPublicEndpoint = (api: SavedQueryDto) => {
    const slug = getSlugFromEndpoint(api.endpoint);
    return `${window.location.origin}/databases/public/${databaseId}/custom-api/${slug}`;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return { bg: '#61affe', text: '#fff', border: '#61affe' };
      case 'POST': return { bg: '#49cc90', text: '#fff', border: '#49cc90' };
      case 'PUT': return { bg: '#fca130', text: '#fff', border: '#fca130' };
      case 'DELETE': return { bg: '#f93e3e', text: '#fff', border: '#f93e3e' };
      case 'PATCH': return { bg: '#50e3c2', text: '#000', border: '#50e3c2' };
      default: return { bg: '#61affe', text: '#fff', border: '#61affe' };
    }
  };

  // Empty states
  if (!connectedDatabase) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 2,
        color: colors.textMuted,
      }}>
        <StorageIcon sx={{ fontSize: '4rem', opacity: 0.3 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
          No Database Connected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect to a database to view your API endpoints.
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1, mb: 2 }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 1, mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (savedApis.length === 0) {
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

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: darkMode ? '#1a1a2e' : '#fafafa',
    }}>
      {/* Swagger-style Header */}
      <Box sx={{
        background: darkMode 
          ? 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)'
          : 'linear-gradient(135deg, #89bf04 0%, #547f00 100%)',
        p: 3,
        color: '#fff',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ApiIcon /> {connectedDatabase?.name || 'Database'} API
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {savedApis.length} endpoints available • Custom APIs
            </Typography>
          </Box>
          <Tooltip title="Export Project">
            <IconButton
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              disabled={!!exportLoading}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
              }}
            >
              {exportLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#fff' },
              },
              '& .MuiInputAdornment-root': { color: 'rgba(255,255,255,0.7)' },
              '& input::placeholder': { color: 'rgba(255,255,255,0.6)' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {['GET', 'POST', 'PUT', 'DELETE'].map(method => (
              <Chip
                key={method}
                label={method}
                size="small"
                onClick={() => setFilterMethod(filterMethod === method ? null : method)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  backgroundColor: filterMethod === method
                    ? getMethodColor(method).bg
                    : 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: filterMethod === method
                      ? getMethodColor(method).bg
                      : 'rgba(255,255,255,0.25)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        PaperProps={{
          sx: {
            backgroundColor: colors.backgroundCard,
            minWidth: 280,
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Export as Project</Typography>
          <Typography variant="caption" sx={{ color: colors.textMuted }}>
            Generate a complete backend project
          </Typography>
        </Box>
        {exportOptions.map((option) => (
          <MenuItem
            key={option.id}
            onClick={() => handleExportProject(option)}
            disabled={!!exportLoading}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                backgroundColor: alpha(option.color, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {exportLoading === option.id ? (
                  <CircularProgress size={16} sx={{ color: option.color }} />
                ) : (
                  option.icon
                )}
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{option.name}</Typography>}
              secondary={<Typography variant="caption" sx={{ color: colors.textMuted }}>{option.description}</Typography>}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* API List - Swagger Style */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        p: 2,
      }}>
        {filteredApis.map((api) => {
          const methodColors = getMethodColor(api.method || 'GET');
          const isExpanded = expandedApis[api.id];
          const result = testResults[api.id];
          const loading = testLoading[api.id];

          return (
            <Box
              key={api.id}
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
                onClick={() => toggleApiExpanded(api.id)}
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
                          onChange={() => handleTogglePublic(api)}
                          disabled={toggleLoading[api.id]}
                          color="success"
                          size="small"
                        />
                      }
                      label=""
                    />
                  </Box>

                  {/* Endpoints */}
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
                        {window.location.origin}{api.endpoint}
                      </Typography>
                      <Tooltip title={copiedEndpoint === `${api.endpoint}-auth` ? 'Copied!' : 'Copy'}>
                        <IconButton size="small" onClick={() => handleCopyEndpoint(api.endpoint || '', 'auth')}>
                          {copiedEndpoint === `${api.endpoint}-auth` ? <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
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
                          <IconButton size="small" onClick={() => handleCopyEndpoint(api.endpoint || '', 'public')}>
                            {copiedEndpoint === `${api.endpoint}-public` ? <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>

                  {/* Parameters */}
                  {(api.parameters || []).length > 0 && (
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
                          const hasError = paramErrors[api.id]?.[param.name];
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
                                value={testParams[api.id]?.[param.name] || ''}
                                onChange={(e) => handleParamChange(api.id, param.name, e.target.value)}
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
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
                      onClick={() => handleTestApi(api)}
                      disabled={loading}
                      sx={{
                        backgroundColor: methodColors.bg,
                        '&:hover': { backgroundColor: alpha(methodColors.bg, 0.85) },
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {loading ? 'Executing...' : 'Execute'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CodeIcon />}
                      onClick={() => setShowSqlFor(showSqlFor === api.id ? null : api.id)}
                      sx={{ textTransform: 'none' }}
                    >
                      {showSqlFor === api.id ? 'Hide SQL' : 'Show SQL'}
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        setApiToDelete(api);
                        setDeleteDialogOpen(true);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Delete
                    </Button>
                  </Box>

                  {/* SQL Preview */}
                  <Collapse in={showSqlFor === api.id}>
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
                        <Tooltip title={copiedSql === api.id ? 'Copied!' : 'Copy SQL'}>
                          <IconButton size="small" onClick={() => handleCopySql(api.id, api.sql || '')}>
                            {copiedSql === api.id ? <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
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
                        {api.sql}
                      </pre>
                    </Box>
                  </Collapse>

                  {/* Response */}
                  {result && (
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
                  )}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: colors.backgroundCard,
            backgroundImage: 'none',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete API</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: colors.textSecondary }}>
            Are you sure you want to delete the API "{apiToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
            onClick={() => {
              if (apiToDelete) {
                deleteQuery(apiToDelete.id);
              }
              setDeleteDialogOpen(false);
              setApiToDelete(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
