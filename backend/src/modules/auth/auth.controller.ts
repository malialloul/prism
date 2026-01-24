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
