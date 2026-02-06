import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import { ApiError } from '../../core/ApiError';
import type { QueryResultDto } from '../../models/SchemaDto';
import { SCHEMA_OBJECTS_QUERY_KEY } from './useSchemaObjects';

// DDL keywords that modify schema
const DDL_KEYWORDS = /^\s*(CREATE|DROP|ALTER|TRUNCATE|RENAME)\s+/i;

interface ExecuteQueryParams {
  sql: string;
  page?: number;
  pageSize?: number;
}

interface UseExecuteQueryOptions {
  onSuccess?: (result: QueryResultDto) => void;
  onError?: (error: ApiError) => void;
}

export function useExecuteQuery(databaseId: number, options: UseExecuteQueryOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<QueryResultDto, ApiError, ExecuteQueryParams>({
    mutationFn: ({ sql, page, pageSize }) => 
      SchemaService.executeQuery(databaseId, sql, { page, pageSize }),
    onSuccess: (result, { sql }) => {
      // If the query was a DDL statement, invalidate schema cache
      if (DDL_KEYWORDS.test(sql)) {
        queryClient.invalidateQueries({ queryKey: [...SCHEMA_OBJECTS_QUERY_KEY, databaseId] });
      }
      options.onSuccess?.(result);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
