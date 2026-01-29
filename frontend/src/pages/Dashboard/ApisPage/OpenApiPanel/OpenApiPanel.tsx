import { useState, useCallback } from 'react';
import { Box, Tooltip, CircularProgress, Collapse } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import ApiIcon from '@mui/icons-material/Api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import {
  OpenApiWrapper,
  ApiListPanel,
  ApiListHeader,
  ApiListTitle,
  ApiListContent,
  ApiCard,
  ApiCardHeader,
  ApiCardTitle,
  ApiCardDescription,
  ApiCardPath,
  OperationBadge,
  TryItPanel,
  TryItHeader,
  TryItTitle,
  TryItContent,
  TryItSection,
  SectionTitle,
  ParamInput,
  SqlViewSection,
  SqlPreview,
  ExecuteButton,
  DeleteButton,
  ResponseSection,
  ResponseHeader,
  ResponseStatus,
  ResponseTime,
  ResponseBody,
  EmptyState,
  EmptyStateTitle,
  EmptyStateSubtitle,
  ToggleSqlButton,
} from './OpenApiPanel.styles';
import { useGeneratedApis, useDeleteGeneratedApi, useExecuteGeneratedApi } from '../../../../api/entities/ai';
import type { GeneratedApiDto, ExecuteApiResultDto } from '../../../../api/models/AiTypes';
import type { DatabaseDto } from '../../../../api/models/DatabaseDto';

interface OpenApiPanelProps {
  connectedDatabase: DatabaseDto | null;
}

