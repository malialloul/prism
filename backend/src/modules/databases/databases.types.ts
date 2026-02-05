// src/modules/databases/databases.types.ts

import type { ApiResponseDto } from '../../utils/errors';

export interface CreateDatabaseDto {
  name: string;
  engine: 'postgres' | 'mysql';
  username: string;
  password: string;
}

export interface ConnectDatabaseDto {
  name: string;
  engine: 'postgres' | 'mysql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export interface UpdateDatabaseDto {
  name?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}

export interface DatabaseDto {
  id: string;
  name: string;
  engine: 'postgres' | 'mysql';
  host: string;
  port: number;
  username: string;
  database: string;
  ssl: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastConnectedAt: Date;
  tables: number;
  apis: number;
  storageBytes: number;
  isHosted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestConnectionDto {
  engine: 'postgres' | 'mysql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export interface TestConnectionResultDto {
  success: boolean;
  message: string;
  tables?: number;
  storageBytes?: number;
}

// Database row type
export interface DbDatabaseConnectionDto {
  id: string;
  user_id: string;
  name: string;
  engine: 'postgres' | 'mysql';
  host: string;
  port: number;
  username: string;
  password_encrypted: string;
  database: string;
  ssl: boolean;
  status: 'connected' | 'disconnected' | 'error';
  last_connected_at: Date;
  tables: number;
  apis: number;
  storage_bytes: number;
  is_hosted: boolean;
  created_at: Date;
  updated_at: Date;
}

export type ConnectDatabaseResponseDto = ApiResponseDto<DatabaseDto>;
export type CreateDatabaseResponseDto = ApiResponseDto<DatabaseDto>;
export type GetDatabasesResponseDto = ApiResponseDto<DatabaseDto[]>;
export type GetDatabaseResponseDto = ApiResponseDto<DatabaseDto>;
export type UpdateDatabaseResponseDto = ApiResponseDto<DatabaseDto>;
export type DeleteDatabaseResponseDto = ApiResponseDto<{ message: string }>;
export type TestConnectionResponseDto = ApiResponseDto<TestConnectionResultDto>;
