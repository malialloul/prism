// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { enforceApiTokenLimit, enforceSharedAccountLimit, getUserLimitsAndUsage } from '../../services/limits.service';
import { 
  loginService, 
  signupService, 
  forgotPasswordService, 
  verifyResetCodeService, 
  resetPasswordService,
  changePasswordService,
  changeEmailService,
  get2FAStatusService,
  setup2FAService,
  verify2FAService,
  disable2FAService,
  login2FAService,
  deactivateAccountService,
  deleteAccountService,
  shareAccountService,
  getSharedAccountsService,
  revokeShareService,
  updateSharePermissionsService,
  deleteShareService,
  sharedLoginService,
  getNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
  createPermissionRequestService,
  getPermissionRequestsService,
  getMyPermissionRequestsService,
  respondPermissionRequestService,
  cancelPermissionRequestService,
  createApiTokenService,
  getApiTokensService,
  revokeApiTokenService,
  revealApiTokenService,
} from './auth.service';
import { 
  SignupDto, 
  LoginDto, 
  ForgotPasswordDto, 
  VerifyResetCodeDto, 
  ResetPasswordDto,
  ChangePasswordDto,
  ChangeEmailDto,
  Setup2FADto,
  Verify2FADto,
  Disable2FADto,
  Login2FADto,
  DeactivateAccountDto,
  DeleteAccountDto,
  ShareAccountDto,
  RevokeShareDto,
  UpdateSharePermissionsDto,
  SharedLoginDto,
  CreatePermissionRequestDto,
  RespondPermissionRequestDto,
  CreateApiTokenDto,
} from './auth.types';
import { asyncHandler } from '../../middleware/errorHandler';
import { AuthorizationError } from '../../utils/errors';
import type { 
  LoginResponseDto, 
  SignupResponseDto, 
  ForgotPasswordResponseDto, 
  VerifyResetCodeResponseDto, 
  ResetPasswordResponseDto,
  ChangePasswordResponseDto,
  ChangeEmailResponseDto,
  TwoFactorStatusResponseDto,
  Setup2FAResponseDto,
  Verify2FAResponseDto,
  Disable2FAResponseDto,
  Login2FAResponseDto,
  DeactivateAccountResponseDto,
  DeleteAccountResponseDto,
  ShareAccountResponseDto,
  SharedAccountsResponseDto,
  RevokeShareResponseDto,
  SharedLoginResponseDto,
  NotificationsResponseDto,
  MarkNotificationReadResponseDto,
  PermissionRequestsResponseDto,
  CreatePermissionRequestResponseDto,
  RespondPermissionRequestResponseDto,
  CreateApiTokenResponseDto,
  ApiTokensResponseDto,
  RevokeApiTokenResponseDto,
  RevealApiTokenResponseDto,
} from './auth.types';

export const signupHandler = asyncHandler(async (
  req: Request<{}, {}, SignupDto>,
  res: Response,
  _next: NextFunction,
) => {
  const authData = await signupService(req.body);
  const result: SignupResponseDto = {
    status: 'success',
    message: 'Account created successfully',
    data: authData,
  };
  res.status(201).json(result);
});

export const loginHandler = asyncHandler(async (
  req: Request<{}, {}, LoginDto>,
  res: Response,
  _next: NextFunction,
) => {
  const authData = await loginService(req.body);
  
  // Check if 2FA is required
  if ('requires2FA' in authData && authData.requires2FA) {
    res.json({
      status: 'success',
      message: 'Two-factor authentication required',
      data: {
        requires2FA: true,
        tempToken: authData.tempToken,
        email: authData.email,
      },
    });
    return;
  }

  const result: LoginResponseDto = {
    status: 'success',
    message: 'Login successful',
    data: authData as { token: string },
  };
  res.json(result);
});

