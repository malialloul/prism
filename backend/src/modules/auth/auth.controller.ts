// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
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
  sharedLoginService,
  getNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
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
  SharedLoginDto,
} from './auth.types';
import { asyncHandler } from '../../middleware/errorHandler';
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
  const data = await shareAccountService(userId, req.body);
  const result: ShareAccountResponseDto = {
    status: 'success',
    message: data.message,
    data,
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
  const data = await getNotificationsService(userId);
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