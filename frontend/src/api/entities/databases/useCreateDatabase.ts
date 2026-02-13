import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabasesService } from '../../services/DatabasesService';
import { ApiError } from '../../core/ApiError';
import type { CreateDatabaseDto } from '../../models/CreateDatabaseDto';
import type { DatabaseDto } from '../../models/DatabaseDto';
import { DATABASES_QUERY_KEY } from './useDatabases';

interface UseCreateDatabaseOptions {
  onSuccess?: (database: DatabaseDto, message: string, warning?: string) => void;
  onError?: (error: ApiError) => void;
}

export function useCreateDatabase(options: UseCreateDatabaseOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ database: DatabaseDto; message: string; warning?: string }, ApiError, CreateDatabaseDto>({
    mutationFn: (data) => DatabasesService.createDatabase(data),
    onSuccess: (response) => {
      // Invalidate databases list to trigger refresh
      queryClient.invalidateQueries({ queryKey: DATABASES_QUERY_KEY });
      // Invalidate version limits to update usage counts
      queryClient.invalidateQueries({ queryKey: ['versionLimits'] });
      options.onSuccess?.(response.database, response.message, response.warning);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
