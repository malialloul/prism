// ============================================================================
// WIZARD TYPES
// ============================================================================

export type DatabaseEngine = 'postgres' | 'mysql';

// Step definitions
export const WIZARD_STEPS = [
  { id: 'base-table', label: 'Base Table', description: 'Select your primary table' },
  { id: 'joins', label: 'Joins', description: 'Connect related tables' },
  { id: 'fields', label: 'Fields', description: 'Choose columns to display' },
  { id: 'filters', label: 'Filters', description: 'Filter your results' },
  { id: 'aggregation', label: 'Calculations', description: 'Add calculations and grouping' },
  { id: 'sorting', label: 'Sort & Limit', description: 'Order and limit results' },
  { id: 'review', label: 'Review', description: 'Review and save your query' },
] as const;

export type WizardStepId = typeof WIZARD_STEPS[number]['id'];

// ============================================================================
// SCHEMA TYPES
// ============================================================================

export interface SchemaColumn {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
  nullable?: boolean;
  defaultValue?: string | null;
}

export interface SchemaTable {
  name: string;
  schema?: string;
  columns: SchemaColumn[];
  rowCount?: number;
  description?: string;
}

// ============================================================================
// WIZARD STATE TYPES
// ============================================================================

export interface SelectedTable {
  name: string;
  alias?: string;
}

export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';

export interface TableJoin {
  id: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toTableAlias?: string;
  toColumn: string;
  joinType: JoinType;
}

export interface SelectedField {
  id: string;
  table: string;
  column: string;
  alias: string | null;
}

export type AggregationType = 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT_DISTINCT';

export type FilterOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL' | 'BETWEEN' | 'CONTAINS ALL';

export type FilterValueType = 'fixed' | 'parameter';

export interface FilterCondition {
  id: string;
  table: string;
  column: string;
  columnType: string;      // Column data type for proper SQL generation
  operator: FilterOperator;
  valueType: FilterValueType;
  value: string;           // Single value or parameter name
  values: string[];        // Multiple values for IN/NOT IN
  value2: string;          // Second value for BETWEEN
  parameterName?: string;  // Custom parameter name
  isRequired?: boolean;    // Whether the parameter is required (only for valueType='parameter')
}

export interface GroupByField {
  id: string;
  table: string;
  column: string;
}

export interface AggregateField {
  id: string;
  function: AggregationType;
  table: string;
  column: string;
  alias: string | null;
}

export interface HavingCondition {
  id: string;
  aggregateId: string;
  operator: FilterOperator;
  value: string;
  valueType: FilterValueType;
  parameterName?: string;
  isRequired?: boolean;
}

export type SortDirection = 'ASC' | 'DESC';

export interface SortField {
  id: string;
  table?: string;
  column?: string;
  aggregateId?: string;
  computedFieldId?: string;
  direction: SortDirection;
}

// Computed field for expressions like quantity * unit_price
export type ComputedOperator = '+' | '-' | '*' | '/' | '%';

export interface ComputedField {
  id: string;
  leftTable: string;
  leftColumn: string;
  operator: ComputedOperator;
  rightTable: string;
  rightColumn: string;
  alias: string;
}

// Query parameter definition for runtime input
export interface QueryParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  filterId: string;
  description?: string;
  defaultValue?: string;
  isRequired?: boolean;
}

// ============================================================================
// WIZARD STATE
// ============================================================================

// Uniqueness settings for DISTINCT queries
export interface DistinctOnColumn {
  table: string;
  column: string;
  direction?: SortDirection; // Sort direction for this column in ORDER BY (optional - none means no preference)
}

export interface UniquenessSettings {
  enabled: boolean;
  mode: 'simple' | 'distinctOn'; // 'simple' = SELECT DISTINCT, 'distinctOn' = DISTINCT ON (PostgreSQL only)
  distinctOnColumns: DistinctOnColumn[]; // Columns for DISTINCT ON
}

// Pagination settings for API endpoints
export interface PaginationSettings {
  enabled: boolean; // If true, pagination uses parameters instead of fixed values
  pageSizeRequired: boolean; // pagesize parameter required
  pageCountRequired: boolean; // pagecount parameter required (offset = pagecount * pagesize)
  defaultPageSize: number; // Default page size when not provided
}