export const forgotPasswordHandler = asyncHandler(async (
  req: Request<{}, {}, ForgotPasswordDto>,
  res: Response,
  _next: NextFunction,
) => {
  const data = await forgotPasswordService(req.body);
  const result: ForgotPasswordResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

export const verifyResetCodeHandler = asyncHandler(async (
  req: Request<{}, {}, VerifyResetCodeDto>,
  res: Response,
  _next: NextFunction,
) => {
  const data = await verifyResetCodeService(req.body);
  const result: VerifyResetCodeResponseDto = {
    status: 'success',
    message: data.valid ? 'Code is valid' : 'Invalid or expired code',
    data,
  };
  res.json(result);
});

export const resetPasswordHandler = asyncHandler(async (
  req: Request<{}, {}, ResetPasswordDto>,
  res: Response,
  _next: NextFunction,
) => {
  const data = await resetPasswordService(req.body);
  const result: ResetPasswordResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

export const changePasswordHandler = asyncHandler(async (
  req: Request<{}, {}, ChangePasswordDto>,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await changePasswordService(userId, req.body);
  const result: ChangePasswordResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

export const changeEmailHandler = asyncHandler(async (
  req: Request<{}, {}, ChangeEmailDto>,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await changeEmailService(userId, req.body);
  const result: ChangeEmailResponseDto = {
    status: 'success',
    message: data.message,
    data: { token: data.token, message: data.message },
  };
  res.json(result);
});

// 2FA Handlers
export const get2FAStatusHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await get2FAStatusService(userId);
  const result: TwoFactorStatusResponseDto = {
    status: 'success',
    message: 'Two-factor authentication status retrieved',
    data,
  };
  res.json(result);
});

export const setup2FAHandler = asyncHandler(async (
  req: Request<{}, {}, Setup2FADto>,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await setup2FAService(userId, req.body);
  const result: Setup2FAResponseDto = {
    status: 'success',
    message: 'Scan the QR code with your authenticator app',
    data,
  };
  res.json(result);
});

export const verify2FAHandler = asyncHandler(async (
  req: Request<{}, {}, Verify2FADto>,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await verify2FAService(userId, req.body);
  const result: Verify2FAResponseDto = {
    status: 'success',
    message: 'Two-factor authentication enabled successfully',
    data,
  };
  res.json(result);
});

export const disable2FAHandler = asyncHandler(async (
  req: Request<{}, {}, Disable2FADto>,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await disable2FAService(userId, req.body);
  const result: Disable2FAResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

export const login2FAHandler = asyncHandler(async (
  req: Request<{}, {}, Login2FADto>,
  res: Response,
  _next: NextFunction,
) => {
  const data = await login2FAService(req.body);
  const result: Login2FAResponseDto = {
    status: 'success',
    message: 'Login successful',
    data,
  };
  res.json(result);
});

export const deactivateAccountHandler = asyncHandler(async (
  req: Request<{}, {}, DeactivateAccountDto>,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await deactivateAccountService(userId, req.body);
  const result: DeactivateAccountResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

export const deleteAccountHandler = asyncHandler(async (
  req: Request<{}, {}, DeleteAccountDto>,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await deleteAccountService(userId, req.body);
  const result: DeleteAccountResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

// ============================================================================
// ACCOUNT SHARING HANDLERS
// ============================================================================

export const shareAccountHandler = asyncHandler(async (
  req: Request<{}, {}, ShareAccountDto>,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  
  // Enforce shared account limit for current version
  const limitResult = await enforceSharedAccountLimit(userId);
  
  const data = await shareAccountService(userId, req.body);
  const result: ShareAccountResponseDto = {
    status: 'success',
    message: data.message,
    data,
    warning: limitResult.warning,
  };
  res.json(result);
});

export const getSharedAccountsHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await getSharedAccountsService(userId);
  const result: SharedAccountsResponseDto = {
    status: 'success',
    message: 'Shared accounts retrieved',
    data,
  };
  res.json(result);
});

export const revokeShareHandler = asyncHandler(async (
  req: Request<{}, {}, RevokeShareDto>,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await revokeShareService(userId, req.body);
  const result: RevokeShareResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

export const updateSharePermissionsHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const shareId = parseInt(req.params.shareId as string, 10);
  const { permissions } = req.body as { permissions: UpdateSharePermissionsDto['permissions'] };
  const data = await updateSharePermissionsService(userId, { shareId, permissions });
  res.json({
    status: 'success',
    message: data.message,
    data: { share: data.share },
  });
});

export const deleteShareHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const shareId = parseInt(req.params.shareId as string, 10);
  const data = await deleteShareService(userId, shareId);
  res.json({
    status: 'success',
    message: data.message,
  });
});

export const sharedLoginHandler = asyncHandler(async (
  req: Request<{}, {}, SharedLoginDto>,
  res: Response,
  _next: NextFunction,
) => {
  const data = await sharedLoginService(req.body);
  const result: SharedLoginResponseDto = {
    status: 'success',
    message: 'Shared login successful',
    data,
  };
  res.json(result);
});

// ============================================================================
// NOTIFICATION HANDLERS
// ============================================================================

export const getNotificationsHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const isSharedAccess = req.user!.isSharedAccess || false;
  const shareId = req.user!.shareId;
  const data = await getNotificationsService(userId, isSharedAccess, shareId);
  const result: NotificationsResponseDto = {
    status: 'success',
    message: 'Notifications retrieved',
    data,
  };
  res.json(result);
});

export const markNotificationReadHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const notificationId = req.params.id as string;
  const data = await markNotificationReadService(userId, notificationId);
  const result: MarkNotificationReadResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

export const markAllNotificationsReadHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await markAllNotificationsReadService(userId);
  const result: MarkNotificationReadResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

export const deleteNotificationHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const notificationId = req.params.id as string;
  const { deleteNotificationService } = await import('./auth.service');
  const data = await deleteNotificationService(userId, notificationId);
  const result: MarkNotificationReadResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

// ============================================================================
// PERMISSION REQUEST HANDLERS
// ============================================================================

export const createPermissionRequestHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const tokenShareId = req.user!.shareId; // Share ID from the token
  const shareId = parseInt(req.params.shareId as string, 10);
  
  // Verify the share ID in the URL matches the one in the token
  if (!tokenShareId || tokenShareId !== shareId) {
    throw new AuthorizationError('You can only request permissions for your own share');
  }
  
  const body = req.body as CreatePermissionRequestDto;
  const data = await createPermissionRequestService(userId, shareId, body);
  const result: CreatePermissionRequestResponseDto = {
    status: 'success',
    message: 'Permission request created successfully',
    data,
  };
  res.status(201).json(result);
});

export const getPermissionRequestsHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await getPermissionRequestsService(userId);
  const result: PermissionRequestsResponseDto = {
    status: 'success',
    message: 'Permission requests retrieved',
    data,
  };
  res.json(result);
});

