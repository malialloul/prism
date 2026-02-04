// src/modules/databases/shared/generator.types.ts

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  sql: string;
  description?: string;
  parameters?: ApiParameter[];
}

export interface ApiParameter {
  name: string;
  columnName: string;
  columnType: string;
  operator: string;
  required?: boolean;
}

export interface DatabaseInfo {
  engine: 'postgres' | 'mysql';
  host: string;
  port: number;
  database: string;
  username: string;
}
