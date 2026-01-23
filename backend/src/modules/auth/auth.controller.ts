// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { 
  loginService, 
  signupService, 
  forgotPasswordService, 
  verifyResetCodeService, 
  resetPasswordService,
  changePasswordService,
} from './auth.service';
import { 
  SignupDto, 
  LoginDto, 
  ForgotPasswordDto, 
  VerifyResetCodeDto, 
  ResetPasswordDto,
  ChangePasswordDto,
} from './auth.types';
import { asyncHandler } from '../../middleware/errorHandler';
import type { 
  LoginResponseDto, 
  SignupResponseDto, 
  ForgotPasswordResponseDto, 
  VerifyResetCodeResponseDto, 
  ResetPasswordResponseDto,
  ChangePasswordResponseDto,
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
  const result: LoginResponseDto = {
    status: 'success',
    message: 'Login successful',
    data: authData,
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
