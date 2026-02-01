import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../api/httpClient';

export interface NotificationPayload {
  id: number;
  userId: number;
  type: 'account_shared' | 'share_accepted' | 'share_revoked' | 'general';
  title: string;
  message: string;
  metadata: string | null;
  readAt: Date | null;
  createdAt: Date;
}

type NotificationCallback = (notification: NotificationPayload) => void;
type NotificationReadCallback = (data: { notificationId: number }) => void;
type AllNotificationsReadCallback = () => void;

class WebSocketService {
  private socket: Socket | null = null;
  private notificationCallbacks: Set<NotificationCallback> = new Set();
  private notificationReadCallbacks: Set<NotificationReadCallback> = new Set();
  private allNotificationsReadCallbacks: Set<AllNotificationsReadCallback> = new Set();
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

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
