import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccountSharingService } from '../../services/AccountSharingService';
import { ApiError } from '../../core/ApiError';
import type { SharedAccountsResponseDto } from '../../models/SharedAccountsResponseDto';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';

export function useSharedAccounts() {
  return useQuery<SharedAccountsResponseDto, ApiError>({
    queryKey: ['sharedAccounts'],
    queryFn: () => AccountSharingService.getSharedAccounts(),
    staleTime: 30000, // 30 seconds
  });
}

interface UseRevokeShareOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useRevokeShare(options: UseRevokeShareOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<PasswordActionResponseDto, ApiError, number>({
    mutationFn: (shareId) => AccountSharingService.revokeShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedAccounts'] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    revokeShare: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