export const getMyPermissionRequestsHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const shareId = req.user!.shareId; // Pass shareId for shared users
  const data = await getMyPermissionRequestsService(userId, shareId);
  const result: PermissionRequestsResponseDto = {
    status: 'success',
    message: 'Your permission requests retrieved',
    data,
  };
  res.json(result);
});

export const respondPermissionRequestHandler = asyncHandler(async (
  req: Request<{}, {}, RespondPermissionRequestDto>,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const data = await respondPermissionRequestService(userId, req.body);
  const result: RespondPermissionRequestResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

export const cancelPermissionRequestHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userId = req.user!.userId;
  const shareId = req.user!.shareId;
  const requestId = req.params.requestId as string;
  
  if (!shareId) {
    throw new AuthorizationError('Share ID not found in token');
  }
  
  const data = await cancelPermissionRequestService(userId, requestId, shareId);
  const result: RespondPermissionRequestResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

export const getMyPermissionsHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const shareId = req.user!.shareId;
  
  if (!shareId) {
    throw new AuthorizationError('Share ID not found in token');
  }
  
  const { getMyPermissionsService } = await import('./auth.service');
  const data = await getMyPermissionsService(shareId);
  res.json({
    status: 'success',
    message: 'Permissions retrieved',
    data,
  });
});

// OAuth Handlers

/**
 * Redirect to Google OAuth
 */
export const googleOAuthHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { oauthConfig } = await import('../../config/oauth');
  
  const params = new URLSearchParams({
    client_id: oauthConfig.google.clientId,
    redirect_uri: oauthConfig.google.redirectUri,
    response_type: 'code',
    scope: oauthConfig.google.scope,
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`${oauthConfig.google.authUrl}?${params.toString()}`);
});

/**
 * Handle Google OAuth callback
 */
