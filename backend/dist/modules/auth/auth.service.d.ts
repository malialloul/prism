import type { SignupDto, LoginDto, ForgotPasswordDto, VerifyResetCodeDto, ResetPasswordDto, ChangePasswordDto, ChangeEmailDto, Setup2FADto, Verify2FADto, Disable2FADto, Login2FADto, DeactivateAccountDto, DeleteAccountDto, ShareAccountDto, RevokeShareDto, SharedLoginDto, TokenResponseDto, TwoFactorRequiredDto, VerifyCodeResultDto, Setup2FAResultDto, Verify2FAResultDto, TwoFactorStatusDto, ChangeEmailResultDto, MessageResponseDto, ShareAccountResultDto, SharedAccountsListDto, SharedAccountDto, NotificationsListDto, SharePermissions, CreatePermissionRequestDto, RespondPermissionRequestDto, PermissionRequestDto, PermissionRequestsListDto, ApiTokenDto } from './auth.types';
export declare const signupService: (body: SignupDto) => Promise<TokenResponseDto>;
export declare const loginService: (body: LoginDto) => Promise<TokenResponseDto | TwoFactorRequiredDto>;
/**
 * Request password reset - sends OTP to email
 */
export declare const forgotPasswordService: (body: ForgotPasswordDto) => Promise<MessageResponseDto>;
/**
 * Verify reset code is valid
 */
export declare const verifyResetCodeService: (body: VerifyResetCodeDto) => Promise<VerifyCodeResultDto>;
/**
 * Reset password with valid code
 */
export declare const resetPasswordService: (body: ResetPasswordDto) => Promise<MessageResponseDto>;
/**
 * Change password for authenticated user
 */
export declare const changePasswordService: (userId: string, body: ChangePasswordDto) => Promise<MessageResponseDto>;
/**
 * Change email for authenticated user
 */
export declare const changeEmailService: (userId: string, body: ChangeEmailDto) => Promise<ChangeEmailResultDto>;
/**
 * Get 2FA status for authenticated user
 */
export declare const get2FAStatusService: (userId: string) => Promise<TwoFactorStatusDto>;
/**
 * Setup 2FA for authenticated user - generates secret and QR code
 */
export declare const setup2FAService: (userId: string, body: Setup2FADto) => Promise<Setup2FAResultDto>;
/**
 * Verify 2FA code and enable 2FA
 */
export declare const verify2FAService: (userId: string, body: Verify2FADto) => Promise<Verify2FAResultDto>;
/**
 * Disable 2FA for authenticated user
 */
export declare const disable2FAService: (userId: string, body: Disable2FADto) => Promise<MessageResponseDto>;
/**
 * Verify 2FA code during login
 */
export declare const login2FAService: (body: Login2FADto) => Promise<TokenResponseDto>;
/**
 * Deactivate account for authenticated user
 */
export declare const deactivateAccountService: (userId: string, body: DeactivateAccountDto) => Promise<MessageResponseDto>;
/**
 * Reactivate a deactivated account during login
 */
export declare const reactivateAccountService: (userId: string) => Promise<void>;
/**
 * Delete account permanently for authenticated user
 */
export declare const deleteAccountService: (userId: string, body: DeleteAccountDto) => Promise<MessageResponseDto>;
/**
 * Share account with another user
 */
export declare const shareAccountService: (userId: string, body: ShareAccountDto) => Promise<ShareAccountResultDto>;
/**
 * Get all shared accounts (both shared by me and shared with me)
 */
export declare const getSharedAccountsService: (userId: string) => Promise<SharedAccountsListDto>;
/**
 * Revoke a shared account
 */
export declare const revokeShareService: (userId: string, body: RevokeShareDto) => Promise<MessageResponseDto>;
/**
 * Update permissions for a shared account
 */
export declare const updateSharePermissionsService: (userId: string, body: {
    shareId: number;
    permissions: SharePermissions;
}) => Promise<{
    share: SharedAccountDto;
    message: string;
}>;
/**
 * Delete a shared account record (removes it completely from database)
 */
