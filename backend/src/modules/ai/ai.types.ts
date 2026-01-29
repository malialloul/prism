// src/modules/ai/ai.types.ts

import type { ApiResponseDto } from '../../utils/errors';

export interface GenerateSqlRequestDto {
  databaseId: string;
  prompt: string;
}

export interface GeneratedSqlDto {
  sql: string;
  params: (string | number | boolean | null)[];
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  description: string;
  isValid: boolean;
  validationError?: string;
}

export interface SaveGeneratedApiDto {
  databaseId: string;
  name: string;
  description: string;
  sql: string;
  params: string[]; // Parameter names like ['minOrderTotal']
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface GeneratedApiDto {
  id: string;
  databaseId: string;
  name: string;
  slug: string;
  description: string;
  sql: string;
  params: string[];
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecuteGeneratedApiDto {
  params: Record<string, string | number | boolean | null>;
}

export interface ChatMessageDto {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DbGeneratedApiDto {
  id: string;
  user_id: string;
  database_id: string;
  name: string;
  slug: string;
  description: string;
  sql: string;
  params: string[];
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  created_at: Date;
  updated_at: Date;
}

// Response types
export type GenerateSqlResponseDto = ApiResponseDto<GeneratedSqlDto>;
export type SaveGeneratedApiResponseDto = ApiResponseDto<GeneratedApiDto>;
export type GetGeneratedApisResponseDto = ApiResponseDto<{ apis: GeneratedApiDto[] }>;
export type GetGeneratedApiResponseDto = ApiResponseDto<GeneratedApiDto>;
export type DeleteGeneratedApiResponseDto = ApiResponseDto<{ message: string }>;
export type ExecuteGeneratedApiResponseDto = ApiResponseDto<{ 
  result: unknown[];
  rowCount: number;
  sql: string;
}>;
