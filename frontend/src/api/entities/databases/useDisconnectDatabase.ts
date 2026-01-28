import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabasesService } from '../../services/DatabasesService';
import { ApiError } from '../../core/ApiError';
import type { DatabaseDto } from '../../models/DatabaseDto';
import { DATABASES_QUERY_KEY } from './useDatabases';

interface UseDisconnectDatabaseOptions {
  onSuccess?: (database: DatabaseDto, message: string) => void;
  onError?: (error: ApiError) => void;
}

export function useDisconnectDatabase(options: UseDisconnectDatabaseOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ database: DatabaseDto; message: string }, ApiError, number>({
    mutationFn: (id) => DatabasesService.postDatabaseDisconnect(id),
    onSuccess: (response) => {
      // Invalidate databases list to trigger refresh
      queryClient.invalidateQueries({ queryKey: DATABASES_QUERY_KEY });
      options.onSuccess?.(response.database, response.message);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
