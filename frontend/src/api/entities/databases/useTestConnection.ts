import { useMutation } from '@tanstack/react-query';
import { DatabasesService } from '../../services/DatabasesService';
import { ApiError } from '../../core/ApiError';
import type { TestConnectionDto } from '../../models/TestConnectionDto';
import type { TestConnectionResultDto } from '../../models/TestConnectionResultDto';

interface UseTestConnectionOptions {
  onSuccess?: (result: TestConnectionResultDto) => void;
  onError?: (error: ApiError) => void;
}

export function useTestConnection(options: UseTestConnectionOptions = {}) {
  return useMutation<TestConnectionResultDto, ApiError, TestConnectionDto>({
    mutationFn: (data) => DatabasesService.postDatabasesTest(data),
    onSuccess: (result) => {
      options.onSuccess?.(result);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
