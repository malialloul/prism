import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabasesService } from '../../services/DatabasesService';
import { ApiError } from '../../core/ApiError';
import type { DatabaseDto } from '../../models/DatabaseDto';
import { DATABASES_QUERY_KEY } from './useDatabases';

interface UseRefreshDatabaseOptions {
  onSuccess?: (database: DatabaseDto) => void;
  onError?: (error: ApiError) => void;
}

export function useRefreshDatabase(options: UseRefreshDatabaseOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ database: DatabaseDto }, ApiError, number>({
    mutationFn: (id) => DatabasesService.postDatabaseRefresh(id),
    onSuccess: (response) => {
      // Invalidate databases list to trigger refresh
      queryClient.invalidateQueries({ queryKey: DATABASES_QUERY_KEY });
      options.onSuccess?.(response.database);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
