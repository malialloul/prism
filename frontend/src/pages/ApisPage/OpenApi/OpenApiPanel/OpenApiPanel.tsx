import { useState, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Box } from '@mui/material';
import OpenApiSkeleton from '../../../../components/Skeletons/OpenApiSkeleton';
import { AppContext } from '../../../../App';
import { useSavedQueries, useDeleteSavedQuery } from '../../../../api/entities/schema';
import { QUERY_STATS_KEY } from '../../../../api/entities/databases';
import { SchemaService } from '../../../../api/services/SchemaService';
import type { DatabaseDto } from '../../../../api/models/DatabaseDto';
import type { SavedQueryDto } from '../../../../api/models/SchemaDto';
import { getWorkspaceColors } from '../../../../styles/theme';
import { isDemoModeActive } from '../../../../context/TourContext';
import { DEMO_QUERY_RESULT } from '../../../../context/demoData';
import {
  OpenApiHeader,
  ApiCardItem,
  DeleteApiDialog,
  OpenApiEmptyState,
  type ApiTestResult,
  type OpenApiColors,
} from './components';

interface OpenApiPanelProps {
  connectedDatabase: DatabaseDto;
}

export default function OpenApiPanel({ connectedDatabase }: OpenApiPanelProps) {
  const { darkMode } = useContext(AppContext);
  const queryClient = useQueryClient();
  const themeColors = getWorkspaceColors(darkMode);
  const colors: OpenApiColors = {
    primary: themeColors.primary,
    text: themeColors.text,
    textMuted: themeColors.textMuted,
    textSecondary: themeColors.textSecondary,
    background: themeColors.background,
    backgroundCard: themeColors.backgroundCard,
    backgroundSecondary: themeColors.backgroundSecondary,
    border: themeColors.border,
  };
  const databaseId = Number(connectedDatabase.id);
  const { data: savedQueriesData, isLoading, refetch } = useSavedQueries(databaseId);
  const { mutate: deleteQuery } = useDeleteSavedQuery(databaseId || 0, {
    onSuccess: () => refetch(),
  });

  const [expandedApis, setExpandedApis] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string | null>(null);
  const [testParams, setTestParams] = useState<Record<string, Record<string, string>>>({});
  const [testResults, setTestResults] = useState<Record<string, ApiTestResult>>({});
  const [testLoading, setTestLoading] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apiToDelete, setApiToDelete] = useState<SavedQueryDto | null>(null);
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<string | null>(null);
  const [showSqlFor, setShowSqlFor] = useState<string | null>(null);
  const [paramErrors, setParamErrors] = useState<Record<string, Record<string, boolean>>>({});

  const savedApis = savedQueriesData?.queries || [];

  // Filter APIs based on search and method filter
  const filteredApis = savedApis.filter((api: SavedQueryDto) => {
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
    
    // Return demo data in demo mode
    if (isDemoModeActive()) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      setTestResults(prev => ({
        ...prev,
        [api.id]: {
          ...DEMO_QUERY_RESULT,
          message: 'Demo mode: Showing sample results',
        }
      }));
      setTestLoading(prev => ({ ...prev, [api.id]: false }));
      return;
    }
    
    try {
      const result = await SchemaService.executeSavedQuery(databaseId, slug || api.id, filteredParams, api.method as 'GET' | 'POST');
      setTestResults(prev => ({ ...prev, [api.id]: result }));
      // Invalidate query stats to update the Queries Executed card
      queryClient.invalidateQueries({ queryKey: [...QUERY_STATS_KEY, databaseId] });
    } catch (error: unknown) {
      const err = error as { message?: string; body?: { message?: string } };
      setTestResults(prev => ({
        ...prev,
        [api.id]: {
          success: false,
          error: err?.message || err?.body?.message || 'Request failed'
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

    // In demo mode, show a toast message and don't actually toggle
    if (isDemoModeActive()) {
      return;
    }

    setToggleLoading(prev => ({ ...prev, [api.id]: true }));
    try {
      await SchemaService.toggleApiPublic(databaseId, api.id, !api.isPublic);
      await refetch();
    } catch (error: unknown) {
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

  // Show skeleton while loading
  if (isLoading) {
    return <OpenApiSkeleton />;
  }

  if (savedApis.length === 0) {
    return <OpenApiEmptyState colors={colors} />;
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
      <OpenApiHeader
        databaseName={connectedDatabase.name}
        apiCount={savedApis.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterMethod={filterMethod}
        onFilterChange={setFilterMethod}
        darkMode={darkMode}
      />

      {/* API List - Swagger Style */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {filteredApis.map((api: SavedQueryDto) => (
          <ApiCardItem
            key={api.id}
            api={api}
            isExpanded={expandedApis[api.id] || false}
            onToggleExpanded={toggleApiExpanded}
            testParams={testParams[api.id] || {}}
            onParamChange={(paramName: string, value: string) => handleParamChange(api.id, paramName, value)}
            paramErrors={paramErrors[api.id] || {}}
            testResult={testResults[api.id]}
            testLoading={testLoading[api.id] || false}
            toggleLoading={toggleLoading[api.id] || false}
            copiedEndpoint={copiedEndpoint}
            copiedSql={copiedSql}
            showSql={showSqlFor === api.id}
            onCopyEndpoint={handleCopyEndpoint}
            onCopySql={(sql: string) => handleCopySql(api.id, sql)}
            onTogglePublic={() => handleTogglePublic(api)}
            onToggleSql={() => setShowSqlFor(showSqlFor === api.id ? null : api.id)}
            onTestApi={() => handleTestApi(api)}
            onDeleteClick={() => {
              setApiToDelete(api);
              setDeleteDialogOpen(true);
            }}
            getPublicEndpoint={getPublicEndpoint}
            colors={colors}
            darkMode={darkMode}
          />
        ))}
      </Box>

      {/* Delete Confirmation Dialog */}
      <DeleteApiDialog
        open={deleteDialogOpen}
        apiName={apiToDelete?.name || ''}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          if (apiToDelete) {
            deleteQuery(apiToDelete.id);
          }
          setDeleteDialogOpen(false);
          setApiToDelete(null);
        }}
        colors={colors}
      />
    </Box>
  );
}
