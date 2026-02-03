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
import type { SharePermissions, SharedAccountDto, CreatePermissionRequestDto, PermissionRequestsResponseDto, CreatePermissionRequestResponseDto } from '../models/SharedAccountDto';
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
   * Delete a shared account record
   * @param shareId
   * @returns PasswordActionResponseDto Share deleted successfully
   * @throws ApiError
   */
  public static deleteShare(
    shareId: number,
  ): CancelablePromise<PasswordActionResponseDto> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/auth/account/share/{shareId}',
      path: { shareId },
      errors: {
        401: `Unauthorized`,
        404: `Share not found`,
      },
    });
  }

  /**
   * Update share permissions
   * @param shareId
   * @param permissions
   * @returns Updated share data
   * @throws ApiError
   */
  public static updateSharePermissions(
    shareId: number,
    permissions: SharePermissions,
  ): CancelablePromise<{ status: string; message: string; data: { share: SharedAccountDto } }> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/auth/account/share/{shareId}/permissions',
      path: { shareId },
      body: { permissions },
      mediaType: 'application/json',
      errors: {
        401: `Unauthorized`,
        404: `Share not found`,
        400: `Validation error`,
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
export class PermissionRequestService {
  /**
   * Create a permission request
   * @param shareId
   * @param requestBody
   * @returns CreatePermissionRequestResponseDto Permission request created
   * @throws ApiError
   */
  public static createPermissionRequest(
    shareId: number,
    requestBody: CreatePermissionRequestDto,
  ): CancelablePromise<CreatePermissionRequestResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/permission-requests/{shareId}',
      path: { shareId },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Validation error`,
        401: `Unauthorized`,
        404: `Share not found`,
        409: `Request already pending`,
      },
    });
  }

  /**
   * Get my permission requests (as shared user)
   * @returns PermissionRequestsResponseDto Permission requests list
   * @throws ApiError
   */
  public static getMyPermissionRequests(): CancelablePromise<PermissionRequestsResponseDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/auth/permission-requests/my',
      errors: {
        401: `Unauthorized`,
      },
    });
  }

  /**
   * Get permission requests (as owner)
   * @returns PermissionRequestsResponseDto Permission requests list
   * @throws ApiError
   */
  public static getPermissionRequests(): CancelablePromise<PermissionRequestsResponseDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/auth/permission-requests',
      errors: {
        401: `Unauthorized`,
      },
    });
  }

  /**
   * Respond to a permission request (approve or reject)
   * @param requestId
   * @param action
   * @param message
   * @returns PasswordActionResponseDto Response recorded
   * @throws ApiError
   */
  public static respondPermissionRequest(
    requestId: number,
    action: 'approve' | 'reject',
    message?: string,
  ): CancelablePromise<PasswordActionResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/permission-requests/respond',
      body: { requestId, action, message },
      mediaType: 'application/json',
      errors: {
        401: `Unauthorized`,
        404: `Request not found`,
        400: `Validation error`,
      },
    });
  }

  /**
   * Cancel a permission request
   * @param requestId
   * @returns PasswordActionResponseDto Request cancelled
   * @throws ApiError
   */
  public static cancelPermissionRequest(
    requestId: number,
  ): CancelablePromise<PasswordActionResponseDto> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/auth/permission-requests/{requestId}',
      path: { requestId },
      errors: {
        401: `Unauthorized`,
        404: `Request not found`,
      },
    });
  }
}