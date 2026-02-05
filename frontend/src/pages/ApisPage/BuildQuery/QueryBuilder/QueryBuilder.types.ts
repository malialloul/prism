// Table configuration
export interface Table {
  name: string;
  alias: string;
  joinedWith?: TableConnection[];
}

// Join/Connection between tables
export interface TableConnection {
  id: string;
  sourceTableId: string;
  targetTableId: string;
  sourceColumn: string;
  targetColumn: string;
  sourceColumnType?: string;
  targetColumnType?: string;
  connectionType: 'matches' | 'startsWith' | 'contains';
}

// Selected field in result
export interface SelectedField {
  tableId: string;
  columnName: string;
  aggregation?: string | null;
}

// Filter/Where condition
export interface FilterCondition {
  id: string;
  tableName: string;
  fieldName: string;
  operator: 'equals' | 'not-equals' | 'greater' | 'less' | 'greater-equals' | 'less-equals' | 'contains' | 'starts-with' | 'ends-with' | 'in' | 'not-in' | 'is-empty' | 'is-not-empty';
  value: string | string[] | null;
  logic?: 'AND' | 'OR';
}

// Grouping rule
export interface GroupingRule {
  tableName: string;
  fieldName: string;
  interval?: 'day' | 'month' | 'year'; // For date fields
}

// Complete query configuration
export interface QueryConfig {
  tables: Table[];
  tableConnections?: TableConnection[];
  selectedFields: SelectedField[];
  filters: FilterCondition[];
  grouping: GroupingRule[];
  having: FilterCondition[];
  apiName?: string;
  description?: string;
}
