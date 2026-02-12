import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import { ApiError } from '../../core/ApiError';
import type { QueryResultDto } from '../../models/SchemaDto';
import { SCHEMA_OBJECTS_QUERY_KEY } from './useSchemaObjects';
import { isDemoModeActive } from '../../../context/TourContext';
import { DEMO_QUERY_RESULT } from '../../../context/demoData';

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
    mutationFn: ({ sql, page, pageSize }) => {
      // Return demo data in demo mode
      if (isDemoModeActive()) {
        return Promise.resolve({
          ...DEMO_QUERY_RESULT,
          message: `Demo mode: Showing sample results for "${sql.substring(0, 50)}..."`,
        });
      }
      return SchemaService.executeQuery(databaseId, sql, { page, pageSize });
    },
    onSuccess: (result, { sql }) => {
      // If the query was a DDL statement, invalidate schema cache (only in non-demo mode)
      if (DDL_KEYWORDS.test(sql) && !isDemoModeActive()) {
        queryClient.invalidateQueries({ queryKey: [...SCHEMA_OBJECTS_QUERY_KEY, databaseId] });
      }
      options.onSuccess?.(result);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
