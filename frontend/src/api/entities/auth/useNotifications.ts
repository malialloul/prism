import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../../services/AccountSharingService';
import { ApiError } from '../../core/ApiError';
import type { NotificationsResponseDto } from '../../models/NotificationsResponseDto';
import type { NotificationDto } from '../../models/NotificationDto';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';
import type { NotificationPayload } from '../../../services';
import { websocketService } from '../../../services';
import { isDemoModeActive } from '../../../context/TourContext';

// Empty notifications data for demo mode
const DEMO_NOTIFICATIONS: NotificationsResponseDto = {
  status: 'success',
  message: 'Demo mode - no notifications',
  data: {
    notifications: [],
    unreadCount: 0,
  },
};

export function useNotifications() {
  const queryClient = useQueryClient();
  const isDemo = isDemoModeActive();

  // Subscribe to real-time notifications (skip in demo mode)
  useEffect(() => {
    // Skip WebSocket connection in demo mode
    if (isDemo) return;

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

      // If share was accepted, refresh shared accounts list to update status
      if (notification.type === 'share_accepted') {
        queryClient.invalidateQueries({ queryKey: ['sharedAccounts'] });
      }
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

    // Handle share notifications (for shared users - permission request rejected)
    const unsubShareNotification = websocketService.onShareNotification(() => {
      // Invalidate and refetch permission requests and notifications to update the UI
      queryClient.invalidateQueries({ queryKey: ['my-permission-requests'] });
      queryClient.refetchQueries({ queryKey: ['my-permission-requests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    // Handle permissions updated (for shared users - permission request approved)
    const unsubPermissionsUpdated = websocketService.onPermissionsUpdated(() => {
      // Invalidate and refetch permission requests and notifications to update the UI
      queryClient.invalidateQueries({ queryKey: ['my-permission-requests'] });
      queryClient.refetchQueries({ queryKey: ['my-permission-requests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    // Handle share status changed (for owner - when shared user accepts/logs in)
    const unsubShareStatusChanged = websocketService.onShareStatusChanged(() => {
      // Refresh shared accounts list to update status from pending to accepted
      queryClient.invalidateQueries({ queryKey: ['sharedAccounts'] });
    });

    return () => {
      unsubNotification();
      unsubRead();
      unsubAllRead();
      unsubShareNotification();
      unsubPermissionsUpdated();
      unsubShareStatusChanged();
    };
  }, [queryClient, isDemo]);

  return useQuery<NotificationsResponseDto, ApiError>({
    queryKey: ['notifications'],
    queryFn: () => {
      if (isDemo) {
        return Promise.resolve(DEMO_NOTIFICATIONS);
      }
      return NotificationService.getNotifications();
    },
    staleTime: isDemo ? Infinity : 30000,
    refetchInterval: isDemo ? false : 60000,
    placeholderData: isDemo ? DEMO_NOTIFICATIONS : undefined,
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