export const googleOAuthCallbackHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { oauthConfig } = await import('../../config/oauth');
  const { exchangeGoogleCodeService, oauthLoginService } = await import('./auth.service');
  
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error) {
    return res.redirect(`${oauthConfig.frontendUrl}/signin?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${oauthConfig.frontendUrl}/signin?error=missing_code`);
  }

  try {
    const userData = await exchangeGoogleCodeService(code);
    const { token } = await oauthLoginService(userData);
    
    // Redirect to frontend with token
    res.redirect(`${oauthConfig.frontendUrl}/oauth/callback?token=${token}`);
  } catch (err: any) {
    console.error('Google OAuth error:', err);
    const errorMessage = err.message || 'Authentication failed';
    res.redirect(`${oauthConfig.frontendUrl}/signin?error=${encodeURIComponent(errorMessage)}`);
  }
});

/**
 * Redirect to GitHub OAuth
 */
export const githubOAuthHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { oauthConfig } = await import('../../config/oauth');
  
  const params = new URLSearchParams({
    client_id: oauthConfig.github.clientId,
    redirect_uri: oauthConfig.github.redirectUri,
    scope: oauthConfig.github.scope,
  });

  res.redirect(`${oauthConfig.github.authUrl}?${params.toString()}`);
});

/**
 * Handle GitHub OAuth callback
 */
export const githubOAuthCallbackHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { oauthConfig } = await import('../../config/oauth');
  const { exchangeGithubCodeService, oauthLoginService } = await import('./auth.service');
  
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error) {
    return res.redirect(`${oauthConfig.frontendUrl}/signin?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${oauthConfig.frontendUrl}/signin?error=missing_code`);
  }

  try {
    const userData = await exchangeGithubCodeService(code);
    const { token } = await oauthLoginService(userData);
    
    // Redirect to frontend with token
    res.redirect(`${oauthConfig.frontendUrl}/oauth/callback?token=${token}`);
  } catch (err: any) {
    console.error('GitHub OAuth error:', err);
    const errorMessage = err.message || 'Authentication failed';
    res.redirect(`${oauthConfig.frontendUrl}/signin?error=${encodeURIComponent(errorMessage)}`);
  }
});

// =====================
// API Token Handlers
// =====================

/**
 * Create a new API token
 */
export const createApiTokenHandler = asyncHandler(async (
  req: Request<{}, {}, CreateApiTokenDto>,
  res: Response,
  _next: NextFunction,
) => {
  if (!req.user?.userId) {
    throw new AuthorizationError('User not authenticated');
  }
  
  // Enforce API token limit for current version
  const limitResult = await enforceApiTokenLimit(req.user.userId);
  
  const data = await createApiTokenService(req.user.userId, req.body);
  const result: CreateApiTokenResponseDto = {
    status: 'success',
    message: 'API token created successfully',
    data,
    warning: limitResult.warning,
  };
  res.status(201).json(result);
});

/**
 * Get all API tokens for the current user
 */
export const getApiTokensHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (!req.user?.userId) {
    throw new AuthorizationError('User not authenticated');
  }
  
  const data = await getApiTokensService(req.user.userId);
  const result: ApiTokensResponseDto = {
    status: 'success',
    message: 'API tokens retrieved successfully',
    data,
  };
  res.json(result);
});

/**
 * Revoke an API token
 */
export const revokeApiTokenHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (!req.user?.userId) {
    throw new AuthorizationError('User not authenticated');
  }
  
  const tokenId = parseInt(req.params.tokenId as string, 10);
  const data = await revokeApiTokenService(req.user.userId, tokenId);
  const result: RevokeApiTokenResponseDto = {
    status: 'success',
    message: data.message,
  };
  res.json(result);
});

/**
 * Reveal (get plain text) an API token
 */
export const revealApiTokenHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (!req.user?.userId) {
    throw new AuthorizationError('User not authenticated');
  }
  
  const tokenId = parseInt(req.params.tokenId as string, 10);
  const data = await revealApiTokenService(req.user.userId, tokenId);
  const result: RevealApiTokenResponseDto = {
    status: 'success',
    message: 'Token retrieved successfully',
    data,
  };
  res.json(result);
});

// =====================
// Version & Limits Handler
// =====================

/**
 * Get current version info and user's limits/usage
 */
export const getVersionLimitsHandler = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (!req.user?.userId) {
    throw new AuthorizationError('User not authenticated');
  }
  
  const data = await getUserLimitsAndUsage(req.user.userId);
  res.json({
    status: 'success',
    message: 'Version and limits retrieved',
    data,
  });
});