import { useState, useContext } from 'react';
import ApiIcon from '@mui/icons-material/Api';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import CodeIcon from '@mui/icons-material/Code';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StorageIcon from '@mui/icons-material/Storage';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DownloadIcon from '@mui/icons-material/Download';
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
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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

  const [selectedApi, setSelectedApi] = useState<SavedQueryDto | null>(null);
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
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

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

  const handleTogglePublic = async (api: SavedQueryDto) => {
    if (!databaseId) return;

    setToggleLoading(prev => ({ ...prev, [api.id]: true }));
    try {
      await SchemaService.toggleApiPublic(databaseId, api.id, !api.isPublic);
      const result = await refetch();
      // Update selectedApi with the refreshed data
      if (result.data?.queries) {
        const updatedApi = result.data.queries.find(q => q.id === api.id);
        if (updatedApi) {
          setSelectedApi(updatedApi);
        }
      }
    } catch (error: any) {
      console.error('Failed to toggle API public status:', error);
    } finally {
      setToggleLoading(prev => ({ ...prev, [api.id]: false }));
    }
  };

  const getPublicEndpoint = (api: SavedQueryDto) => {
    const slug = getSlugFromEndpoint(api.endpoint);
    return `${window.location.origin}/databases/public/${databaseId}/custom-api/${slug}`;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return { bg: '#61affe', text: '#fff' };
      case 'POST': return { bg: '#49cc90', text: '#fff' };
      case 'PUT': return { bg: '#fca130', text: '#fff' };
      case 'DELETE': return { bg: '#f93e3e', text: '#fff' };
      case 'PATCH': return { bg: '#50e3c2', text: '#000' };
      default: return { bg: '#61affe', text: '#fff' };
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
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
        height: '100%',
        gap: 2,
        color: colors.textMuted,
      }}>
        <ApiIcon sx={{ fontSize: '4rem', opacity: 0.3 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
          No APIs Created
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, textAlign: 'center' }}>
          Use the Query Builder to create and save custom APIs.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', gap: 0 }}>
      {/* Left Panel - API List */}
      <Box sx={{
        width: 360,
        minWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${colors.border}`,
        backgroundColor: colors.backgroundSecondary,
      }}>
        {/* Header */}
        <Box sx={{
          p: 2,
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.backgroundTertiary,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ApiIcon sx={{ color: colors.primary }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                APIs
              </Typography>
              <Chip
                label={savedApis.length}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: alpha(colors.primary, 0.1),
                  color: colors.primary,
                }}
              />
            </Box>
            <Tooltip title="Export Project">
              <IconButton
                size="small"
                onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                disabled={!!exportLoading}
                sx={{
                  backgroundColor: alpha(colors.primary, 0.1),
                  color: colors.primary,
                  '&:hover': { backgroundColor: alpha(colors.primary, 0.2) },
                }}
              >
                {exportLoading ? <CircularProgress size={18} /> : <DownloadIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Export Menu */}
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
            PaperProps={{
              sx: {
                backgroundColor: colors.backgroundCard,
                backgroundImage: 'none',
                minWidth: 280,
                borderRadius: 2,
                border: `1px solid ${colors.border}`,
                boxShadow: darkMode
                  ? '0 8px 32px rgba(0,0,0,0.4)'
                  : '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.text }}>
                Export as Project
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textMuted }}>
                Generate a complete backend project with your APIs
              </Typography>
            </Box>
            {exportOptions.map((option) => (
              <MenuItem
                key={option.id}
                onClick={() => handleExportProject(option)}
                disabled={!!exportLoading}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: alpha(option.color, 0.1),
                  },
                }}
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
                    fontSize: '1rem',
                  }}>
                    {exportLoading === option.id ? (
                      <CircularProgress size={16} sx={{ color: option.color }} />
                    ) : (
                      option.icon
                    )}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                      {option.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: colors.textMuted }}>
                      {option.description}
                    </Typography>
                  }
                />
              </MenuItem>
            ))}
          </Menu>

          {/* Search */}
          <TextField
            size="small"
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: colors.textMuted }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.background,
                fontSize: '0.85rem',
              },
            }}
          />

          {/* Method Filter */}
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
            {['GET', 'POST', 'PUT', 'DELETE'].map(method => (
              <Chip
                key={method}
                label={method}
                size="small"
                onClick={() => setFilterMethod(filterMethod === method ? null : method)}
                sx={{
                  height: 24,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: filterMethod === method
                    ? getMethodColor(method).bg
                    : alpha(getMethodColor(method).bg, 0.1),
                  color: filterMethod === method
                    ? getMethodColor(method).text
                    : getMethodColor(method).bg,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: filterMethod === method
                      ? getMethodColor(method).bg
                      : alpha(getMethodColor(method).bg, 0.2),
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* API List */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
          {filteredApis.map((api) => (
            <Box
              key={api.id}
              onClick={() => setSelectedApi(api)}
              sx={{
                p: 1.5,
                mb: 0.5,
                borderRadius: 1,
                cursor: 'pointer',
                backgroundColor: selectedApi?.id === api.id ? alpha(colors.primary, 0.1) : 'transparent',
                border: `1px solid ${selectedApi?.id === api.id ? colors.primary : 'transparent'}`,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: selectedApi?.id === api.id
                    ? alpha(colors.primary, 0.1)
                    : colors.backgroundHover,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip
                  label={api.method || 'GET'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    backgroundColor: getMethodColor(api.method || 'GET').bg,
                    color: getMethodColor(api.method || 'GET').text,
                  }}
                />
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {api.name}
                </Typography>
                {api.isPublic ? (
                  <PublicIcon sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <LockIcon sx={{ fontSize: 16, color: colors.textMuted }} />
                )}
              </Box>
              <Typography sx={{
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                color: colors.textMuted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {api.endpoint}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Panel - API Details */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
        height: '100%',
      }}>
        {!selectedApi ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            gap: 3,
            p: 4,
            boxSizing: 'border-box',
          }}>
            {/* Decorative Icon */}
            <Box sx={{
              position: 'relative',
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Background circle */}
              <Box sx={{
                position: 'absolute',
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.primary, 0.05)} 100%)`,
                border: `2px dashed ${alpha(colors.primary, 0.2)}`,
              }} />
              {/* Inner circle */}
              <Box sx={{
                position: 'absolute',
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: alpha(colors.primary, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ApiIcon sx={{ fontSize: 40, color: alpha(colors.primary, 0.5) }} />
              </Box>
              {/* Decorative dots */}
              <Box sx={{
                position: 'absolute',
                top: 10,
                right: 15,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#61affe',
              }} />
              <Box sx={{
                position: 'absolute',
                bottom: 15,
                left: 10,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#49cc90',
              }} />
              <Box sx={{
                position: 'absolute',
                top: 25,
                left: 5,
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: '#fca130',
              }} />
            </Box>

            {/* Text content */}
            <Box sx={{ textAlign: 'center', maxWidth: 320 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: colors.text }}>
                Select an API
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textMuted, lineHeight: 1.6 }}>
                Choose an API from the list on the left to view details, test endpoints, and manage access settings.
              </Typography>
            </Box>

            {/* Feature hints */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center',
              mt: 1,
            }}>
              {[
                { icon: <PlayArrowIcon sx={{ fontSize: 16 }} />, label: 'Test endpoints' },
                { icon: <ContentCopyIcon sx={{ fontSize: 16 }} />, label: 'Copy URLs' },
                { icon: <PublicIcon sx={{ fontSize: 16 }} />, label: 'Toggle visibility' },
              ].map((feature, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    backgroundColor: alpha(colors.primary, 0.05),
                    border: `1px solid ${alpha(colors.primary, 0.1)}`,
                  }}
                >
                  <Box sx={{ color: colors.primary, display: 'flex' }}>{feature.icon}</Box>
                  <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 500 }}>
                    {feature.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <>
            {/* API Header */}
            <Box sx={{
              p: 2.5,
              borderBottom: `1px solid ${colors.border}`,
              backgroundColor: colors.backgroundSecondary,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Chip
                      label={selectedApi.method || 'GET'}
                      sx={{
                        height: 28,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: getMethodColor(selectedApi.method || 'GET').bg,
                        color: getMethodColor(selectedApi.method || 'GET').text,
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {selectedApi.name}
                    </Typography>
                    <Tooltip title={selectedApi.isPublic ? 'Public API' : 'Private API'}>
                      {selectedApi.isPublic ? (
                        <Chip
                          icon={<PublicIcon sx={{ fontSize: 14 }} />}
                          label="Public"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 24 }}
                        />
                      ) : (
                        <Chip
                          icon={<LockIcon sx={{ fontSize: 14 }} />}
                          label="Private"
                          size="small"
                          variant="outlined"
                          sx={{ height: 24 }}
                        />
                      )}
                    </Tooltip>
                  </Box>
                  {selectedApi.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {selectedApi.description}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setApiToDelete(selectedApi);
                      setDeleteDialogOpen(true);
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* API Content */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
              {/* Public Toggle */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                mb: 2,
                borderRadius: 2,
                backgroundColor: selectedApi.isPublic ? alpha('#49cc90', 0.1) : colors.backgroundSecondary,
                border: `1px solid ${selectedApi.isPublic ? alpha('#49cc90', 0.3) : colors.border}`,
              }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Public Access
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedApi.isPublic
                      ? 'Anyone can access this API without authentication'
                      : 'Only authenticated users can access this API'}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedApi.isPublic || false}
                      onChange={() => handleTogglePublic(selectedApi)}
                      disabled={toggleLoading[selectedApi.id]}
                      color="success"
                    />
                  }
                  label={toggleLoading[selectedApi.id] ? <CircularProgress size={16} /> : ''}
                />
              </Box>

              {/* Endpoints */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>
                Endpoints
              </Typography>

              <Box sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                backgroundColor: colors.backgroundSecondary,
                border: `1px solid ${colors.border}`,
              }}>
                <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {selectedApi.isPublic ? 'Authenticated Endpoint' : 'Endpoint (requires auth)'}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 1,
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: colors.backgroundTertiary,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                }}>
                  <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {window.location.origin}{selectedApi.endpoint}
                  </Box>
                  <Tooltip title={copiedEndpoint === `${selectedApi.endpoint}-auth` ? 'Copied!' : 'Copy URL'}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyEndpoint(selectedApi.endpoint || '', 'auth')}
                      sx={{ color: copiedEndpoint === `${selectedApi.endpoint}-auth` ? 'success.main' : colors.textMuted }}
                    >
                      {copiedEndpoint === `${selectedApi.endpoint}-auth` ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>

                {selectedApi.isPublic && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Public Endpoint (no auth required)
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 1,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: alpha('#49cc90', 0.1),
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                    }}>
                      <PublicIcon sx={{ fontSize: 18, color: 'success.main' }} />
                      <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getPublicEndpoint(selectedApi)}
                      </Box>
                      <Tooltip title={copiedEndpoint === `${selectedApi.endpoint}-public` ? 'Copied!' : 'Copy Public URL'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyEndpoint(selectedApi.endpoint || '', 'public')}
                          sx={{ color: copiedEndpoint === `${selectedApi.endpoint}-public` ? 'success.main' : colors.textMuted }}
                        >
                          {copiedEndpoint === `${selectedApi.endpoint}-public` ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </>
                )}
              </Box>

              {/* Parameters */}
              {(selectedApi.parameters || []).length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>
                    Parameters
                  </Typography>
                  <Box sx={{
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: colors.backgroundSecondary,
                    border: `1px solid ${colors.border}`,
                    overflow: 'hidden',
                  }}>
                    {(selectedApi.parameters || []).map((param, index) => (
                      <Box
                        key={param.name}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.5,
                          borderBottom: index < (selectedApi.parameters || []).length - 1 ? `1px solid ${colors.border}` : 'none',
                          gap: 2,
                        }}
                      >
                        <Box sx={{ minWidth: 120 }}>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                            {param.name}
                            {param.required && <span style={{ color: '#f93e3e' }}> *</span>}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {param.columnType}
                          </Typography>
                        </Box>
                        <TextField
                          size="small"
                          placeholder={param.name === 'pagesize' ? '100' : param.name === 'pagecount' ? '1' : `Enter ${param.name}`}
                          value={testParams[selectedApi.id]?.[param.name] || ''}
                          onChange={(e) => handleParamChange(selectedApi.id, param.name, e.target.value)}
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: colors.background,
                              fontSize: '0.85rem',
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              {/* Test Button */}
              <Button
                variant="contained"
                fullWidth
                startIcon={testLoading[selectedApi.id] ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                onClick={() => handleTestApi(selectedApi)}
                disabled={testLoading[selectedApi.id]}
                sx={{
                  mb: 2,
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                {testLoading[selectedApi.id] ? 'Executing...' : 'Test API'}
              </Button>

              {/* Test Results */}
              {testResults[selectedApi.id] && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>
                    Response
                  </Typography>
                  <Box sx={{
                    borderRadius: 2,
                    backgroundColor: colors.backgroundSecondary,
                    border: `1px solid ${colors.border}`,
                    overflow: 'hidden',
                    mb: 2,
                  }}>
                    {/* Response Header */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: testResults[selectedApi.id].success === false
                        ? alpha('#f93e3e', 0.1)
                        : alpha('#49cc90', 0.1),
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {testResults[selectedApi.id].success === false ? (
                          <ErrorIcon sx={{ color: '#f93e3e', fontSize: 20 }} />
                        ) : (
                          <CheckCircleIcon sx={{ color: '#49cc90', fontSize: 20 }} />
                        )}
                        <Typography sx={{
                          fontWeight: 600,
                          color: testResults[selectedApi.id].success === false ? '#f93e3e' : '#49cc90',
                        }}>
                          {testResults[selectedApi.id].success === false ? 'Error' : 'Success'}
                        </Typography>
                      </Box>
                      {testResults[selectedApi.id].success !== false && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="caption" sx={{ color: colors.textMuted }}>
                            {testResults[selectedApi.id].rowCount} rows
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 14, color: colors.textMuted }} />
                            <Typography variant="caption" sx={{ color: colors.textMuted }}>
                              {testResults[selectedApi.id].executionTimeMs}ms
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                    {/* Response Body */}
                    <Box sx={{
                      p: 1.5,
                      maxHeight: 300,
                      overflowY: 'auto',
                      backgroundColor: darkMode ? '#1e1e2e' : '#fafafa',
                    }}>
                      {testResults[selectedApi.id].success === false ? (
                        <Typography sx={{ color: '#f93e3e', fontSize: '0.85rem' }}>
                          {testResults[selectedApi.id].error || 'Request failed'}
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
                          {JSON.stringify(testResults[selectedApi.id].rows, null, 2)}
                        </pre>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {/* SQL Preview */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>
                SQL Query
              </Typography>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: darkMode ? '#1e1e2e' : '#fafafa',
                border: `1px solid ${colors.border}`,
                maxHeight: 200,
                overflowY: 'auto',
              }}>
                <pre style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: darkMode ? '#d4d4d4' : '#1e1e1e',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  {selectedApi.sql}
                </pre>
              </Box>
            </Box>
          </>
        )}
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
                if (selectedApi?.id === apiToDelete.id) {
                  setSelectedApi(null);
                }
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
