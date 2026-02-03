import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../../services/AccountSharingService';
import { ApiError } from '../../core/ApiError';
import type { NotificationsResponseDto } from '../../models/NotificationsResponseDto';
import type { NotificationDto } from '../../models/NotificationDto';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';
import type { NotificationPayload } from '../../../services';
import { websocketService } from '../../../services';

export function useNotifications() {
  const queryClient = useQueryClient();

  // Subscribe to real-time notifications
  useEffect(() => {
    // Connect WebSocket when this hook is used
    websocketService.connect();

    // Handle new notifications
    const unsubNotification = websocketService.onNotification((notification: NotificationPayload) => {
      // Optimistically update the query cache with the new notification
      queryClient.setQueryData<NotificationsResponseDto>(['notifications'], (old) => {
        if (!old) return old;
        const newNotification: NotificationDto = {
          id: notification.id,
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata ? (typeof notification.metadata === 'string' ? JSON.parse(notification.metadata) : notification.metadata) : null,
          readAt: notification.readAt ? new Date(notification.readAt).toISOString() : null,
          createdAt: new Date(notification.createdAt).toISOString(),
        };
        return {
          ...old,
          data: {
            notifications: [newNotification, ...old.data.notifications],
            unreadCount: old.data.unreadCount + 1,
          },
        };
      });
      // Also invalidate to fetch the real data from server
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    // Handle notification read events
    const unsubRead = websocketService.onNotificationRead(({ notificationId }) => {
      queryClient.setQueryData<NotificationsResponseDto>(['notifications'], (old) => {
        if (!old) return old;
        let unreadCountDecrement = 0;
        const updatedNotifications = old.data.notifications.map((n) => {
          if (n.id === notificationId && !n.readAt) {
            unreadCountDecrement = 1;
            return { ...n, readAt: new Date().toISOString() };
          }
          return n;
        });
        return {
          ...old,
          data: {
            notifications: updatedNotifications,
            unreadCount: Math.max(0, old.data.unreadCount - unreadCountDecrement),
          },
        };
      });
    });

    // Handle all notifications read events
    const unsubAllRead = websocketService.onAllNotificationsRead(() => {
      queryClient.setQueryData<NotificationsResponseDto>(['notifications'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            notifications: old.data.notifications.map((n) => ({
              ...n,
              readAt: n.readAt || new Date().toISOString(),
            })),
            unreadCount: 0,
          },
        };
      });
    });

    // Handle share notifications (for shared users - permission request approved/rejected)
    const unsubShareNotification = websocketService.onShareNotification(() => {
      // Invalidate permission requests to update the UI
      queryClient.invalidateQueries({ queryKey: ['my-permission-requests'] });
    });

    // Handle permissions updated (for shared users)
    const unsubPermissionsUpdated = websocketService.onPermissionsUpdated(() => {
      // Invalidate permission requests to update the UI
      queryClient.invalidateQueries({ queryKey: ['my-permission-requests'] });
    });

    return () => {
      unsubNotification();
      unsubRead();
      unsubAllRead();
      unsubShareNotification();
      unsubPermissionsUpdated();
    };
  }, [queryClient]);

  return useQuery<NotificationsResponseDto, ApiError>({
    queryKey: ['notifications'],
    queryFn: () => NotificationService.getNotifications(),
    staleTime: 30000, // 30 seconds - rely more on WebSocket
    refetchInterval: 60000, // Fallback: Refetch every 60 seconds
  });
}

interface UseMarkNotificationReadOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useMarkNotificationRead(options: UseMarkNotificationReadOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<PasswordActionResponseDto, ApiError, number>({
    mutationFn: (notificationId) => NotificationService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    markAsRead: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useMarkAllNotificationsRead(options: UseMarkNotificationReadOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<PasswordActionResponseDto, ApiError, void>({
    mutationFn: () => NotificationService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    markAllAsRead: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
