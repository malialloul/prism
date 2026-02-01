import { getIO } from './index';

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

/**
 * Emit a notification to a specific user via WebSocket
 */
export function emitNotification(userId: string, notification: NotificationPayload): void {
  const io = getIO();
  if (!io) {
    console.warn('[WebSocket] Cannot emit notification - WebSocket server not initialized');
    return;
  }

  io.to(`user:${userId}`).emit('notification', notification);
  console.log(`[WebSocket] Notification emitted to user ${userId}:`, notification.title);
}

/**
 * Emit a notification read event to a specific user
 */
export function emitNotificationRead(userId: string, notificationId: number): void {
  const io = getIO();
  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit('notification:read', { notificationId });
}

/**
 * Emit an all notifications read event to a specific user
 */
export function emitAllNotificationsRead(userId: string): void {
  const io = getIO();
  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit('notifications:allRead');
}
