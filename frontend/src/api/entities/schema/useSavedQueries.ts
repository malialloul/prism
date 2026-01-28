import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import { ApiError } from '../../core/ApiError';
import type { SavedQueryDto } from '../../models/SchemaDto';

export const SAVED_QUERIES_KEY = ['saved-queries'];

export function useSavedQueries(databaseId: number | undefined) {
  return useQuery({
    queryKey: [...SAVED_QUERIES_KEY, databaseId],
    queryFn: () => SchemaService.getSavedQueries(databaseId!),
    enabled: !!databaseId,
    staleTime: 60000, // 1 minute
  });
}

interface UseSaveQueryOptions {
  onSuccess?: (query: SavedQueryDto) => void;
  onError?: (error: ApiError) => void;
}

export function useSaveQuery(databaseId: number, options: UseSaveQueryOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ query: SavedQueryDto; message: string }, ApiError, { name: string; sql: string }>({
    mutationFn: ({ name, sql }) => SchemaService.saveQuery(databaseId, name, sql),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [...SAVED_QUERIES_KEY, databaseId] });
      options.onSuccess?.(response.query);
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
      options.onSuccess?.();
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
