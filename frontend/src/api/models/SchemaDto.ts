// Schema object types - only tables now
export type SchemaObjectType = 'table';

export interface SchemaObjectDto {
  name: string;
  type: SchemaObjectType;
  schema: string;
}

export interface ColumnDto {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyRef?: {
    table: string;
    column: string;
  };
  extra?: string;
}

export interface IndexDto {
  name: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
  type: string;
}

export interface ConstraintDto {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  checkClause?: string;
}

export interface TableDetailsDto {
  name: string;
  schema: string;
  columns: ColumnDto[];
  indexes: IndexDto[];
  constraints: ConstraintDto[];
  rowCount: number;
  sampleData: Record<string, unknown>[];
}

export interface QueryResultDto {
  success: boolean;
  message?: string;
  columns?: string[];
  rows?: Record<string, unknown>[];
  rowCount?: number;
  affectedRows?: number;
  executionTimeMs?: number;
}

export interface SavedQueryParameterDto {
  name: string;
  columnName: string;
  columnType: string;
  operator: string;
  required?: boolean;
}

export interface SavedQueryDto {
  id: string;
  databaseId: string;
  name: string;
  description?: string;
  sql: string;
  parameters?: SavedQueryParameterDto[];
  method: string;
  isPublic: boolean;
  endpoint?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateColumnDto {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  autoIncrement?: boolean;
}

export interface CreateTableDto {
  name: string;
  columns: CreateColumnDto[];
}

export interface AddColumnDto {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  afterColumn?: string;
}

export interface ModifyColumnDto {
  name: string;
  newName?: string;
  type?: string;
  nullable?: boolean;
  defaultValue?: string;
}

// Data type constants
export const POSTGRES_DATA_TYPES = [
  'INTEGER',
  'BIGINT',
  'SMALLINT',
  'SERIAL',
  'BIGSERIAL',
  'VARCHAR(255)',
  'TEXT',
  'CHAR(1)',
  'BOOLEAN',
  'TIMESTAMP',
  'TIMESTAMPTZ',
  'DATE',
  'TIME',
  'TIMETZ',
  'INTERVAL',
  'NUMERIC',
  'DECIMAL',
  'REAL',
  'DOUBLE PRECISION',
  'UUID',
  'JSONB',
  'JSON',
  'BYTEA',
  'INET',
  'CIDR',
  'MACADDR',
  // Array types
  'INTEGER[]',
  'BIGINT[]',
  'SMALLINT[]',
  'TEXT[]',
  'VARCHAR[]',
  'BOOLEAN[]',
  'NUMERIC[]',
  'DECIMAL[]',
  'REAL[]',
  'DOUBLE PRECISION[]',
  'UUID[]',
  'JSONB[]',
  'JSON[]',
  'TIMESTAMP[]',
  'TIMESTAMPTZ[]',
  'DATE[]',
] as const;

export const MYSQL_DATA_TYPES = [
  'INT',
  'BIGINT',
  'SMALLINT',
  'TINYINT',
  'MEDIUMINT',
  'VARCHAR(255)',
  'TEXT',
  'CHAR(1)',
  'TINYINT(1)',
  'BOOLEAN',
  'DATETIME',
  'TIMESTAMP',
  'DATE',
  'TIME',
  'YEAR',
  'DECIMAL(10,2)',
  'DOUBLE',
  'FLOAT',
  'JSON',
  'BLOB',
  'MEDIUMBLOB',
  'LONGBLOB',
  'BINARY',
  'VARBINARY(255)',
  'ENUM',
  'SET',
] as const;

export type PostgresDataType = typeof POSTGRES_DATA_TYPES[number];
export type MysqlDataType = typeof MYSQL_DATA_TYPES[number];

// Alias for backward compatibility
export type ColumnDetailsDto = ColumnDto;
