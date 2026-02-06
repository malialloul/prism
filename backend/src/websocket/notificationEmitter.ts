import { getIO } from './index';

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

export interface ForceLogoutPayload {
  reason: string;
  message: string;
  shareId?: number; // Include shareId to target specific shared sessions
}

export interface OwnerAccountActionPayload {
  reason: 'account_deactivated' | 'account_deleted';
  message: string;
  ownerUserId: string;
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
 * Emit a force logout event to a specific share via WebSocket
 * Used when shared account access is revoked
 */
export function emitForceLogout(userId: string, payload: ForceLogoutPayload): void {
  const io = getIO();
  if (!io) {
    console.warn('[WebSocket] Cannot emit force logout - WebSocket server not initialized');
    return;
  }

  // If a shareId is provided, emit to share-specific room (only affects shared sessions)
  // Otherwise, emit to user room (affects all sessions for that user)
  if (payload.shareId) {
    io.to(`share:${payload.shareId}`).emit('force_logout', payload);
    console.log(`[WebSocket] Force logout emitted to share ${payload.shareId}:`, payload.reason);
  } else {
    io.to(`user:${userId}`).emit('force_logout', payload);
    console.log(`[WebSocket] Force logout emitted to user ${userId}:`, payload.reason);
  }
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

export interface PermissionsUpdatedPayload {
  shareId: number;
  permissions: Record<string, boolean>;
  message: string;
}

export interface ShareNotificationPayload {
  type: 'request_approved' | 'request_rejected';
  title: string;
  message: string;
  metadata: string | null;
}

export interface ShareStatusChangedPayload {
  shareId: number;
  status: 'pending' | 'accepted' | 'revoked';
  sharedWithEmail: string;
}

/**
 * Emit a permissions updated event to a specific share via WebSocket
 * Used when shared account permissions are updated (e.g., permission request approved)
 * Only emits to the share-specific room to avoid duplicates
 */
export function emitPermissionsUpdated(userId: string, payload: PermissionsUpdatedPayload): void {
  const io = getIO();
  if (!io) {
    console.warn('[WebSocket] Cannot emit permissions updated - WebSocket server not initialized');
    return;
  }

  const roomName = `share:${payload.shareId}`;
  const room = io.sockets.adapter.rooms.get(roomName);
  const socketCount = room ? room.size : 0;
  
  console.log(`[WebSocket] Emitting permissions_updated to room ${roomName} (${socketCount} sockets in room)`);
  console.log(`[WebSocket] Payload:`, JSON.stringify(payload));

  // Only emit to share-specific room (shared users are in this room)
  // Don't emit to user room to avoid duplicates since shared users join both rooms
  io.to(roomName).emit('permissions_updated', payload);
  console.log(`[WebSocket] Permissions updated emitted to share ${payload.shareId}`);
}

/**
 * Emit a notification to a specific share via WebSocket
 * Used for shared users who don't have persistent user accounts
 */
export function emitNotificationToShare(shareId: number, payload: ShareNotificationPayload): void {
  const io = getIO();
  if (!io) {
    console.warn('[WebSocket] Cannot emit notification to share - WebSocket server not initialized');
    return;
  }

  io.to(`share:${shareId}`).emit('share_notification', payload);
  console.log(`[WebSocket] Notification emitted to share ${shareId}:`, payload.title);
}

/**
 * Emit force logout to all shared users of an owner
 * Used when owner deactivates or deletes their account
 */
export function emitOwnerAccountAction(shareIds: number[], payload: OwnerAccountActionPayload): void {
  const io = getIO();
  if (!io) {
    console.warn('[WebSocket] Cannot emit owner account action - WebSocket server not initialized');
    return;
  }

  // Emit to each share room
  for (const shareId of shareIds) {
    io.to(`share:${shareId}`).emit('owner_account_action', payload);
    console.log(`[WebSocket] Owner account action emitted to share ${shareId}:`, payload.reason);
  }
}

/**
 * Emit share status changed event to owner
 * Used when a shared user accepts or the share status changes
 */
export function emitShareStatusChanged(ownerUserId: string, payload: ShareStatusChangedPayload): void {
  const io = getIO();
  if (!io) {
    console.warn('[WebSocket] Cannot emit share status changed - WebSocket server not initialized');
    return;
  }

  io.to(`user:${ownerUserId}`).emit('share_status_changed', payload);
  console.log(`[WebSocket] Share status changed emitted to user ${ownerUserId}:`, payload.status);
}
