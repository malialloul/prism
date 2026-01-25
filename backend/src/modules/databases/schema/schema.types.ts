// src/modules/databases/schema/schema.types.ts

import type { ApiResponseDto } from '../../../utils/errors';

// Schema object types
export type SchemaObjectType = 'table' | 'view' | 'index' | 'procedure' | 'function';

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
  extra?: string; // AUTO_INCREMENT for MySQL, SERIAL info for PG
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

export interface ViewDetailsDto {
  name: string;
  schema: string;
  definition: string;
  columns: ColumnDto[];
}

export interface ProcedureDetailsDto {
  name: string;
  schema: string;
  definition: string;
  parameters: {
    name: string;
    type: string;
    mode: 'IN' | 'OUT' | 'INOUT';
  }[];
}

export interface FunctionDetailsDto {
  name: string;
  schema: string;
  definition: string;
  returnType: string;
  parameters: {
    name: string;
    type: string;
  }[];
}

// Query types
export interface QueryRequestDto {
  sql: string;
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

export interface SavedQueryDto {
  id: string;
  databaseId: string;
  name: string;
  sql: string;
  createdAt: Date;
  updatedAt: Date;
}

// Table management types
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
  afterColumn?: string; // MySQL only
}

export interface ModifyColumnDto {
  name: string;
  newName?: string;
  type?: string;
  nullable?: boolean;
  defaultValue?: string;
}

export interface DropColumnDto {
  name: string;
}

// Response types
export type GetSchemaObjectsResponseDto = ApiResponseDto<{ objects: SchemaObjectDto[] }>;
export type GetTableDetailsResponseDto = ApiResponseDto<{ table: TableDetailsDto }>;
export type GetViewDetailsResponseDto = ApiResponseDto<{ view: ViewDetailsDto }>;
export type GetProcedureDetailsResponseDto = ApiResponseDto<{ procedure: ProcedureDetailsDto }>;
export type GetFunctionDetailsResponseDto = ApiResponseDto<{ function: FunctionDetailsDto }>;
export type ExecuteQueryResponseDto = ApiResponseDto<QueryResultDto>;
export type GetSavedQueriesResponseDto = ApiResponseDto<{ queries: SavedQueryDto[] }>;
export type SaveQueryResponseDto = ApiResponseDto<{ query: SavedQueryDto }>;
export type CreateTableResponseDto = ApiResponseDto<{ message: string }>;
export type ModifyTableResponseDto = ApiResponseDto<{ message: string }>;
export type DropTableResponseDto = ApiResponseDto<{ message: string }>;

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
  'ARRAY',
  'INET',
  'CIDR',
  'MACADDR',
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
