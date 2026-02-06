import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccountSharingService } from '../../services/AccountSharingService';
import { ApiError } from '../../core/ApiError';
import type { SharedAccountsResponseDto } from '../../models/SharedAccountsResponseDto';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';
import type { SharePermissions, SharedAccountDto } from '../../models/SharedAccountDto';
import { websocketService } from '../../../services';

export function useSharedAccounts() {
  const queryClient = useQueryClient();

  // Listen for share status changes via WebSocket
  useEffect(() => {
    // Make sure WebSocket is connected
    websocketService.connect();

    // When share status changes (e.g., shared user accepts), refresh the list
    const unsubShareStatusChanged = websocketService.onShareStatusChanged(() => {
      console.log('[useSharedAccounts] Share status changed, refreshing...');
      queryClient.invalidateQueries({ queryKey: ['sharedAccounts'] });
    });

    // Also listen for share_accepted notifications
    const unsubNotification = websocketService.onNotification((notification) => {
      if (notification.type === 'share_accepted') {
        console.log('[useSharedAccounts] Share accepted notification, refreshing...');
        queryClient.invalidateQueries({ queryKey: ['sharedAccounts'] });
      }
    });

    return () => {
      unsubShareStatusChanged();
      unsubNotification();
    };
  }, [queryClient]);

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
    revokeShare: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

interface UseUpdateSharePermissionsOptions {
  onSuccess?: (share: SharedAccountDto) => void;
  onError?: (error: ApiError) => void;
}

export function useUpdateSharePermissions(options: UseUpdateSharePermissionsOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<{ data: { share: SharedAccountDto }; message: string }, ApiError, { shareId: number; permissions: SharePermissions }>({
    mutationFn: ({ shareId, permissions }) => AccountSharingService.updateSharePermissions(shareId, permissions),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['sharedAccounts'] });
      onSuccess?.(response.data.share);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    updatePermissions: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

interface UseDeleteShareOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useDeleteShare(options: UseDeleteShareOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<PasswordActionResponseDto, ApiError, number>({
    mutationFn: (shareId) => AccountSharingService.deleteShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedAccounts'] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    deleteShare: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
