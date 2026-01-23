// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { loginService, signupService } from './auth.service';
import { SignupDto, LoginDto } from './auth.types';
import { asyncHandler } from '../../middleware/errorHandler';
import type { LoginResponseDto, SignupResponseDto } from './auth.types';

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
