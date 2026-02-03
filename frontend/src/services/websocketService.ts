import { io, Socket } from 'socket.io-client';
import { getAuthToken, clearAuthToken, updateSharedPermissions } from '../api/httpClient';
import type { SharePermissions } from '../api/models/SharedAccountDto';
import { toastService } from './toastService';

export interface NotificationPayload {
  id: number;
  userId: number;
  type: 'account_shared' | 'share_accepted' | 'share_revoked' | 'permissions_updated' | 'permission_request' | 'request_approved' | 'request_rejected' | 'general';
  title: string;
  message: string;
  metadata: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface ShareNotificationPayload {
  type: 'request_approved' | 'request_rejected';
  title: string;
  message: string;
  metadata: string | null;
}

export interface ForceLogoutPayload {
  reason: string;
  message: string;
  shareId?: number; // The shareId that was revoked
}

export interface PermissionsUpdatedPayload {
  shareId: number;
  permissions: Record<string, boolean>;
  message: string;
}

type NotificationCallback = (notification: NotificationPayload) => void;
type NotificationReadCallback = (data: { notificationId: number }) => void;
type AllNotificationsReadCallback = () => void;
type ForceLogoutCallback = (payload: ForceLogoutPayload) => void;
type PermissionsUpdatedCallback = (payload: PermissionsUpdatedPayload) => void;
type ShareNotificationCallback = (payload: ShareNotificationPayload) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private notificationCallbacks: Set<NotificationCallback> = new Set();
  private notificationReadCallbacks: Set<NotificationReadCallback> = new Set();
  private allNotificationsReadCallbacks: Set<AllNotificationsReadCallback> = new Set();
  private forceLogoutCallbacks: Set<ForceLogoutCallback> = new Set();
  private permissionsUpdatedCallbacks: Set<PermissionsUpdatedCallback> = new Set();
  private shareNotificationCallbacks: Set<ShareNotificationCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): void {
    const token = getAuthToken();
    if (!token) {
      console.warn('[WebSocket] No auth token available, skipping connection');
      return;
    }

    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    this.socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached');
      }
    });

    // Handle incoming notifications
    this.socket.on('notification', (notification: NotificationPayload) => {
      console.log('[WebSocket] Received notification:', notification);
      this.notificationCallbacks.forEach((callback) => callback(notification));
    });

    // Handle notification read
    this.socket.on('notification:read', (data: { notificationId: number }) => {
      this.notificationReadCallbacks.forEach((callback) => callback(data));
    });

    // Handle all notifications read
    this.socket.on('notifications:allRead', () => {
      this.allNotificationsReadCallbacks.forEach((callback) => callback());
    });

    // Handle force logout (e.g., when shared account access is revoked)
    this.socket.on('force_logout', (payload: ForceLogoutPayload) => {
      console.log('[WebSocket] Received force logout:', payload);
      this.forceLogoutCallbacks.forEach((callback) => callback(payload));
      
      // Store message in sessionStorage to persist through redirect
      sessionStorage.setItem('forceLogoutMessage', payload.message);
      
      // Show the message briefly before redirect
      toastService.error(payload.message, { duration: 3000 });
      
      // Clear auth and redirect to signin
      clearAuthToken();
      this.disconnect();
      
      // Redirect to signin after short delay to allow user to see toast
      setTimeout(() => {
        window.location.href = '/signin';
      }, 3000);
    });

    // Handle permissions updated (when account owner updates shared user's permissions)
    this.socket.on('permissions_updated', (payload: PermissionsUpdatedPayload) => {
      console.log('[WebSocket] Received permissions updated:', payload);
      this.permissionsUpdatedCallbacks.forEach((callback) => callback(payload));
      
      // Update permissions in localStorage for immediate UI effect
      updateSharedPermissions(payload.permissions as unknown as SharePermissions);
      
      // Note: The notification bell will be updated automatically because we also emit 'notification' event
    });

    // Handle share-specific notifications (for shared users without persistent accounts)
    this.socket.on('share_notification', (payload: ShareNotificationPayload) => {
      console.log('[WebSocket] Received share notification:', payload);
      this.shareNotificationCallbacks.forEach((callback) => callback(payload));
      
      // Show toast notification
      if (payload.type === 'request_approved') {
        toastService.success(payload.message, { duration: 5000 });
      } else if (payload.type === 'request_rejected') {
        toastService.error(payload.message, { duration: 5000 });
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[WebSocket] Disconnected manually');
    }
  }

  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  onNotificationRead(callback: NotificationReadCallback): () => void {
    this.notificationReadCallbacks.add(callback);
    return () => {
      this.notificationReadCallbacks.delete(callback);
    };
  }

  onAllNotificationsRead(callback: AllNotificationsReadCallback): () => void {
    this.allNotificationsReadCallbacks.add(callback);
    return () => {
      this.allNotificationsReadCallbacks.delete(callback);
    };
  }

  onForceLogout(callback: ForceLogoutCallback): () => void {
    this.forceLogoutCallbacks.add(callback);
    return () => {
      this.forceLogoutCallbacks.delete(callback);
    };
  }

  onPermissionsUpdated(callback: PermissionsUpdatedCallback): () => void {
    this.permissionsUpdatedCallbacks.add(callback);
    return () => {
      this.permissionsUpdatedCallbacks.delete(callback);
    };
  }

  onShareNotification(callback: ShareNotificationCallback): () => void {
    this.shareNotificationCallbacks.add(callback);
    return () => {
      this.shareNotificationCallbacks.delete(callback);
    };
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