export default function OpenApiPanel({ connectedDatabase }: OpenApiPanelProps) {
  const [selectedApi, setSelectedApi] = useState<GeneratedApiDto | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [showSql, setShowSql] = useState(false);
  const [response, setResponse] = useState<{
    data: ExecuteApiResultDto | null;
    error: string | null;
    time: number;
  } | null>(null);

  const { data: apisData, isLoading } = useGeneratedApis(connectedDatabase?.id?.toString());
  const { mutate: deleteApi, isPending: isDeleting } = useDeleteGeneratedApi(
    connectedDatabase?.id?.toString() || ''
  );
  const { mutate: executeApi, isPending: isExecuting } = useExecuteGeneratedApi();

  const apis = apisData?.apis || [];

  const handleSelectApi = useCallback((api: GeneratedApiDto) => {
    setSelectedApi(api);
    setResponse(null);
    setShowSql(false);
    // Initialize param values
    const initialParams: Record<string, string> = {};
    const params = typeof api.params === 'string' ? JSON.parse(api.params) : api.params;
    params.forEach((param: string) => {
      initialParams[param] = '';
    });
    setParamValues(initialParams);
  }, []);

  const handleParamChange = (param: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [param]: value }));
  };

  const handleExecute = () => {
    if (!selectedApi || !connectedDatabase) return;

    const startTime = performance.now();

    // Convert param values to appropriate types
    const params: Record<string, string | number | boolean | null> = {};
    Object.entries(paramValues).forEach(([key, value]) => {
      if (value === '') {
        params[key] = null;
      } else if (value === 'true') {
        params[key] = true;
      } else if (value === 'false') {
        params[key] = false;
      } else if (!isNaN(Number(value))) {
        params[key] = Number(value);
      } else {
        params[key] = value;
      }
    });

    executeApi(
      {
        databaseId: connectedDatabase.id.toString(),
        apiSlug: selectedApi.slug,
        body: { params },
      },
      {
        onSuccess: (data) => {
          const endTime = performance.now();
          setResponse({
            data,
            error: null,
            time: Math.round(endTime - startTime),
          });
        },
        onError: (error) => {
          const endTime = performance.now();
          setResponse({
            data: null,
            error: error.message || 'Failed to execute API',
            time: Math.round(endTime - startTime),
          });
        },
      }
    );
  };

  const handleDelete = (apiId: string) => {
    if (window.confirm('Are you sure you want to delete this API?')) {
      deleteApi(apiId, {
        onSuccess: () => {
          if (selectedApi?.id === apiId) {
            setSelectedApi(null);
            setResponse(null);
          }
        },
      });
    }
  };

  if (!connectedDatabase) {
    return (
      <OpenApiWrapper>
        <EmptyState sx={{ flex: 1 }}>
          <ApiIcon sx={{ fontSize: '4rem', opacity: 0.3 }} />
          <EmptyStateTitle>No Database Connected</EmptyStateTitle>
          <EmptyStateSubtitle>
            Connect to a database to view your AI-generated API endpoints.
          </EmptyStateSubtitle>
        </EmptyState>
      </OpenApiWrapper>
    );
  }

  return (
    <OpenApiWrapper>
      <ApiListPanel>
        <ApiListHeader>
          <ApiListTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SmartToyIcon sx={{ fontSize: '1rem' }} />
              AI Generated APIs
            </Box>
          </ApiListTitle>
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {apis.length} endpoints
          </Box>
        </ApiListHeader>

        <ApiListContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : apis.length === 0 ? (
            <EmptyState>
              <CodeIcon sx={{ fontSize: '2.5rem', opacity: 0.3 }} />
              <EmptyStateTitle>No APIs Yet</EmptyStateTitle>
              <EmptyStateSubtitle>
                Use the AI chat to generate SQL queries and save them as API endpoints.
              </EmptyStateSubtitle>
            </EmptyState>
          ) : (
            apis.map((api) => (
              <ApiCard
                key={api.id}
                selected={selectedApi?.id === api.id}
                onClick={() => handleSelectApi(api)}
              >
                <ApiCardHeader>
                  <ApiCardTitle>{api.name}</ApiCardTitle>
                  <OperationBadge
                    label={api.operation}
                    operation={api.operation}
                    size="small"
                  />
                </ApiCardHeader>
                {api.description && (
                  <ApiCardDescription>{api.description}</ApiCardDescription>
                )}
                <ApiCardPath>/ai-api/{api.slug}</ApiCardPath>
              </ApiCard>
            ))
          )}
        </ApiListContent>
      </ApiListPanel>

      <TryItPanel>
        {!selectedApi ? (
          <EmptyState>
            <ApiIcon sx={{ fontSize: '3rem', opacity: 0.3 }} />
            <EmptyStateTitle>Select an API</EmptyStateTitle>
            <EmptyStateSubtitle>
              Choose an API endpoint from the list to test it and view the generated SQL.
            </EmptyStateSubtitle>
          </EmptyState>
        ) : (
          <>
            <TryItHeader>
              <TryItTitle>
                <OperationBadge
                  label={selectedApi.operation}
                  operation={selectedApi.operation}
                />
                <span>{selectedApi.name}</span>
              </TryItTitle>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <ToggleSqlButton
                  startIcon={showSql ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  onClick={() => setShowSql(!showSql)}
                >
                  {showSql ? 'Hide SQL' : 'View SQL'}
                </ToggleSqlButton>
                <Tooltip title="Delete API">
                  <DeleteButton
                    size="small"
                    onClick={() => handleDelete(selectedApi.id)}
                    disabled={isDeleting}
                  >
                    <DeleteIcon fontSize="small" />
                  </DeleteButton>
                </Tooltip>
              </Box>
            </TryItHeader>

            <TryItContent>
              <Collapse in={showSql}>
                <SqlViewSection>
                  <SectionTitle>Generated SQL</SectionTitle>
                  <SqlPreview>
                    <code>{selectedApi.sql}</code>
                  </SqlPreview>
                </SqlViewSection>
              </Collapse>

              {(() => {
                const params = typeof selectedApi.params === 'string' 
                  ? JSON.parse(selectedApi.params) 
                  : selectedApi.params;
                return params.length > 0 && (
                  <TryItSection>
                    <SectionTitle>Parameters</SectionTitle>
                    {params.map((param: string, index: number) => (
                      <ParamInput key={param}>
                        <label>
                          ${index + 1} - {param}
                        </label>
                        <input
                          type="text"
                          value={paramValues[param] || ''}
                          onChange={(e) => handleParamChange(param, e.target.value)}
                          placeholder={`Enter ${param}...`}
                        />
                      </ParamInput>
                    ))}
                  </TryItSection>
                );
              })()}

              <TryItSection>
                <ExecuteButton
                  variant="contained"
                  startIcon={isExecuting ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
                  onClick={handleExecute}
                  disabled={isExecuting}
                  fullWidth
                >
                  {isExecuting ? 'Executing...' : 'Execute'}
                </ExecuteButton>
              </TryItSection>

              {response && (
                <ResponseSection>
                  <ResponseHeader>
                    <SectionTitle>Response</SectionTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ResponseStatus success={!response.error}>
                        {response.error ? 'Error' : `${response.data?.rowCount || 0} rows`}
                      </ResponseStatus>
                      <ResponseTime>{response.time}ms</ResponseTime>
                    </Box>
                  </ResponseHeader>
                  <ResponseBody>
                    {response.error ? (
                      <Box sx={{ color: '#f93e3e' }}>{response.error}</Box>
                    ) : (
                      JSON.stringify(response.data?.result || [], null, 2)
                    )}
                  </ResponseBody>
                </ResponseSection>
              )}
            </TryItContent>
          </>
        )}
      </TryItPanel>
    </OpenApiWrapper>
  );
}
