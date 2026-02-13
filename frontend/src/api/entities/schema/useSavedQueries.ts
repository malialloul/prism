import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import { ApiError } from '../../core/ApiError';
import type { SavedQueryDto } from '../../models/SchemaDto';
import { DATABASES_QUERY_KEY } from '../databases';
import { isDemoModeActive } from '../../../context/TourContext';
import { getDemoSavedQueries } from '../../../context/demoData';

export const SAVED_QUERIES_KEY = ['saved-queries'];

export function useSavedQueries(databaseId: number | undefined) {
  const isDemo = isDemoModeActive();
  const demoData = { queries: getDemoSavedQueries(databaseId) };
  
  return useQuery({
    queryKey: [...SAVED_QUERIES_KEY, isDemo ? 'demo' : databaseId],
    queryFn: () => {
      if (isDemo) {
        return Promise.resolve(demoData);
      }
      return SchemaService.getSavedQueries(databaseId!);
    },
    enabled: isDemo || !!databaseId,
    staleTime: isDemo ? Infinity : undefined,
    placeholderData: isDemo ? demoData : undefined,
  });
}

interface UseSaveQueryOptions {
  onSuccess?: (response: { query: SavedQueryDto; message: string; warning?: string }) => void;
  onError?: (error: ApiError) => void;
}

interface SaveQueryInput {
  name: string;
  sql: string;
  description?: string;
  parameters?: Array<{
    name: string;
    columnName: string;
    columnType: string;
    operator: string;
    required?: boolean;
  }>;
  method?: string;
  isPublic?: boolean;
}

export function useSaveQuery(databaseId: number, options: UseSaveQueryOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ query: SavedQueryDto; message: string; warning?: string }, ApiError, SaveQueryInput>({
    mutationFn: ({ name, sql, description, parameters, method, isPublic }) => 
      SchemaService.saveQuery(databaseId, name, sql, { description, parameters, method, isPublic }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [...SAVED_QUERIES_KEY, databaseId] });
      // Also invalidate databases to update the apis count
      queryClient.invalidateQueries({ queryKey: DATABASES_QUERY_KEY });
      // Invalidate version limits to update usage counts
      queryClient.invalidateQueries({ queryKey: ['versionLimits'] });
      options.onSuccess?.(response);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}

interface UseDeleteSavedQueryOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useDeleteSavedQuery(databaseId: number, options: UseDeleteSavedQueryOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: (queryId) => SchemaService.deleteSavedQuery(databaseId, queryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SAVED_QUERIES_KEY, databaseId] });
      // Also invalidate databases to update the apis count
      queryClient.invalidateQueries({ queryKey: DATABASES_QUERY_KEY });
      // Invalidate version limits to update usage counts
      queryClient.invalidateQueries({ queryKey: ['versionLimits'] });
      options.onSuccess?.();
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
