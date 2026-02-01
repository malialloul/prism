/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export interface NotificationDto {
  id: number;
  userId: number;
  type: 'account_shared' | 'share_accepted' | 'share_revoked' | 'general';
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}
