// src/modules/databases/crud/crud.types.ts

import type { ApiResponseDto } from '../../../utils/errors';

// Filter operators
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'contains' | 'startsWith' | 'endsWith' | 'isNull' | 'isNotNull';

// Single filter condition
export interface FilterCondition {
  column: string;
  operator: FilterOperator;
  value?: string | number | boolean | null;
  value2?: string | number | boolean | null; // For 'between' operator
}

// Query parameters for list endpoints
export interface ListQueryParams {
  // Pagination
  page?: number;
  limit?: number;
  offset?: number;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Searching
  search?: string;
  searchFields?: string[]; // Fields to search in
  
  // Filtering - advanced filters with operators
  filters?: FilterCondition[];
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CrudRecord {
  [key: string]: unknown;
}

// Response types
export type ListRecordsResponseDto = ApiResponseDto<PaginatedResult<CrudRecord>>;
export type GetRecordResponseDto = ApiResponseDto<{ record: CrudRecord }>;
export type CreateRecordResponseDto = ApiResponseDto<{ record: CrudRecord; message: string }>;
export type UpdateRecordResponseDto = ApiResponseDto<{ record: CrudRecord; message: string }>;
export type DeleteRecordResponseDto = ApiResponseDto<{ message: string }>;

// Relation types
export interface TableRelation {
  table: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
  type: 'one-to-many' | 'many-to-one';
}

export type GetRelationsResponseDto = ApiResponseDto<{ relations: TableRelation[] }>;
export type GetRelatedRecordsResponseDto = ApiResponseDto<PaginatedResult<CrudRecord>>;
