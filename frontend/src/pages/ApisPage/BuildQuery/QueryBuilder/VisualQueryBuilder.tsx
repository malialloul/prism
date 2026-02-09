import React, { useState, useCallback, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import TablesPanel from './TablesPanel';
import JoinCanvas from './JoinCanvas';
import QueryConfigPanel from './QueryConfigPanel';
import SqlPreviewPanel from './SqlPreviewPanel';
import { SaveApiDialog } from './components/SaveApiDialog';
import { useFullSchema } from '../../../../api/entities/schema/useFullSchema';
import { useExecuteQuery } from '../../../../api/entities/schema/useExecuteQuery';
import { SAVED_QUERIES_KEY } from '../../../../api/entities/schema/useSavedQueries';
import { SchemaService } from '../../../../api/services/SchemaService';
import { toastService } from '../../../../services';
import type {
  SchemaTable,
  SchemaColumn,
  CanvasTable,
  TableJoin,
  SelectedField,
  FilterCondition,
  GroupByField,
  HavingCondition,
  GeneratedSQL,
  QueryResult,
  ValidationMessage,
  SQLParameter,
  TablePosition,
} from './types';
import { generateId, getColumnCategory } from './types';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled(Box)({
  display: 'flex',
  height: '100%',
  width: '100%',
  backgroundColor: '#0a0a0f',
  gap: '8px',
  padding: '8px',
});

const LeftSidebar = styled(Box)({
  width: '220px',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
});

const CanvasArea = styled(Box)({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
});

const RightSidebar = styled(Box)({
  width: '340px',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const ConfigArea = styled(Box)({
  height: '300px',
  flexShrink: 0,
});

const PreviewArea = styled(Box)({
  flex: 1,
  minHeight: '180px',
});

const LoadingContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#667eea',
});

// ============================================================================
// SQL GENERATOR
// ============================================================================

type DatabaseEngine = 'postgres' | 'mysql';

// Quote identifier based on database engine (PostgreSQL: ", MySQL: `)
const quoteId = (name: string, engine: DatabaseEngine): string => {
  if (engine === 'mysql') {
    return `\`${name}\``;
  }
  return `"${name}"`;
};

function generateSQL(
  canvasTables: CanvasTable[],
  joins: TableJoin[],
  selectedFields: SelectedField[],
  filters: FilterCondition[],
  groupByFields: GroupByField[],
  havingConditions: HavingCondition[],
  limit: number | null,
  offset: number | null,
  engine: DatabaseEngine = 'postgres'
): GeneratedSQL {
  const validationMessages: ValidationMessage[] = [];
  const parameters: SQLParameter[] = [];

  // Validation
  if (canvasTables.length === 0) {
    return {
      sql: '',
      isValid: false,
      validationMessages: [
        { id: '1', severity: 'info', message: 'Add tables to the canvas to start building your query' },
      ],
      parameters: [],
    };
  }

  if (selectedFields.length === 0) {
    return {
      sql: '',
      isValid: false,
      validationMessages: [
        { id: '1', severity: 'warning', message: 'Select at least one field to generate code' },
      ],
      parameters: [],
    };
  }

  // Check if link is needed but missing
  if (canvasTables.length > 1 && joins.length === 0) {
    validationMessages.push({
      id: 'join-missing',
      severity: 'error',
      message: 'Multiple tables need to be linked - use the Link icon on each table',
    });
  }

  // Check group by requirement when using calculations
  const hasAggregations = selectedFields.some((f) => f.aggregation);
  const nonAggregatedFields = selectedFields.filter((f) => !f.aggregation);
  
  if (hasAggregations && nonAggregatedFields.length > 0) {
    const missingGroupBy = nonAggregatedFields.filter(
      (f) => !groupByFields.some((g) => g.tableId === f.tableId && g.columnName === f.columnName)
    );
    
    if (missingGroupBy.length > 0) {
      validationMessages.push({
        id: 'groupby-missing',
        severity: 'warning',
        message: `Add these fields to "Organize By": ${missingGroupBy.map((f) => f.columnName).join(', ')}`,
      });
    }
  }

  // Build SELECT clause
  const selectParts = selectedFields.map((field) => {
    let col = `${quoteId(field.tableName, engine)}.${quoteId(field.columnName, engine)}`;
    
    if (field.aggregation) {
      col = `${field.aggregation}(${col})`;
    }
    
    if (field.alias) {
      col += ` AS ${quoteId(field.alias, engine)}`;
    }
    
    return col;
  });

  // Build FROM clause
  const baseTable = canvasTables[0];
  let fromClause = quoteId(baseTable.name, engine);

  // Build JOINs
  for (const join of joins) {
    const sourceTable = canvasTables.find((t) => t.id === join.sourceTableId);
    const targetTable = canvasTables.find((t) => t.id === join.targetTableId);
    
    if (sourceTable && targetTable) {
      fromClause += `\n  ${join.type} JOIN ${quoteId(targetTable.name, engine)} ON ${quoteId(sourceTable.name, engine)}.${quoteId(join.sourceColumn, engine)} = ${quoteId(targetTable.name, engine)}.${quoteId(join.targetColumn, engine)}`;
    }
  }

  // Build WHERE clause
  let whereClause = '';
  if (filters.length > 0) {
    const whereParts = filters.map((filter, idx) => {
      let condition = '';
      
      if (idx > 0) {
        condition += filter.logic + ' ';
      }
      
      const col = `${quoteId(filter.tableName, engine)}.${quoteId(filter.columnName, engine)}`;
      
      if (filter.isParameter) {
        // Add to parameters list
        parameters.push({
          name: filter.parameterName || filter.columnName,
          columnName: filter.columnName,
          columnType: filter.columnType,
          operator: filter.operator,
          required: true,
        });
        
        const paramName = `@${filter.parameterName || filter.columnName}`;
        
        switch (filter.operator) {
          case 'EQUALS':
            condition += `${col} = ${paramName}`;
            break;
          case 'NOT_EQUALS':
            condition += `${col} <> ${paramName}`;
            break;
          case 'GREATER_THAN':
            condition += `${col} > ${paramName}`;
            break;
          case 'LESS_THAN':
            condition += `${col} < ${paramName}`;
            break;
          case 'GREATER_OR_EQUAL':
            condition += `${col} >= ${paramName}`;
            break;
          case 'LESS_OR_EQUAL':
            condition += `${col} <= ${paramName}`;
            break;
          case 'LIKE':
            condition += `${col} LIKE ${paramName}`;
            break;
          default:
            condition += `${col} = ${paramName}`;
        }
      } else {
        const value = filter.value;
        const isString = getColumnCategory(filter.columnType) === 'string';
        const formattedValue = isString ? `'${value}'` : value;
        
        switch (filter.operator) {
          case 'EQUALS':
            condition += `${col} = ${formattedValue}`;
            break;
          case 'NOT_EQUALS':
            condition += `${col} <> ${formattedValue}`;
            break;
          case 'GREATER_THAN':
            condition += `${col} > ${formattedValue}`;
            break;
          case 'LESS_THAN':
            condition += `${col} < ${formattedValue}`;
            break;
          case 'GREATER_OR_EQUAL':
            condition += `${col} >= ${formattedValue}`;
            break;
          case 'LESS_OR_EQUAL':
            condition += `${col} <= ${formattedValue}`;
            break;
          case 'LIKE':
            condition += `${col} LIKE '%${value}%'`;
            break;
          case 'NOT_LIKE':
            condition += `${col} NOT LIKE '%${value}%'`;
            break;
          case 'IS_NULL':
            condition += `${col} IS NULL`;
            break;
          case 'IS_NOT_NULL':
            condition += `${col} IS NOT NULL`;
            break;
          case 'IN':
            if (Array.isArray(value)) {
              condition += `${col} IN (${value.map((v) => isString ? `'${v}'` : v).join(', ')})`;
            }
            break;
          case 'BETWEEN':
            if (Array.isArray(value) && value.length === 2) {
              condition += `${col} BETWEEN ${value[0]} AND ${value[1]}`;
            }
            break;
          default:
            condition += `${col} = ${formattedValue}`;
        }
      }
      
      return condition;
    });
    
    whereClause = whereParts.join('\n  ');
  }

  // Build GROUP BY clause
  let groupByClause = '';
  if (groupByFields.length > 0) {
    groupByClause = groupByFields
      .map((g) => `${quoteId(g.tableName, engine)}.${quoteId(g.columnName, engine)}`)
      .join(', ');
  }

  // Build HAVING clause
  let havingClause = '';
  if (havingConditions.length > 0) {
    const havingParts = havingConditions.map((h) => {
      const agg = `${h.aggregation}(${quoteId(h.tableName, engine)}.${quoteId(h.columnName, engine)})`;
      
      switch (h.operator) {
        case 'EQUALS':
          return `${agg} = ${h.value}`;
        case 'NOT_EQUALS':
          return `${agg} <> ${h.value}`;
        case 'GREATER_THAN':
          return `${agg} > ${h.value}`;
        case 'LESS_THAN':
          return `${agg} < ${h.value}`;
        case 'GREATER_OR_EQUAL':
          return `${agg} >= ${h.value}`;
        case 'LESS_OR_EQUAL':
          return `${agg} <= ${h.value}`;
        default:
          return `${agg} = ${h.value}`;
      }
    });
    
    havingClause = havingParts.join(' AND ');
  }

  // Build ORDER BY clause
  const sortedFields = selectedFields
    .filter((f) => f.sortOrder)
    .sort((a, b) => (a.sortPriority || 0) - (b.sortPriority || 0));
  
  let orderByClause = '';
  if (sortedFields.length > 0) {
    orderByClause = sortedFields
      .map((f) => {
        let col = f.aggregation
          ? `${f.aggregation}(${quoteId(f.tableName, engine)}.${quoteId(f.columnName, engine)})`
          : `${quoteId(f.tableName, engine)}.${quoteId(f.columnName, engine)}`;
        return `${col} ${f.sortOrder}`;
      })
      .join(', ');
  }

  // Assemble SQL
  let sql = `SELECT\n  ${selectParts.join(',\n  ')}\nFROM ${fromClause}`;
  
  if (whereClause) {
    sql += `\nWHERE ${whereClause}`;
  }
  
  if (groupByClause) {
    sql += `\nGROUP BY ${groupByClause}`;
  }
  
  if (havingClause) {
    sql += `\nHAVING ${havingClause}`;
  }
  
  if (orderByClause) {
    sql += `\nORDER BY ${orderByClause}`;
  }
  
  if (limit !== null) {
    sql += `\nLIMIT ${limit}`;
  }
  
  if (offset !== null && offset > 0) {
    sql += `\nOFFSET ${offset}`;
  }

  const hasErrors = validationMessages.some((m) => m.severity === 'error');

  return {
    sql,
    isValid: !hasErrors,
    validationMessages,
    parameters,
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface VisualQueryBuilderProps {
  connectedDatabase: { id: string | number; name: string; engine?: 'postgres' | 'mysql' } | null;
  onApiSaved?: () => void;
}

export default function VisualQueryBuilder({
  connectedDatabase,
  onApiSaved,
}: VisualQueryBuilderProps) {
  const queryClient = useQueryClient();
  
  // Get database engine (default to postgres)
  const engine: DatabaseEngine = connectedDatabase?.engine || 'postgres';
  
  // Parse database ID as number
  const databaseId = connectedDatabase?.id 
    ? typeof connectedDatabase.id === 'string' 
      ? parseInt(connectedDatabase.id, 10) 
      : connectedDatabase.id
    : undefined;
  
  // Fetch schema data
  const { data: schemaData, isLoading: schemaLoading } = useFullSchema(databaseId);
  
  // Execute query hook
  const { mutate: executeQuery, isPending: isExecuting } = useExecuteQuery(
    databaseId || 0
  );

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [canvasTables, setCanvasTables] = useState<CanvasTable[]>([]);
  const [joins, setJoins] = useState<TableJoin[]>([]);
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [groupByFields, setGroupByFields] = useState<GroupByField[]>([]);
  const [havingConditions, setHavingConditions] = useState<HavingCondition[]>([]);
  const [limit, setLimit] = useState<number | null>(100);
  const [offset, setOffset] = useState<number | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Convert schema data to table format
  const tables: SchemaTable[] = useMemo(() => {
    if (!schemaData?.tables) return [];
    return schemaData.tables.map((t: any) => ({
      name: t.name,
      schema: t.schema || 'public',
      columns: t.columns || [],
    }));
  }, [schemaData]);

  // Tables already on canvas
  const tablesOnCanvas = useMemo(
    () => canvasTables.map((t) => t.name),
    [canvasTables]
  );

  // Generate SQL
  const generatedSQL = useMemo(
    () =>
      generateSQL(
        canvasTables,
        joins,
        selectedFields,
        filters,
        groupByFields,
        havingConditions,
        limit,
        offset,
        engine
      ),
    [canvasTables, joins, selectedFields, filters, groupByFields, havingConditions, limit, offset, engine]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTableDragStart = useCallback((table: SchemaTable) => {
    // Could be used for visual feedback
  }, []);

  const handleTableAdd = useCallback(
    (table: SchemaTable) => {
      if (tablesOnCanvas.includes(table.name)) return;

      // Calculate position for new table
      const baseX = 100 + canvasTables.length * 300;
      const baseY = 100;

      const newTable: CanvasTable = {
        id: generateId(),
        name: table.name,
        schema: table.schema,
        columns: table.columns,
        position: { x: baseX, y: baseY },
      };

      setCanvasTables((prev) => [...prev, newTable]);
    },
    [canvasTables, tablesOnCanvas]
  );

  const handleTableDrop = useCallback(
    (table: SchemaTable, position: TablePosition) => {
      if (tablesOnCanvas.includes(table.name)) return;

      const newTable: CanvasTable = {
        id: generateId(),
        name: table.name,
        schema: table.schema,
        columns: table.columns,
        position,
      };

      setCanvasTables((prev) => [...prev, newTable]);
    },
    [tablesOnCanvas]
  );

  const handleTableMove = useCallback((tableId: string, position: TablePosition) => {
    setCanvasTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, position } : t))
    );
  }, []);

  const handleTableRemove = useCallback((tableId: string) => {
    setCanvasTables((prev) => prev.filter((t) => t.id !== tableId));
    setJoins((prev) =>
      prev.filter((j) => j.sourceTableId !== tableId && j.targetTableId !== tableId)
    );
    setSelectedFields((prev) => prev.filter((f) => f.tableId !== tableId));
    setFilters((prev) => prev.filter((f) => f.tableId !== tableId));
    setGroupByFields((prev) => prev.filter((g) => g.tableId !== tableId));
    setHavingConditions((prev) => prev.filter((h) => h.tableId !== tableId));
  }, []);

  const handleJoinAdd = useCallback((join: Omit<TableJoin, 'id'>) => {
    setJoins((prev) => [...prev, { ...join, id: generateId() }]);
  }, []);

  const handleJoinUpdate = useCallback((joinId: string, updates: Partial<TableJoin>) => {
    setJoins((prev) =>
      prev.map((j) => (j.id === joinId ? { ...j, ...updates } : j))
    );
  }, []);

  const handleJoinRemove = useCallback((joinId: string) => {
    setJoins((prev) => prev.filter((j) => j.id !== joinId));
  }, []);

  const handleFieldToggle = useCallback(
    (tableId: string, column: SchemaColumn) => {
      const table = canvasTables.find((t) => t.id === tableId);
      if (!table) return;

      const existing = selectedFields.find(
        (f) => f.tableId === tableId && f.columnName === column.name
      );

      if (existing) {
        setSelectedFields((prev) => prev.filter((f) => f.id !== existing.id));
      } else {
        const newField: SelectedField = {
          id: generateId(),
          tableId,
          tableName: table.name,
          columnName: column.name,
          columnType: column.type,
          aggregation: null,
          sortOrder: null,
        };
        setSelectedFields((prev) => [...prev, newField]);
      }
    },
    [canvasTables, selectedFields]
  );

  const handleFieldUpdate = useCallback(
    (fieldId: string, updates: Partial<SelectedField>) => {
      setSelectedFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
      );
    },
    []
  );

  const handleFieldRemove = useCallback((fieldId: string) => {
    setSelectedFields((prev) => prev.filter((f) => f.id !== fieldId));
  }, []);

  const handleFieldsReorder = useCallback((fields: SelectedField[]) => {
    setSelectedFields(fields);
  }, []);

  const handleFilterAdd = useCallback((filter: Omit<FilterCondition, 'id'>) => {
    setFilters((prev) => [...prev, { ...filter, id: generateId() }]);
  }, []);

  const handleFilterUpdate = useCallback(
    (filterId: string, updates: Partial<FilterCondition>) => {
      setFilters((prev) =>
        prev.map((f) => (f.id === filterId ? { ...f, ...updates } : f))
      );
    },
    []
  );

  const handleFilterRemove = useCallback((filterId: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== filterId));
  }, []);

  const handleGroupByAdd = useCallback((field: Omit<GroupByField, 'id'>) => {
    setGroupByFields((prev) => [...prev, { ...field, id: generateId() }]);
  }, []);

  const handleGroupByRemove = useCallback((fieldId: string) => {
    setGroupByFields((prev) => prev.filter((g) => g.id !== fieldId));
  }, []);

  const handleHavingAdd = useCallback((condition: Omit<HavingCondition, 'id'>) => {
    setHavingConditions((prev) => [...prev, { ...condition, id: generateId() }]);
  }, []);

  const handleHavingUpdate = useCallback(
    (conditionId: string, updates: Partial<HavingCondition>) => {
      setHavingConditions((prev) =>
        prev.map((h) => (h.id === conditionId ? { ...h, ...updates } : h))
      );
    },
    []
  );

  const handleHavingRemove = useCallback((conditionId: string) => {
    setHavingConditions((prev) => prev.filter((h) => h.id !== conditionId));
  }, []);

  const handleExecute = useCallback(() => {
    if (!generatedSQL.isValid || !connectedDatabase) return;

    // Replace parameters with placeholders for preview execution
    let execSql = generatedSQL.sql;
    for (const param of generatedSQL.parameters) {
      execSql = execSql.replace(`@${param.name}`, `'test_value'`);
    }

    executeQuery(
      { sql: execSql },
      {
        onSuccess: (data) => {
          setQueryResult({
            success: true,
            columns: data.columns,
            rows: data.rows,
            rowCount: data.rowCount,
            executionTimeMs: data.executionTimeMs,
          });
          toastService.success(`Query executed: ${data.rowCount} rows returned`);
        },
        onError: (error: any) => {
          setQueryResult({
            success: false,
            error: error.message || 'Query execution failed',
          });
          toastService.error(error.message || 'Query execution failed');
        },
      }
    );
  }, [generatedSQL, connectedDatabase, executeQuery]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedSQL.sql);
    toastService.success('SQL copied to clipboard');
  }, [generatedSQL.sql]);

  const handleSaveApi = useCallback(() => {
    setSaveDialogOpen(true);
  }, []);

  const handleSaveApiConfirm = useCallback(
    async (name: string, description: string, method: string, isPublic: boolean) => {
      if (!databaseId) return;

      try {
        await SchemaService.saveQuery(databaseId, name, generatedSQL.sql, {
          description,
          parameters: generatedSQL.parameters,
          method,
          isPublic,
        });

        queryClient.invalidateQueries({ queryKey: [SAVED_QUERIES_KEY, databaseId] });
        toastService.success('API endpoint saved successfully');
        setSaveDialogOpen(false);
        onApiSaved?.();
      } catch (error: any) {
        toastService.error(error.message || 'Failed to save API');
      }
    },
    [databaseId, generatedSQL, queryClient, onApiSaved]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!connectedDatabase) {
    return (
      <Container>
        <LoadingContainer>
          Select a database to start building queries
        </LoadingContainer>
      </Container>
    );
  }

  if (schemaLoading) {
    return (
      <Container>
        <LoadingContainer>
          <CircularProgress size={32} sx={{ mr: 2 }} />
          Loading schema...
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      {/* Left Sidebar - Tables Panel */}
      <LeftSidebar>
        <TablesPanel
          tables={tables}
          isLoading={schemaLoading}
          onTableDragStart={handleTableDragStart}
          onTableAdd={handleTableAdd}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          tablesOnCanvas={tablesOnCanvas}
        />
      </LeftSidebar>

      {/* Canvas - Main workspace */}
      <CanvasArea>
        <JoinCanvas
          canvasTables={canvasTables}
          joins={joins}
          onTableMove={handleTableMove}
          onTableRemove={handleTableRemove}
          onJoinAdd={handleJoinAdd}
          onJoinUpdate={handleJoinUpdate}
          onJoinRemove={handleJoinRemove}
          onTableDrop={handleTableDrop}
          selectedFields={selectedFields}
          onFieldToggle={handleFieldToggle}
        />
      </CanvasArea>

      {/* Right Sidebar - Config + Preview */}
      <RightSidebar>
        {/* Query Options */}
        <ConfigArea>
          <QueryConfigPanel
            canvasTables={canvasTables}
            selectedFields={selectedFields}
            filters={filters}
            groupByFields={groupByFields}
            havingConditions={havingConditions}
            limit={limit}
            offset={offset}
            onFieldToggle={handleFieldToggle}
            onFieldUpdate={handleFieldUpdate}
            onFieldRemove={handleFieldRemove}
            onFieldsReorder={handleFieldsReorder}
            onFilterAdd={handleFilterAdd}
            onFilterUpdate={handleFilterUpdate}
            onFilterRemove={handleFilterRemove}
            onGroupByAdd={handleGroupByAdd}
            onGroupByRemove={handleGroupByRemove}
            onHavingAdd={handleHavingAdd}
            onHavingUpdate={handleHavingUpdate}
            onHavingRemove={handleHavingRemove}
            onLimitChange={setLimit}
            onOffsetChange={setOffset}
          />
        </ConfigArea>

        {/* Generated Code Preview */}
        <PreviewArea>
          <SqlPreviewPanel
            generatedSQL={generatedSQL}
            isExecuting={isExecuting}
            queryResult={queryResult}
            onExecute={handleExecute}
            onCopy={handleCopy}
            onSaveApi={handleSaveApi}
            canSave={!!connectedDatabase && generatedSQL.isValid}
          />
        </PreviewArea>
      </RightSidebar>

      {/* Save API Dialog */}
      <SaveApiDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveApiConfirm}
        defaultName=""
        parameters={generatedSQL.parameters}
      />
    </Container>
  );
}
