import { useState, useCallback, useEffect } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ApiIcon from '@mui/icons-material/Api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Box, CircularProgress, Tabs, Tab } from '@mui/material';
import {
    TryItPanel,
    TryItHeader,
    TryItTitle,
    TryItEndpoint,
    TryItBody,
    TryItSection,
    SectionTitle,
    ParameterRow,
    ParameterLabel,
    ParameterInput,
    ParameterType,
    ExecuteButton,
    ResponseSection,
    ResponseHeader,
    ResponseStatus,
    ResponseTime,
    ResponseBody,
    EmptyTryIt,
    MethodBadge,
    RequestBodyEditor,
    SelectInput,
} from './TryItPanel.styles';
import FilterSection from '../FilterSection/FilterSection';
import ColumnInputForm from '../ColumnInputForm/ColumnInputForm';
import type { ApiEndpoint, TryItState, ColumnInfo, FilterCondition } from '../../ApisPage.types';
import { httpClient } from '../../../../api/httpClient';

interface TryItPanelProps {
    endpoint: ApiEndpoint | null;
    columns: ColumnInfo[];
}

export default function TryItPanelComponent({ endpoint, columns }: TryItPanelProps) {
    const [state, setState] = useState<TryItState>({
        pathParams: {},
        queryParams: {},
        body: '{}',
        response: null,
        isLoading: false,
        error: null,
    });

    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [columnValues, setColumnValues] = useState<Record<string, string>>({});
    const [expandedRecords, setExpandedRecords] = useState<Set<number>>(new Set());
    const [bodyMode, setBodyMode] = useState<'form' | 'json'>('form');

    // Reset state when endpoint changes
    useEffect(() => {
        setFilters([]);
        setColumnValues({});
        setState(prev => ({
            ...prev,
            pathParams: {},
            queryParams: {},
            body: '{}',
            response: null,
            error: null,
        }));
        setExpandedRecords(new Set());
        setBodyMode('form');
    }, [endpoint?.id]);

    // Toggle record expansion
    const toggleRecordExpanded = (index: number) => {
        setExpandedRecords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Expand/collapse all records
    const expandAllRecords = (data: unknown[]) => {
        setExpandedRecords(new Set(data.map((_, i) => i)));
    };

    const collapseAllRecords = () => {
        setExpandedRecords(new Set());
    };

    const handlePathParamChange = (name: string, value: string) => {
        setState((prev) => ({
            ...prev,
            pathParams: { ...prev.pathParams, [name]: value },
        }));
    };

    const handleQueryParamChange = (name: string, value: string) => {
        setState((prev) => ({
            ...prev,
            queryParams: { ...prev.queryParams, [name]: value },
        }));
    };

    const handleBodyChange = (value: string) => {
        setState((prev) => ({ ...prev, body: value }));
    };

    // Build request body from column values
    const buildBodyFromColumnValues = (): Record<string, unknown> => {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(columnValues)) {
            if (value === '') continue; // Skip empty values

            // Find column type to properly convert value
            const col = columns.find(c => c.name === key);
            if (!col) continue;

            if (col.type === 'boolean') {
                body[key] = value === 'true';
            } else if (col.type === 'number') {
                body[key] = parseFloat(value) || 0;
            } else if (value === 'null') {
                body[key] = null;
            } else {
                body[key] = value;
            }
        }
        return body;
    };

    // Build filter params for query string - takes filters as parameter to avoid stale closures
    const buildFilterQueryParams = (currentFilters: FilterCondition[]): Record<string, string> => {
        const params: Record<string, string> = {};
        currentFilters.forEach((filter) => {
            if (filter.operator === 'eq') {
                params[filter.column] = filter.value;
            } else if (filter.operator === 'isNull') {
                params[filter.column] = 'null';
            } else if (filter.operator === 'isNotNull') {
                params[`${filter.column}__isNotNull`] = 'true';
            } else if (filter.operator === 'between') {
                // Between requires comma-separated values: value1,value2
                params[`${filter.column}__between`] = `${filter.value},${filter.value2 || ''}`;
            } else {
                // Handle all other operators: neq, gt, gte, lt, lte, contains, startsWith, endsWith
                params[`${filter.column}__${filter.operator}`] = filter.value;
            }
        });
        return params;
    };

    const executeRequest = useCallback(async () => {
        if (!endpoint) return;

        setState((prev) => ({ ...prev, isLoading: true, error: null, response: null }));

        const startTime = performance.now();

        try {
            let url = endpoint.path;
            for (const [name, value] of Object.entries(state.pathParams)) {
                url = url.replace(`:${name}`, encodeURIComponent(value));
            }

            const queryParams = new URLSearchParams();

            // Add all query parameters that have values
            for (const [name, value] of Object.entries(state.queryParams)) {
                if (value !== undefined && value !== '') {
                    queryParams.append(name, value);
                }
            }

            // Add filters as query params (for GET, PUT, PATCH, DELETE)
            if (filters.length > 0) {
                const filterParams = buildFilterQueryParams(filters);
                for (const [key, value] of Object.entries(filterParams)) {
                    queryParams.append(key, value);
                }
            }

            const queryString = queryParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            console.log('API Request URL:', url);
            console.log('Filters:', filters);

            let response;
            const config = { url, method: endpoint.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete' };

            // Build request body for POST, PUT, PATCH
            if (endpoint.requestBody) {
                let bodyData: Record<string, unknown>;

                if (bodyMode === 'form') {
                    bodyData = buildBodyFromColumnValues();
                } else {
                    try {
                        bodyData = JSON.parse(state.body);
                    } catch {
                        setState((prev) => ({
                            ...prev,
                            isLoading: false,
                            error: 'Invalid JSON in request body',
                        }));
                        return;
                    }
                }

                console.log('Request body:', bodyData);
                response = await httpClient.request({ ...config, data: bodyData });
            } else {
                response = await httpClient.request(config);
            }

            const endTime = performance.now();

            setState((prev) => ({
                ...prev,
                isLoading: false,
                response: {
                    status: response.status,
                    statusText: response.statusText,
                    data: response.data as Record<string, unknown>,
                    time: Math.round(endTime - startTime),
                },
            }));
        } catch (error: unknown) {
            const endTime = performance.now();
            const err = error as { response?: { status: number; statusText: string; data: Record<string, unknown> }; message?: string };

            if (err.response) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    response: {
                        status: err.response!.status,
                        statusText: err.response!.statusText,
                        data: err.response!.data,
                        time: Math.round(endTime - startTime),
                    },
                }));
            } else {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: err.message || 'Request failed',
                }));
            }
        }
    }, [endpoint, state.pathParams, state.queryParams, state.body, filters, columnValues, bodyMode, columns]);

    // Determine which features to show based on HTTP method
    const showFilters = endpoint?.method === 'GET' || endpoint?.method === 'PUT' || endpoint?.method === 'PATCH' || endpoint?.method === 'DELETE';
    const showColumnForm = endpoint?.method === 'POST' || endpoint?.method === 'PUT' || endpoint?.method === 'PATCH';
    const filterTitle = endpoint?.method === 'GET' ? 'Filters' : 'Filter Records (WHERE)';
    // Hide path params for PUT/PATCH/DELETE since we use filters instead
    const showPathParams = endpoint?.method !== 'PUT' && endpoint?.method !== 'PATCH' && endpoint?.method !== 'DELETE';

    if (!endpoint) {
        return (
            <TryItPanel>
                <EmptyTryIt>
                    <ApiIcon sx={{ fontSize: '3rem', opacity: 0.3 }} />
                    <span>Select an endpoint to try it</span>
                </EmptyTryIt>
            </TryItPanel>
        );
    }

    return (
        <TryItPanel>
            <TryItHeader>
                <TryItTitle>
                    <MethodBadge method={endpoint.method} label={endpoint.method} />
                    <TryItEndpoint>{endpoint.summary}</TryItEndpoint>
                </TryItTitle>
                <ExecuteButton onClick={executeRequest} sx={{ py: 0.5, px: 2 }}>
                    {state.isLoading ? (
                        <CircularProgress size={16} color="inherit" />
                    ) : (
                        <PlayArrowIcon fontSize="small" />
                    )}
                    Execute
                </ExecuteButton>
            </TryItHeader>

            <TryItBody sx={{ display: 'flex', flexDirection: 'row' }}>
                {/* Left side - Parameters */}
                <Box sx={{
                    flex: '0 0 45%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    borderRight: 1,
                    borderColor: 'divider',
                    maxHeight: '100%'
                }}>
                    {/* Endpoint path */}
                    <TryItSection sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
                        <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary', wordBreak: 'break-all' }}>
                            {endpoint.path}
                        </Box>
                    </TryItSection>

                    {/* Path Parameters - hidden for PUT/PATCH */}
                    {showPathParams && endpoint.pathParams.length > 0 && (
                        <TryItSection sx={{ py: 1.5 }}>
                            <SectionTitle>Path Parameters</SectionTitle>
                            {endpoint.pathParams.map((param) => (
                                <ParameterRow key={param.name}>
                                    <ParameterLabel>
                                        {param.name}
                                        {param.required && <span style={{ color: '#f93e3e' }}>*</span>}
                                    </ParameterLabel>
                                    <ParameterInput
                                        type="text"
                                        placeholder={param.example || param.description}
                                        value={state.pathParams[param.name] || ''}
                                        onChange={(e) => handlePathParamChange(param.name, e.target.value)}
                                    />
                                    <ParameterType>{param.type}</ParameterType>
                                </ParameterRow>
                            ))}
                        </TryItSection>
                    )}

                    {/* Query Parameters (for GET) */}
                    {endpoint.queryParams.length > 0 && (
                        <TryItSection sx={{ py: 1.5 }}>
                            <SectionTitle>Query Parameters</SectionTitle>
                            {endpoint.queryParams.map((param) => (
                                <ParameterRow key={param.name}>
                                    <ParameterLabel>{param.name}</ParameterLabel>
                                    {param.name === 'sortBy' && columns.length > 0 ? (
                                        <SelectInput
                                            value={state.queryParams[param.name] || ''}
                                            onChange={(e) => handleQueryParamChange(param.name, e.target.value)}
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">-</option>
                                            {columns.map((col) => (
                                                <option key={col.name} value={col.name}>{col.name}</option>
                                            ))}
                                        </SelectInput>
                                    ) : param.enum ? (
                                        <SelectInput
                                            value={state.queryParams[param.name] || ''}
                                            onChange={(e) => handleQueryParamChange(param.name, e.target.value)}
                                            style={{ flex: 1 }}
                                            disabled={param.name === 'sortOrder' && !state.queryParams['sortBy']}
                                        >
                                            <option value="">-</option>
                                            {param.enum.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </SelectInput>
                                    ) : (
                                        <ParameterInput
                                            type={param.type === 'integer' ? 'number' : 'text'}
                                            placeholder={param.example || ''}
                                            value={state.queryParams[param.name] || ''}
                                            onChange={(e) => handleQueryParamChange(param.name, e.target.value)}
                                        />
                                    )}
                                </ParameterRow>
                            ))}
                        </TryItSection>
                    )}

                    {/* Filters - for GET, PUT, PATCH */}
                    {showFilters && columns.length > 0 && (
                        <FilterSection
                            columns={columns}
                            filters={filters}
                            onFiltersChange={setFilters}
                            title={filterTitle}
                        />
                    )}

                    {/* Column Input Form - for POST, PUT, PATCH */}
                    {showColumnForm && columns.length > 0 && (
                        <>
                            <TryItSection sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SectionTitle sx={{ mb: 0 }}>Request Body</SectionTitle>
                                    {/* Only show JSON option for POST */}
                                    {endpoint.method === 'POST' && (
                                        <Tabs
                                            value={bodyMode}
                                            onChange={(_, v) => setBodyMode(v)}
                                            sx={{
                                                minHeight: 'auto',
                                                ml: 'auto',
                                                '& .MuiTab-root': {
                                                    minHeight: 'auto',
                                                    py: 0.5,
                                                    px: 1.5,
                                                    fontSize: '0.7rem',
                                                    minWidth: 'auto'
                                                },
                                                '& .MuiTabs-indicator': { height: 2 }
                                            }}
                                        >
                                            <Tab label="Form" value="form" />
                                            <Tab label="JSON" value="json" />
                                        </Tabs>
                                    )}
                                </Box>
                            </TryItSection>

                            {(bodyMode === 'form' || endpoint.method === 'PUT' || endpoint.method === 'PATCH') ? (
                                <ColumnInputForm
                                    columns={columns}
                                    values={columnValues}
                                    onChange={setColumnValues}
                                    title={endpoint.method === 'POST' ? 'New Record' : 'Update Values'}
                                    description={
                                        endpoint.method === 'POST'
                                            ? 'Fill in the values for the new record'
                                            : 'Set the values to update (empty fields will be ignored)'
                                    }
                                    hideAutoIncrementPK={endpoint.method === 'POST'}
                                    disablePrimaryKeys={endpoint.method === 'PUT' || endpoint.method === 'PATCH'}
                                    disableForeignKeys={endpoint.method === 'PUT' || endpoint.method === 'PATCH'}
                                />
                            ) : (
                                <TryItSection sx={{ py: 1.5, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                    <RequestBodyEditor
                                        value={state.body}
                                        onChange={(e) => handleBodyChange(e.target.value)}
                                        placeholder={JSON.stringify(endpoint.requestBody?.example || {}, null, 2)}
                                        style={{ flex: 1, minHeight: '150px' }}
                                    />
                                </TryItSection>
                            )}
                        </>
                    )}
                </Box>

                {/* Right side - Response */}
                <Box sx={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {(state.response || state.error) ? (
                        <ResponseSection sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: 'none' }}>
                            <ResponseHeader>
                                {state.response ? (
                                    <>
                                        <ResponseStatus success={state.response.status >= 200 && state.response.status < 300}>
                                            {state.response.status} {state.response.statusText}
                                        </ResponseStatus>
                                        <ResponseTime>{state.response.time}ms</ResponseTime>
                                    </>
                                ) : (
                                    <ResponseStatus success={false}>Error</ResponseStatus>
                                )}
                            </ResponseHeader>

                            {/* Render response with expandable records */}
                            {state.error ? (
                                <ResponseBody style={{ flex: 1 }}>{state.error}</ResponseBody>
                            ) : (() => {
                                const data = state.response?.data as { data?: unknown[]; pagination?: { total: number } } | undefined;

                                // Check if response has data array (list endpoint)
                                const records = data?.data;
                                const isArrayResponse = Array.isArray(records);

                                if (isArrayResponse && records.length > 0) {
                                    return (
                                        <Box sx={{ flex: 1, overflow: 'auto', px: 1, py: 0.5 }}>
                                            {/* Pagination info & expand/collapse controls */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 1,
                                                pb: 0.5,
                                                borderBottom: 1,
                                                borderColor: 'divider',
                                                fontSize: '0.7rem',
                                                color: 'text.secondary'
                                            }}>
                                                <Box>
                                                    {data?.pagination ? (
                                                        <span>Showing {records.length} of {data.pagination.total} records</span>
                                                    ) : (
                                                        <span>{records.length} records</span>
                                                    )}
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Box
                                                        onClick={() => expandAllRecords(records)}
                                                        sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                                    >
                                                        Expand all
                                                    </Box>
                                                    <Box
                                                        onClick={collapseAllRecords}
                                                        sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                                    >
                                                        Collapse all
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Records list */}
                                            {records.map((item: unknown, index: number) => {
                                                const record = item as Record<string, unknown>;
                                                const isExpanded = expandedRecords.has(index);
                                                const primaryKey = Object.keys(record)[0];
                                                const primaryValue = record[primaryKey];

                                                return (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            mb: 0.5,
                                                            border: 1,
                                                            borderColor: 'divider',
                                                            borderRadius: 1,
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {/* Record header - clickable */}
                                                        <Box
                                                            onClick={() => toggleRecordExpanded(index)}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                px: 1,
                                                                py: 0.5,
                                                                bgcolor: 'action.hover',
                                                                cursor: 'pointer',
                                                                '&:hover': { bgcolor: 'action.selected' }
                                                            }}
                                                        >
                                                            {isExpanded ? (
                                                                <ExpandLessIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                                            ) : (
                                                                <ExpandMoreIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                                            )}
                                                            <Box sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.primary' }}>
                                                                #{index + 1}
                                                            </Box>
                                                            <Box sx={{ fontSize: '0.7rem', color: 'text.secondary', fontFamily: 'monospace' }}>
                                                                {primaryKey}: {String(primaryValue).substring(0, 50)}
                                                                {String(primaryValue).length > 50 && '...'}
                                                            </Box>
                                                        </Box>

                                                        {/* Record body - expandable */}
                                                        {isExpanded && (
                                                            <Box sx={{ px: 1, py: 0.5, bgcolor: 'background.paper' }}>
                                                                {Object.entries(record).map(([key, value]) => (
                                                                    <Box
                                                                        key={key}
                                                                        sx={{
                                                                            display: 'flex',
                                                                            py: 0.25,
                                                                            fontSize: '0.7rem',
                                                                            borderBottom: 1,
                                                                            borderColor: 'divider',
                                                                            '&:last-child': { borderBottom: 0 }
                                                                        }}
                                                                    >
                                                                        <Box sx={{
                                                                            width: '35%',
                                                                            fontWeight: 600,
                                                                            color: 'primary.main',
                                                                            pr: 1,
                                                                            wordBreak: 'break-all'
                                                                        }}>
                                                                            {key}
                                                                        </Box>
                                                                        <Box sx={{
                                                                            flex: 1,
                                                                            fontFamily: 'monospace',
                                                                            color: value === null ? 'text.disabled' : 'text.primary',
                                                                            wordBreak: 'break-all'
                                                                        }}>
                                                                            {value === null ? 'null' :
                                                                                typeof value === 'object' ? JSON.stringify(value) :
                                                                                    String(value)}
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    );
                                }

                                // Single record or non-array response
                                return (
                                    <ResponseBody style={{ flex: 1 }}>
                                        {JSON.stringify(data, null, 2)}
                                    </ResponseBody>
                                );
                            })()}
                        </ResponseSection>
                    ) : (
                        <Box sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.disabled',
                            gap: 1,
                            bgcolor: 'action.hover',
                        }}>
                            <PlayArrowIcon sx={{ fontSize: '2.5rem', opacity: 0.4 }} />
                            <Box sx={{ fontSize: '0.8rem' }}>Click Execute to see response</Box>
                        </Box>
                    )}
                </Box>
            </TryItBody>
        </TryItPanel>
    );
}
