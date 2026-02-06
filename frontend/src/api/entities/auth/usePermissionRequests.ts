import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PermissionRequestService } from '../../services/AccountSharingService';
import { ApiError } from '../../core/ApiError';
import type { PermissionRequestsResponseDto, SharePermissions } from '../../models/SharedAccountDto';
import { isSharedAccessSession } from '../../httpClient';

// Hook to get my permission requests (as shared user)
export function useMyPermissionRequests() {
  const isShared = isSharedAccessSession();
  return useQuery<PermissionRequestsResponseDto, ApiError>({
    queryKey: ['my-permission-requests'],
    queryFn: () => PermissionRequestService.getMyPermissionRequests(),
    staleTime: 30000,
    enabled: isShared, // Only fetch if user is in shared access session
  });
}

// Hook to get permission requests (as owner)
export function usePermissionRequests() {
  return useQuery<PermissionRequestsResponseDto, ApiError>({
    queryKey: ['permission-requests'],
    queryFn: () => PermissionRequestService.getPermissionRequests(),
    staleTime: 30000,
  });
}

interface UseCreatePermissionRequestOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useCreatePermissionRequest(options: UseCreatePermissionRequestOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ shareId, permission, message }: { shareId: number; permission: keyof SharePermissions; message?: string }) =>
      PermissionRequestService.createPermissionRequest(shareId, { permission, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-permission-requests'] });
      options.onSuccess?.();
    },
    onError: (error: ApiError) => {
      options.onError?.(error);
    },
  });

  return {
    createPermissionRequest: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

interface UseRespondPermissionRequestOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useRespondPermissionRequest(options: UseRespondPermissionRequestOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ requestId, action, message }: { requestId: number; action: 'approve' | 'reject'; message?: string }) =>
      PermissionRequestService.respondPermissionRequest(requestId, action, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-permission-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sharedAccounts'] }); // Refresh shared accounts list to show updated permissions
      queryClient.invalidateQueries({ queryKey: ['notifications'] }); // Remove handled notification
      options.onSuccess?.();
    },
    onError: (error: ApiError) => {
      options.onError?.(error);
    },
  });

  return {
    respondPermissionRequest: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

interface UseCancelPermissionRequestOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useCancelPermissionRequest(options: UseCancelPermissionRequestOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (requestId: number) =>
      PermissionRequestService.cancelPermissionRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-permission-requests'] });
      options.onSuccess?.();
    },
    onError: (error: ApiError) => {
      options.onError?.(error);
    },
  });

  return {
    cancelPermissionRequest: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
