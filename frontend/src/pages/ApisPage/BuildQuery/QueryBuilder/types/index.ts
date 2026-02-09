// ============================================================================
// VISUAL SQL QUERY BUILDER TYPES
// ============================================================================
// A joins-first, no-subqueries visual query builder for Prism
// Target users: Students, Junior developers, Frontend developers

// ============================================================================
// SCHEMA TYPES (from database)
// ============================================================================

export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyRef?: {
    table: string;
    column: string;
  };
}

export interface SchemaTable {
  name: string;
  schema: string;
  columns: SchemaColumn[];
}

// ============================================================================
// CANVAS TYPES
// ============================================================================

export interface TablePosition {
  x: number;
  y: number;
}

export interface CanvasTable {
  id: string;
  name: string;
  schema: string;
  columns: SchemaColumn[];
  position: TablePosition;
}

// ============================================================================
// JOIN TYPES
// ============================================================================

export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';

export interface TableJoin {
  id: string;
  type: JoinType;
  sourceTableId: string;
  targetTableId: string;
  sourceColumn: string;
  targetColumn: string;
}

// ============================================================================
// SELECT FIELD TYPES
// ============================================================================

export type AggregationType = 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | null;
export type SortDirection = 'ASC' | 'DESC' | null;

export interface SelectedField {
  id: string;
  tableId: string;
  tableName: string;
  columnName: string;
  columnType: string;
  alias?: string;
  aggregation: AggregationType;
  sortOrder: SortDirection;
  sortPriority?: number;
}

// ============================================================================
// FILTER TYPES (WHERE clause)
// ============================================================================

export type FilterOperator = 
  | 'EQUALS' 
  | 'NOT_EQUALS' 
  | 'GREATER_THAN' 
  | 'LESS_THAN' 
  | 'GREATER_OR_EQUAL' 
  | 'LESS_OR_EQUAL'
  | 'LIKE' 
  | 'NOT_LIKE'
  | 'IN' 
  | 'NOT_IN'
  | 'BETWEEN'
  | 'IS_NULL' 
  | 'IS_NOT_NULL';

export type FilterLogic = 'AND' | 'OR';

export interface FilterCondition {
  id: string;
  tableId: string;
  tableName: string;
  columnName: string;
  columnType: string;
  operator: FilterOperator;
  value: string | number | string[] | [number, number] | null;
  logic: FilterLogic;
  isParameter?: boolean;
  parameterName?: string;
}

export interface FilterGroup {
  id: string;
  logic: FilterLogic;
  conditions: FilterCondition[];
}

// ============================================================================
// GROUP BY & HAVING TYPES
// ============================================================================

export interface GroupByField {
  id: string;
  tableId: string;
  tableName: string;
  columnName: string;
}

export interface HavingCondition {
  id: string;
  aggregation: Exclude<AggregationType, null>;
  tableId: string;
  tableName: string;
  columnName: string;
  operator: FilterOperator;
  value: string | number;
}

// ============================================================================
// QUERY STATE (complete state for the query builder)
// ============================================================================

export interface QueryBuilderState {
  // Tables on canvas
  canvasTables: CanvasTable[];
  
  // Joins between tables
  joins: TableJoin[];
  
  // Selected fields for SELECT clause
  selectedFields: SelectedField[];
  
  // WHERE conditions
  filters: FilterCondition[];
  filterGroups: FilterGroup[];
  
  // GROUP BY fields
  groupByFields: GroupByField[];
  
  // HAVING conditions (for aggregated results)
  havingConditions: HavingCondition[];
  
  // LIMIT
  limit: number | null;
  
