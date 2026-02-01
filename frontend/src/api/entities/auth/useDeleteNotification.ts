import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../../services/AccountSharingService';
import { ApiError } from '../../core/ApiError';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';

interface UseDeleteNotificationOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useDeleteNotification(options: UseDeleteNotificationOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<PasswordActionResponseDto, ApiError, number>({
    mutationFn: (notificationId) => NotificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    deleteNotification: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