export interface WizardState {
  baseTable: SelectedTable | null;
  joins: TableJoin[];
  selectedFields: SelectedField[];
  computedFields: ComputedField[];
  uniqueness: UniquenessSettings;
  filters: FilterCondition[];
  filterLogic: 'AND' | 'OR';
  groupByFields: GroupByField[];
  aggregates: AggregateField[];
  havingConditions: HavingCondition[];
  sortFields: SortField[];
  limit: number | null;
  offset: number | null;
  pagination: PaginationSettings;
}

// ============================================================================
// GENERATED SQL
// ============================================================================

export interface ValidationMessage {
  step: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  fix?: string;
  autoFix?: {
    type: 'addToGroupBy' | 'wrapInAggregate' | 'addToOrderBy' | 'removeDistinctOn';
    columns?: Array<{ table: string; column: string }>;
    aggregateFunction?: 'MAX' | 'MIN' | 'COUNT';
  };
}

export interface GeneratedSQL {
  query: string;
  params: (string | number | null)[];
}

// ============================================================================
// HELPER CONSTANTS
// ============================================================================

export const JOIN_TYPE_OPTIONS: { value: JoinType; label: string; description: string }[] = [
  { value: 'INNER', label: 'Matching Only', description: 'Only rows that match in both tables' },
  { value: 'LEFT', label: 'Include All from Left', description: 'All rows from first table, matching from second' },
  { value: 'RIGHT', label: 'Include All from Right', description: 'All rows from second table, matching from first' },
  { value: 'FULL', label: 'Include All', description: 'All rows from both tables' },
];

// Define operators by category for cleaner type-specific filtering
export const FILTER_OPERATORS: { value: FilterOperator; label: string; symbol: string; categories: string[]; tooltip?: string }[] = [
  { value: '=', label: 'Equals', symbol: '=', categories: ['number', 'string', 'date', 'boolean', 'uuid'] },
  { value: '!=', label: 'Not Equals', symbol: '≠', categories: ['number', 'string', 'date', 'boolean', 'uuid'] },
  { value: '>', label: 'Greater Than', symbol: '>', categories: ['number', 'date'] },
  { value: '<', label: 'Less Than', symbol: '<', categories: ['number', 'date'] },
  { value: '>=', label: 'At Least', symbol: '≥', categories: ['number', 'date'] },
  { value: '<=', label: 'At Most', symbol: '≤', categories: ['number', 'date'] },
  { value: 'LIKE', label: 'Contains', symbol: '∋', categories: ['string'] },
  { value: 'NOT LIKE', label: 'Does Not Contain', symbol: '∌', categories: ['string'] },
  { value: 'IN', label: 'Any of these values', symbol: '∈', categories: ['number', 'string', 'uuid'], tooltip: 'Matches rows where the column equals any of the selected values' },
  { value: 'NOT IN', label: 'None of these values', symbol: '∉', categories: ['number', 'string', 'uuid'], tooltip: 'Matches rows where the column is not equal to any of the selected values' },
  { value: 'CONTAINS ALL', label: 'All of these values', symbol: '⊇', categories: ['array', 'json'], tooltip: 'Matches rows where the column contains all selected values (array/JSON only)' },
  { value: 'BETWEEN', label: 'Between', symbol: '↔', categories: ['number', 'date'] },
  { value: 'IS NULL', label: 'Is Empty', symbol: '∅', categories: ['number', 'string', 'date', 'boolean', 'uuid', 'array', 'json'] },
  { value: 'IS NOT NULL', label: 'Is Not Empty', symbol: '≠∅', categories: ['number', 'string', 'date', 'boolean', 'uuid', 'array', 'json'] },
];

export const COMPUTED_OPERATORS: { value: ComputedOperator; label: string; description: string }[] = [
  { value: '+', label: 'Add', description: 'Sum of two values' },
  { value: '-', label: 'Subtract', description: 'Difference between values' },
  { value: '*', label: 'Multiply', description: 'Product of two values' },
  { value: '/', label: 'Divide', description: 'Division of values' },
  { value: '%', label: 'Modulo', description: 'Remainder after division' },
];

