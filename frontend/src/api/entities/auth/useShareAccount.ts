import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AccountSharingService } from '../../services/AccountSharingService';
import { ApiError } from '../../core/ApiError';
import type { ShareAccountDto } from '../../models/ShareAccountDto';
import type { ShareAccountResponseDto } from '../../models/ShareAccountResponseDto';

interface UseShareAccountOptions {
  onSuccess?: (data: ShareAccountResponseDto) => void;
  onError?: (error: ApiError) => void;
}

export function useShareAccount(options: UseShareAccountOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<ShareAccountResponseDto, ApiError, ShareAccountDto>({
    mutationFn: (data) => AccountSharingService.shareAccount(data),
    onSuccess: (data) => {
      // Invalidate shared accounts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['sharedAccounts'] });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    shareAccount: mutation.mutate,
    shareAccountAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}
