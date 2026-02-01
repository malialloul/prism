/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NotificationDto } from './NotificationDto';

export interface NotificationsResponseDto {
  status: string;
  message: string;
  data: {
    notifications: NotificationDto[];
    unreadCount: number;
  };
}
