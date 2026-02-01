/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ShareAccountDto } from '../models/ShareAccountDto';
import type { SharedAccountsResponseDto } from '../models/SharedAccountsResponseDto';
import type { ShareAccountResponseDto } from '../models/ShareAccountResponseDto';
import type { NotificationsResponseDto } from '../models/NotificationsResponseDto';
import type { SharedLoginDto } from '../models/SharedLoginDto';
import type { TokenResponseDto } from '../models/TokenResponseDto';
import type { PasswordActionResponseDto } from '../models/PasswordActionResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AccountSharingService {
  /**
   * Share account with another user
   * @param requestBody
   * @returns ShareAccountResponseDto Account shared successfully
   * @throws ApiError
   */
  public static shareAccount(
    requestBody: ShareAccountDto,
  ): CancelablePromise<ShareAccountResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/account/share',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Validation error`,
        401: `Unauthorized`,
        409: `Already shared with this user`,
      },
    });
  }

  /**
   * Get all shared accounts
   * @returns SharedAccountsResponseDto Shared accounts list
   * @throws ApiError
   */
  public static getSharedAccounts(): CancelablePromise<SharedAccountsResponseDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/auth/account/shares',
      errors: {
        401: `Unauthorized`,
      },
    });
  }

  /**
   * Revoke a shared account
   * @param shareId
   * @returns PasswordActionResponseDto Share revoked successfully
   * @throws ApiError
   */
  public static revokeShare(
    shareId: number,
  ): CancelablePromise<PasswordActionResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/account/share/revoke',
      body: { shareId },
      mediaType: 'application/json',
      errors: {
        401: `Unauthorized`,
        404: `Share not found`,
      },
    });
  }

  /**
   * Login to a shared account
   * @param requestBody
   * @returns TokenResponseDto Login successful
   * @throws ApiError
   */
  public static sharedLogin(
    requestBody: SharedLoginDto,
  ): CancelablePromise<TokenResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/login/shared',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        401: `Invalid credentials`,
      },
    });
  }
}

export class NotificationService {
  /**
   * Get all notifications
   * @returns NotificationsResponseDto Notifications list
   * @throws ApiError
   */
  public static getNotifications(): CancelablePromise<NotificationsResponseDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/auth/notifications',
      errors: {
        401: `Unauthorized`,
      },
    });
  }

  /**
   * Mark a notification as read
   * @param notificationId
   * @returns PasswordActionResponseDto Notification marked as read
   * @throws ApiError
   */
  public static markNotificationRead(
    notificationId: number,
  ): CancelablePromise<PasswordActionResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/notifications/{id}/read',
      path: {
        id: notificationId,
      },
      errors: {
        401: `Unauthorized`,
        404: `Notification not found`,
      },
    });
  }

  /**
   * Mark all notifications as read
   * @returns PasswordActionResponseDto All notifications marked as read
   * @throws ApiError
   */
  public static markAllNotificationsRead(): CancelablePromise<PasswordActionResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/notifications/read-all',
      errors: {
        401: `Unauthorized`,
      },
    });
  }

  /**
   * Delete a notification
   * @param notificationId
   * @returns PasswordActionResponseDto Notification deleted
   * @throws ApiError
   */
  public static deleteNotification(
    notificationId: number,
  ): CancelablePromise<PasswordActionResponseDto> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/auth/notifications/{id}',
      path: {
        id: notificationId,
      },
      errors: {
        401: `Unauthorized`,
        404: `Notification not found`,
      },
    });
  }
}