export declare const deleteShareService: (userId: string, shareId: number) => Promise<MessageResponseDto>;
/**
 * Login to a shared account using temp password
 */
export declare const sharedLoginService: (body: SharedLoginDto) => Promise<TokenResponseDto>;
/**
 * Get notifications for a user
 */
export declare const getNotificationsService: (userId: string, isSharedAccess?: boolean, shareId?: number) => Promise<NotificationsListDto>;
/**
 * Mark a notification as read
 */
export declare const markNotificationReadService: (userId: string, notificationId: string) => Promise<MessageResponseDto>;
/**
 * Mark all notifications as read
 */
export declare const markAllNotificationsReadService: (userId: string) => Promise<MessageResponseDto>;
/**
 * Delete a notification
 */
export declare const deleteNotificationService: (userId: string, notificationId: string) => Promise<MessageResponseDto>;
/**
 * Create a permission request from a shared user
 */
export declare const createPermissionRequestService: (userId: string, shareId: number, body: CreatePermissionRequestDto) => Promise<{
    request: PermissionRequestDto;
}>;
/**
 * Get pending permission requests for the current user (as owner)
 */
export declare const getPermissionRequestsService: (userId: string) => Promise<PermissionRequestsListDto>;
/**
 * Get permission requests made by the current user (as shared user)
 * Note: userId here is actually the owner's user ID since shared users access the owner's account
 */
export declare const getMyPermissionRequestsService: (userId: string, shareId?: number) => Promise<PermissionRequestsListDto>;
/**
 * Respond to a permission request (approve or reject)
 */
export declare const respondPermissionRequestService: (userId: string, body: RespondPermissionRequestDto) => Promise<MessageResponseDto>;
/**
 * Cancel a pending permission request (by the requester)
 */
export declare const cancelPermissionRequestService: (userId: string, requestId: string, shareId: number) => Promise<MessageResponseDto>;
/**
 * Get current permissions for a shared user from the database
 * This is used to fetch fresh permissions on page load (since JWT may be stale)
 */
export declare const getMyPermissionsService: (shareId: number) => Promise<{
    permissions: SharePermissions;
}>;
export interface OAuthUserData {
    email: string;
    name: string;
    provider: 'google' | 'github';
    providerId: string;
    avatarUrl?: string;
}
/**
 * Handle OAuth login/signup
 * If user exists with this OAuth provider, log them in
 * If user exists with email but different provider, link the account
 * If user doesn't exist, create a new account
 */
export declare const oauthLoginService: (userData: OAuthUserData) => Promise<TokenResponseDto>;
/**
 * Exchange OAuth authorization code for access token (Google)
 */
export declare const exchangeGoogleCodeService: (code: string) => Promise<OAuthUserData>;
/**
 * Exchange OAuth authorization code for access token (GitHub)
 */
export declare const exchangeGithubCodeService: (code: string) => Promise<OAuthUserData>;
/**
 * Create a new API token for a user
 */
export declare const createApiTokenService: (userId: string, body: {
    name: string;
    expiresInDays?: number;
}) => Promise<{
    token: ApiTokenDto;
    plainToken: string;
}>;
/**
 * Get all API tokens for a user
 */
export declare const getApiTokensService: (userId: string) => Promise<{
    tokens: ApiTokenDto[];
}>;
/**
 * Revoke an API token
 */
export declare const revokeApiTokenService: (userId: string, tokenId: number) => Promise<MessageResponseDto>;
/**
 * Reveal (decrypt) an API token for the user
 */
export declare const revealApiTokenService: (userId: string, tokenId: number) => Promise<{
    plainToken: string;
}>;
/**
 * Validate an API token and return the user info
 * Used by auth middleware for API token authentication
 */
export declare const validateApiTokenService: (token: string) => Promise<{
    userId: string;
    email: string;
    fullName?: string;
} | null>;
//# sourceMappingURL=auth.service.d.ts.map