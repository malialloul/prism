import { useState, useMemo } from 'react';
import { Box, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StorageIcon from '@mui/icons-material/Storage';
import TableViewIcon from '@mui/icons-material/TableView';
import BuildIcon from '@mui/icons-material/Build';
import {
    ApisPageWrapper,
    ApisHeader,
    ApisTitle,
    ApisTabs,
    ApisTab,
    ApisContent,
    EndpointsList,
    EndpointGroup,
    EndpointGroupHeader,
    EndpointGroupTitle,
    EndpointItem,
    MethodBadge,
    EndpointPath,
    NoDatabaseMessage,
} from './ApisPage.styles';
import TryItPanel from './TryItPanel';
import { OpenApiPanel } from './OpenApiPanel';
import QueryBuilderImproved from './QueryBuilder/QueryBuilderImproved';
import type { ApiEndpoint, ColumnInfo, ColumnType } from './ApisPage.types';
import { getCrudEndpoints } from './ApisPage.types';
import { useSchemaObjects, useTableDetails } from '../../../api/entities/schema';
import type { DatabaseDto } from '../../../api/models/DatabaseDto';
import type { ColumnDto } from '../../../api/models/SchemaDto';
import { usePermissions, AccessRestricted } from '../../../components';

// Map database column types to filter-friendly types
const mapColumnType = (dbType: string): ColumnType => {
    const type = dbType.toLowerCase();

    // Boolean types
    if (type.includes('bool') || type === 'bit' || type === 'tinyint(1)') {
        return 'boolean';
    }

    // Date/time types
    if (type.includes('date') && type.includes('time')) {
        return 'datetime';
    }
    if (type.includes('date') || type.includes('timestamp')) {
        return 'date';
    }
    if (type.includes('time')) {
        return 'datetime';
    }

    // Numeric types
    if (
        type.includes('int') ||
        type.includes('decimal') ||
        type.includes('numeric') ||
        type.includes('float') ||
        type.includes('double') ||
        type.includes('real') ||
        type.includes('money') ||
        type.includes('serial')
    ) {
        return 'number';
    }

    // Enum type
    if (type.includes('enum')) {
        return 'enum';
    }

    // Default to string for text, varchar, char, etc.
    return 'string';
};

// Convert ColumnDto to ColumnInfo for filtering
const columnsToFilterInfo = (columns: ColumnDto[]): ColumnInfo[] => {
    return columns.map(col => ({
        name: col.name,
        type: mapColumnType(col.type),
        isPrimaryKey: col.isPrimaryKey,
        isForeignKey: col.isForeignKey,
        isAutoIncrement: col.extra?.toLowerCase().includes('auto_increment') ||
            col.defaultValue?.toLowerCase().includes('nextval'),
        // TODO: Parse enum values from type if it's an enum
    }));
};

interface ApisPageProps {
    connectedDatabase: DatabaseDto | null;
}

interface TableGroup {
    tableName: string;
    endpoints: ApiEndpoint[];
    expanded: boolean;
}

export default function ApisPage({ connectedDatabase }: ApisPageProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
    const [openApiRefreshKey, setOpenApiRefreshKey] = useState(0);
    
    const { canCreateApi, canTryAutoApis, canTryOpenApi } = usePermissions();

    // Fetch schema objects to get table list
    const { data: schemaData, isLoading } = useSchemaObjects(connectedDatabase?.id);
    const tables = useMemo(() =>
        schemaData?.objects?.filter(o => o.type === 'table').map(o => o.name) || [],
        [schemaData]
    );

    // Fetch details for the selected table to get column info
    const { data: tableDetails } = useTableDetails(
        connectedDatabase?.id,
        selectedTable ?? undefined
    );

    // Convert columns to filter-friendly format
    const columnInfo = useMemo<ColumnInfo[]>(() => {
        if (!tableDetails?.table?.columns) return [];
        return columnsToFilterInfo(tableDetails.table.columns);
    }, [tableDetails]);

    // Generate endpoints for all tables
    const tableGroups: TableGroup[] = useMemo(() => {
        if (!connectedDatabase) return [];
        return tables.map((tableName) => ({
            tableName,
            endpoints: getCrudEndpoints(connectedDatabase.id, tableName),
            expanded: expandedTables.has(tableName),
        }));
    }, [connectedDatabase, tables, expandedTables]);

    const toggleTableExpanded = (tableName: string) => {
        setExpandedTables((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(tableName)) {
                newSet.delete(tableName);
            } else {
                newSet.add(tableName);
            }
            return newSet;
        });
    };

    const handleSelectEndpoint = (endpoint: ApiEndpoint, tableName: string) => {
        setSelectedEndpoint(endpoint);
        setSelectedTable(tableName);
    };

    const handleApiSaved = () => {
        // Trigger refresh of Open API tab
        setOpenApiRefreshKey(prev => prev + 1);
    };

    if (!connectedDatabase) {
        return (
            <ApisPageWrapper>
                <NoDatabaseMessage>
                    <StorageIcon sx={{ fontSize: '4rem', opacity: 0.3 }} />
                    <Box sx={{ fontSize: '1.25rem', fontWeight: 500 }}>No Database Connected</Box>
                    <Box sx={{ fontSize: '0.875rem', maxWidth: '400px' }}>
                        Connect to a database to view and test the auto-generated REST APIs for your tables.
                    </Box>
                </NoDatabaseMessage>
            </ApisPageWrapper>
        );
    }

    return (
        <ApisPageWrapper>
            <ApisHeader>
                <ApisTitle>API Explorer</ApisTitle>
                <ApisTabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                    <ApisTab 
                        icon={<BuildIcon sx={{ fontSize: '1rem', mr: 0.5 }} />} 
                        iconPosition="start" 
                        label="Build Query" 
                    />
                    <ApisTab label="Auto-generated APIs" />
                    <ApisTab label="Open API" />
                </ApisTabs>
            </ApisHeader>

            {activeTab === 0 && (
                <ApisContent>
                    {canCreateApi ? (
                        <QueryBuilderImproved connectedDatabase={connectedDatabase} onApiSaved={handleApiSaved} />
                    ) : (
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AccessRestricted
                                message="Build Query Restricted"
                                description="You don't have permission to create APIs in the Query Builder. Please contact the account owner to request access."
                                permission="createApiInQueryBuilder"
                            />
                        </Box>
                    )}
                </ApisContent>
            )}

            {activeTab === 1 && (
                <ApisContent>
                    {canTryAutoApis ? (
                        <>
                            <EndpointsList>
                                {isLoading ? (
                                    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                        Loading tables...
                                    </Box>
                                ) : tables.length === 0 ? (
                                    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                        No tables found in the database.
                                    </Box>
                                ) : (
                                    tableGroups.map((group) => (
                                        <EndpointGroup key={group.tableName}>
                                            <EndpointGroupHeader onClick={() => toggleTableExpanded(group.tableName)}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <TableViewIcon fontSize="small" sx={{ opacity: 0.6 }} />
                                                    <EndpointGroupTitle>{group.tableName}</EndpointGroupTitle>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                                        {group.endpoints.length} endpoints
                                                    </Box>
                                                    {group.expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                                </Box>
                                            </EndpointGroupHeader>
                                            <Collapse in={group.expanded}>
                                                {group.endpoints.map((endpoint) => (
                                                    <EndpointItem
                                                        key={endpoint.id}
                                                        selected={selectedEndpoint?.id === endpoint.id}
                                                        onClick={() => handleSelectEndpoint(endpoint, group.tableName)}
                                                    >
                                                        <MethodBadge method={endpoint.method} label={endpoint.method} />
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Box sx={{ fontSize: '0.8rem', fontWeight: 500, mb: 0.25 }}>
                                                                {endpoint.summary}
                                                            </Box>
                                                            <EndpointPath>
                                                                {endpoint.path.replace(`/databases/${connectedDatabase.id}/api/`, '/')}
                                                            </EndpointPath>
                                                        </Box>
                                                    </EndpointItem>
                                                ))}
                                            </Collapse>
                                        </EndpointGroup>
                                    ))
                                )}
                            </EndpointsList>

                            <TryItPanel endpoint={selectedEndpoint} columns={columnInfo} />
                        </>
                    ) : (
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AccessRestricted
                                message="Auto-generated APIs Restricted"
                                description="You don't have permission to try auto-generated APIs. Please contact the account owner to request access."
                                permission="tryAutoGeneratedApis"
                            />
                        </Box>
                    )}
                </ApisContent>
            )}

            {activeTab === 2 && (
                <ApisContent key={openApiRefreshKey}>
                    {canTryOpenApi ? (
                        <OpenApiPanel connectedDatabase={connectedDatabase} />
                    ) : (
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AccessRestricted
                                message="Open API Restricted"
                                description="You don't have permission to try OpenAPI. Please contact the account owner to request access."
                                permission="tryOpenApi"
                            />
                        </Box>
                    )}
                </ApisContent>
            )}
        </ApisPageWrapper>
    );
}