export const AGGREGATION_OPTIONS: { value: AggregationType; label: string; description: string }[] = [
  { value: 'COUNT', label: 'Count', description: 'Count rows' },
  { value: 'SUM', label: 'Total', description: 'Sum values' },
  { value: 'AVG', label: 'Average', description: 'Average value' },
  { value: 'MIN', label: 'Minimum', description: 'Lowest value' },
  { value: 'MAX', label: 'Maximum', description: 'Highest value' },
  { value: 'COUNT_DISTINCT', label: 'Count Unique', description: 'Count distinct values' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getColumnCategory = (type: string): 'number' | 'string' | 'date' | 'boolean' | 'uuid' | 'array' | 'json' | 'other' => {
  const lowerType = type.toLowerCase();

  if (lowerType === 'uuid' || lowerType.includes('uniqueidentifier')) {
    return 'uuid';
  }
  if (lowerType.includes('[]') || lowerType === 'array' || lowerType.startsWith('_')) {
    return 'array';
  }
  if (lowerType === 'json' || lowerType === 'jsonb') {
    return 'json';
  }
  if (['int', 'integer', 'bigint', 'smallint', 'tinyint', 'decimal', 'numeric', 'float', 'double', 'real', 'money'].some(t => lowerType.includes(t))) {
    return 'number';
  }
  if (['varchar', 'char', 'text', 'nvarchar', 'nchar', 'ntext', 'string'].some(t => lowerType.includes(t))) {
    return 'string';
  }
  if (['date', 'time', 'datetime', 'timestamp', 'year'].some(t => lowerType.includes(t))) {
    return 'date';
  }
  if (['bool', 'boolean', 'bit'].some(t => lowerType.includes(t))) {
    return 'boolean';
  }
  return 'other';
};

export const getOperatorsForType = (columnType: string): { value: FilterOperator; label: string; symbol: string }[] => {
  const category = getColumnCategory(columnType);
  
  // Use the categories defined in FILTER_OPERATORS
  // For 'other' category, treat as string
  const effectiveCategory = category === 'other' ? 'string' : category;
  
  return FILTER_OPERATORS.filter(op => op.categories.includes(effectiveCategory));
};

export const getAggregationsForType = (columnType: string): Exclude<AggregationType, null>[] => {
  const category = getColumnCategory(columnType);
  
  if (category === 'number') {
    return ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];
  }
  if (category === 'date') {
    return ['COUNT', 'MIN', 'MAX'];
  }
  return ['COUNT'];
};

// Quote identifier based on database engine
export const quoteId = (name: string, engine: DatabaseEngine): string => {
  if (engine === 'mysql') {
    return `\`${name}\``;
  }
  return `"${name}"`;
};

// Get available tables for joining (those with FK relationships)
export const getJoinableTables = (
  fromTable: SchemaTable,
  allTables: SchemaTable[]
): { table: SchemaTable; localColumn: string; foreignColumn: string }[] => {
  const joinable: { table: SchemaTable; localColumn: string; foreignColumn: string }[] = [];

  // Find FK relationships FROM this table (e.g., orders.user_id -> users.id)
  for (const col of fromTable.columns) {
    if (col.foreignKey) {
      const targetTable = allTables.find(t => t.name === col.foreignKey!.table);
      if (targetTable) {
        joinable.push({
          table: targetTable,
          localColumn: col.name,
          foreignColumn: col.foreignKey.column,
        });
      }
    }
  }

  // Find FK relationships TO this table (e.g., if we have users, find orders.user_id -> users.id)
  for (const table of allTables) {
    if (table.name === fromTable.name) continue;
    for (const col of table.columns) {
      if (col.foreignKey && col.foreignKey.table === fromTable.name) {
        // This table references our fromTable
        joinable.push({
          table,
          localColumn: col.foreignKey.column, // The PK column in fromTable
          foreignColumn: col.name, // The FK column in the other table
        });
      }
    }
  }

  return joinable;
};

// Get all joined tables including base table
export const getJoinedTables = (baseTable: SelectedTable | null, joins: TableJoin[], allTables: SchemaTable[]): string[] => {
  if (!baseTable) return [];
  
  const tableNames = new Set<string>([baseTable.name]);
  for (const join of joins) {
    tableNames.add(join.fromTable);
    tableNames.add(join.toTable);
  }
  
  return Array.from(tableNames);
};

// Check if operator requires no value input
export const operatorNeedsNoValue = (operator: FilterOperator): boolean => {
  return ['IS NULL', 'IS NOT NULL'].includes(operator);
};

// Check if operator needs multiple values (IN, NOT IN, CONTAINS ALL)
export const operatorNeedsMultipleValues = (operator: FilterOperator): boolean => {
  return ['IN', 'NOT IN', 'CONTAINS ALL'].includes(operator);
};

// Check if operator needs two values (BETWEEN)
export const operatorNeedsTwoValues = (operator: FilterOperator): boolean => {
  return operator === 'BETWEEN';
};

// Generate a default parameter name from table and column
export const generateParameterName = (table: string, column: string, suffix?: string): string => {
  const baseName = `${column}`.replace(/[^a-zA-Z0-9_]/g, '_');
  return suffix ? `${baseName}_${suffix}` : baseName;
};

// Create a default filter condition
export const createDefaultFilter = (table: string, column: string, type: string): FilterCondition => {
  const operators = getOperatorsForType(type);
  return {
    id: generateId(),
    table,
    column,
    columnType: type,
    operator: operators[0]?.value || '=',
    valueType: 'fixed',
    value: '',
    values: [],
    value2: '',
    parameterName: generateParameterName(table, column),
  };
};

// Get parameters from wizard state
export const extractParameters = (state: WizardState): QueryParameter[] => {
  const params: QueryParameter[] = [];
  
  // Extract from filters
  state.filters.forEach((filter) => {
    if (filter.valueType === 'parameter') {
      const paramName = filter.parameterName || generateParameterName(filter.table, filter.column);
      const isRequired = filter.isRequired ?? true; // Default to required
      
      if (operatorNeedsTwoValues(filter.operator)) {
        // BETWEEN needs two parameters
        params.push({
          name: `${paramName}_from`,
          type: 'string',
          filterId: filter.id,
          description: `Start value for ${filter.column}`,
          isRequired,
        });
        params.push({
          name: `${paramName}_to`,
          type: 'string',
          filterId: filter.id,
          description: `End value for ${filter.column}`,
          isRequired,
        });
      } else if (operatorNeedsMultipleValues(filter.operator)) {
        // IN/NOT IN - single parameter with comma-separated values
        params.push({
          name: paramName,
          type: 'string',
          filterId: filter.id,
          description: `Comma-separated values for ${filter.column}`,
          isRequired,
        });
      } else if (!operatorNeedsNoValue(filter.operator)) {
        params.push({
          name: paramName,
          type: 'string',
          filterId: filter.id,
          description: `Value for ${filter.column}`,
          isRequired,
        });
      }
    }
  });
  
  // Extract from HAVING conditions
  state.havingConditions.forEach((having) => {
    if (having.valueType === 'parameter') {
      const agg = state.aggregates.find((a) => a.id === having.aggregateId);
      const aggLabel = agg 
        ? (agg.alias || `${agg.function.toLowerCase()}_${agg.column}`)
        : 'calculation';
      const paramName = having.parameterName || aggLabel;
      const isRequired = having.isRequired ?? true;
      
      params.push({
        name: paramName,
        type: 'string',
        filterId: having.id,
        description: `Value for ${agg ? `${agg.function}(${agg.column})` : 'aggregate'}`,
        isRequired,
      });
    }
  });
  
  // Extract pagination parameters
  if (state.pagination?.enabled) {
    params.push({
      name: 'pagesize',
      type: 'number',
      description: `Number of rows per page (default: ${state.pagination.defaultPageSize})`,
      isRequired: state.pagination.pageSizeRequired,
    });
    params.push({
      name: 'pagecount',
      type: 'number',
      description: 'Page number (1-indexed, default: 1)',
      isRequired: state.pagination.pageCountRequired,
    });
  }
  
  return params;
};