  // Offset for pagination
  offset: number | null;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationMessage {
  id: string;
  severity: ValidationSeverity;
  message: string;
  field?: string;
}

// ============================================================================
// SQL GENERATION TYPES
// ============================================================================

export interface GeneratedSQL {
  sql: string;
  isValid: boolean;
  validationMessages: ValidationMessage[];
  parameters: SQLParameter[];
}

export interface SQLParameter {
  name: string;
  columnName: string;
  columnType: string;
  operator: string;
  required: boolean;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface TablesPanelProps {
  tables: SchemaTable[];
  isLoading: boolean;
  onTableDragStart: (table: SchemaTable) => void;
  onTableAdd: (table: SchemaTable) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface JoinCanvasProps {
  canvasTables: CanvasTable[];
  joins: TableJoin[];
  onTableMove: (tableId: string, position: TablePosition) => void;
  onTableRemove: (tableId: string) => void;
  onJoinAdd: (join: Omit<TableJoin, 'id'>) => void;
  onJoinUpdate: (joinId: string, updates: Partial<TableJoin>) => void;
  onJoinRemove: (joinId: string) => void;
  onTableDrop: (table: SchemaTable, position: TablePosition) => void;
  selectedFields: SelectedField[];
  onFieldToggle: (tableId: string, column: SchemaColumn) => void;
}

export interface SelectFieldsProps {
  canvasTables: CanvasTable[];
  selectedFields: SelectedField[];
  onFieldToggle: (tableId: string, column: SchemaColumn) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<SelectedField>) => void;
  onFieldRemove: (fieldId: string) => void;
  onFieldsReorder: (fields: SelectedField[]) => void;
}

export interface FiltersSectionProps {
  canvasTables: CanvasTable[];
  filters: FilterCondition[];
  onFilterAdd: (filter: Omit<FilterCondition, 'id'>) => void;
  onFilterUpdate: (filterId: string, updates: Partial<FilterCondition>) => void;
  onFilterRemove: (filterId: string) => void;
}

export interface AggregationsSectionProps {
  selectedFields: SelectedField[];
  onFieldUpdate: (fieldId: string, updates: Partial<SelectedField>) => void;
}

export interface GroupBySectionProps {
  canvasTables: CanvasTable[];
  selectedFields: SelectedField[];
  groupByFields: GroupByField[];
  onGroupByAdd: (field: Omit<GroupByField, 'id'>) => void;
  onGroupByRemove: (fieldId: string) => void;
  suggestedGroupBy: GroupByField[];
}

export interface HavingSectionProps {
  selectedFields: SelectedField[];
  havingConditions: HavingCondition[];
  onHavingAdd: (condition: Omit<HavingCondition, 'id'>) => void;
  onHavingUpdate: (conditionId: string, updates: Partial<HavingCondition>) => void;
  onHavingRemove: (conditionId: string) => void;
  disabled: boolean;
}

export interface SortingLimitSectionProps {
  selectedFields: SelectedField[];
  onFieldUpdate: (fieldId: string, updates: Partial<SelectedField>) => void;
  limit: number | null;
  offset: number | null;
  onLimitChange: (limit: number | null) => void;
  onOffsetChange: (offset: number | null) => void;
}

export interface SqlPreviewPanelProps {
  generatedSQL: GeneratedSQL;
  isExecuting: boolean;
  queryResult: QueryResult | null;
  onExecute: () => void;
  onCopy: () => void;
  onSaveApi: () => void;
  canSave: boolean;
}

// ============================================================================
// QUERY RESULT TYPE
// ============================================================================

export interface QueryResult {
  success: boolean;
  columns?: string[];
  rows?: Record<string, unknown>[];
  rowCount?: number;
  executionTimeMs?: number;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const FILTER_OPERATORS: { value: FilterOperator; label: string; types: string[] }[] = [
  { value: 'EQUALS', label: '= Equals', types: ['all'] },
  { value: 'NOT_EQUALS', label: '≠ Not Equals', types: ['all'] },
  { value: 'GREATER_THAN', label: '> Greater Than', types: ['number', 'date'] },
  { value: 'LESS_THAN', label: '< Less Than', types: ['number', 'date'] },
  { value: 'GREATER_OR_EQUAL', label: '≥ Greater or Equal', types: ['number', 'date'] },
  { value: 'LESS_OR_EQUAL', label: '≤ Less or Equal', types: ['number', 'date'] },
  { value: 'LIKE', label: '∋ Contains', types: ['string'] },
  { value: 'NOT_LIKE', label: '∌ Not Contains', types: ['string'] },
  { value: 'IN', label: '∈ In List', types: ['all'] },
  { value: 'NOT_IN', label: '∉ Not In List', types: ['all'] },
  { value: 'BETWEEN', label: '↔ Between', types: ['number', 'date'] },
  { value: 'IS_NULL', label: '∅ Is Null', types: ['all'] },
  { value: 'IS_NOT_NULL', label: '≠∅ Is Not Null', types: ['all'] },
];

export const AGGREGATION_TYPES: { value: Exclude<AggregationType, null>; label: string; types: string[] }[] = [
  { value: 'COUNT', label: 'Count', types: ['all'] },
  { value: 'SUM', label: 'Total', types: ['number'] },
  { value: 'AVG', label: 'Average', types: ['number'] },
  { value: 'MIN', label: 'Minimum', types: ['number', 'date', 'string'] },
  { value: 'MAX', label: 'Maximum', types: ['number', 'date', 'string'] },
];

export const JOIN_TYPES: { value: JoinType; label: string; description: string }[] = [
  { value: 'INNER', label: 'Matching Only', description: 'Only matching rows from both tables' },
  { value: 'LEFT', label: 'Include All Left', description: 'All rows from first table + matching from second' },
  { value: 'RIGHT', label: 'Include All Right', description: 'All rows from second table + matching from first' },
  { value: 'FULL', label: 'Include All', description: 'All rows from both tables' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getColumnCategory = (type: string): 'number' | 'string' | 'date' | 'boolean' | 'uuid' | 'other' => {
  const lowerType = type.toLowerCase();
  
  if (lowerType === 'uuid' || lowerType.includes('uniqueidentifier')) {
    return 'uuid';
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

export const getOperatorsForType = (columnType: string): FilterOperator[] => {
  const category = getColumnCategory(columnType);
  return FILTER_OPERATORS
    .filter(op => op.types.includes('all') || op.types.includes(category))
    .map(op => op.value);
};

export const getAggregationsForType = (columnType: string): Exclude<AggregationType, null>[] => {
  const category = getColumnCategory(columnType);
  return AGGREGATION_TYPES
    .filter(agg => agg.types.includes('all') || agg.types.includes(category))
    .map(agg => agg.value);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
