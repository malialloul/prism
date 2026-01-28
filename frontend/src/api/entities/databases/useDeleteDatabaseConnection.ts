import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabasesService } from '../../services/DatabasesService';
import { ApiError } from '../../core/ApiError';
import { DATABASES_QUERY_KEY } from './useDatabases';

interface UseDeleteDatabaseOptions {
  onSuccess?: (response: { message: string }) => void;
  onError?: (error: ApiError) => void;
}

export function useDeleteDatabase(options: UseDeleteDatabaseOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, number>({
    mutationFn: (id) => DatabasesService.deleteDatabase(id),
    onSuccess: (response) => {
      // Invalidate databases list to trigger refresh
      queryClient.invalidateQueries({ queryKey: DATABASES_QUERY_KEY });
      options.onSuccess?.(response);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
