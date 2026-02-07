export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'enum' | 'unknown';

export type FilterOperator = 
  | 'eq' | 'neq'  // equals, not equals (all types)
  | 'contains' | 'startsWith' | 'endsWith'  // string
  | 'gt' | 'gte' | 'lt' | 'lte' | 'between'  // number, date
  | 'isNull' | 'isNotNull';  // all types

export interface ColumnInfo {
  name: string;
  type: ColumnType;
  enumValues?: string[];
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  isAutoIncrement?: boolean;
}

export interface FilterCondition {
  column: string;
  operator: FilterOperator;
  value: string;
  value2?: string; // for 'between' operator
}

export const getOperatorsForType = (type: ColumnType): { value: FilterOperator; label: string }[] => {
  const common = [
    { value: 'eq' as FilterOperator, label: 'Equals' },
    { value: 'neq' as FilterOperator, label: 'Not equals' },
    { value: 'isNull' as FilterOperator, label: 'Is null' },
    { value: 'isNotNull' as FilterOperator, label: 'Is not null' },
  ];

  switch (type) {
    case 'string':
      return [
        ...common,
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' },
      ];
    case 'number':
      return [
        ...common,
        { value: 'gt', label: 'Greater than' },
        { value: 'gte', label: 'Greater or equal' },
        { value: 'lt', label: 'Less than' },
        { value: 'lte', label: 'Less or equal' },
        { value: 'between', label: 'Between' },
      ];
    case 'date':
    case 'datetime':
      return [
        ...common,
        { value: 'gt', label: 'After' },
        { value: 'gte', label: 'On or after' },
        { value: 'lt', label: 'Before' },
        { value: 'lte', label: 'On or before' },
        { value: 'between', label: 'Between' },
      ];
    case 'boolean':
      return [
        { value: 'eq', label: 'Equals' },
        { value: 'isNull', label: 'Is null' },
        { value: 'isNotNull', label: 'Is not null' },
      ];
    case 'enum':
      return common;
    default:
      return common;
  }
};

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  pathParams: ApiParameter[];
  queryParams: ApiParameter[];
  requestBody?: {
    required: boolean;
    description: string;
    example: Record<string, unknown>;
  };
  responses: ApiResponse[];
  supportsFilters?: boolean;
}

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'integer';
  required: boolean;
  description: string;
  example?: string;
  enum?: string[];
}

export interface ApiResponse {
  status: number;
  description: string;
  example?: unknown;
}

export interface TryItState {
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  body: string;
  response: {
    status: number;
    statusText: string;
    data: Record<string, unknown>;
    time: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

// Auto-generated CRUD endpoints definition (without relations endpoint)
export const getCrudEndpoints = (databaseId: number, tableName: string): ApiEndpoint[] => [
  {
    id: `list-${tableName}`,
    method: 'GET',
    path: `/databases/${databaseId}/api/${tableName}`,
    summary: `List records`,
    description: `Retrieve a paginated list of records from the ${tableName} table with optional filtering, sorting, and search.`,
    pathParams: [],
    queryParams: [
      { name: 'page', type: 'integer', required: false, description: 'Page number (1-based)', example: '1' },
      { name: 'limit', type: 'integer', required: false, description: 'Records per page (default: 20, max: 100)', example: '20' },
      { name: 'sortBy', type: 'string', required: false, description: 'Column to sort by', example: 'created_at' },
      { name: 'sortOrder', type: 'string', required: false, description: 'Sort direction', example: 'desc', enum: ['asc', 'desc'] },
      { name: 'search', type: 'string', required: false, description: 'Search term for text columns', example: '' },
    ],
    responses: [
      { status: 200, description: 'Success', example: { success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } },
      { status: 401, description: 'Unauthorized' },
      { status: 404, description: 'Table not found' },
    ],
    supportsFilters: true,
  },
  {
    id: `create-${tableName}`,
    method: 'POST',
    path: `/databases/${databaseId}/api/${tableName}`,
    summary: `Create`,
    description: `Create a new record in the ${tableName} table.`,
    pathParams: [],
    queryParams: [],
    requestBody: {
      required: true,
      description: 'Record data as JSON object',
      example: {},
    },
    responses: [
      { status: 201, description: 'Created', example: { success: true, record: {}, message: 'Record created successfully' } },
      { status: 400, description: 'Validation error' },
      { status: 401, description: 'Unauthorized' },
    ],
  },
  {
    id: `update-${tableName}`,
    method: 'PUT',
    path: `/databases/${databaseId}/api/${tableName}`,
    summary: `Update`,
    description: `Update existing records in the ${tableName} table matching the specified filters (full replacement).`,
    pathParams: [],
    queryParams: [],
    requestBody: {
      required: true,
      description: 'Updated record data as JSON object',
      example: {},
    },
    responses: [
      { status: 200, description: 'Success', example: { success: true, record: {}, message: 'Record updated successfully' } },
      { status: 400, description: 'Validation error' },
      { status: 401, description: 'Unauthorized' },
      { status: 404, description: 'Record not found' },
    ],
    supportsFilters: true,
  },
  {
    id: `patch-${tableName}`,
    method: 'PATCH',
    path: `/databases/${databaseId}/api/${tableName}`,
    summary: `Partial update`,
    description: `Partially update existing records in the ${tableName} table matching the specified filters.`,
    pathParams: [],
    queryParams: [],
    requestBody: {
      required: true,
      description: 'Partial record data as JSON object',
      example: {},
    },
    responses: [
      { status: 200, description: 'Success', example: { success: true, record: {}, message: 'Record updated successfully' } },
      { status: 400, description: 'Validation error' },
      { status: 401, description: 'Unauthorized' },
      { status: 404, description: 'Record not found' },
    ],
    supportsFilters: true,
  },
  {
    id: `delete-${tableName}`,
    method: 'DELETE',
    path: `/databases/${databaseId}/api/${tableName}`,
    summary: `Delete`,
    description: `Delete records from the ${tableName} table matching the specified filters.`,
    pathParams: [],
    queryParams: [],
    responses: [
      { status: 200, description: 'Success', example: { success: true, message: '1 record(s) deleted successfully', deletedCount: 1 } },
      { status: 400, description: 'At least one filter is required' },
      { status: 401, description: 'Unauthorized' },
    ],
    supportsFilters: true,
  },
];
