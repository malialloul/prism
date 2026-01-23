// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { loginService, signupService } from './auth.service';
import { SignupRequestDto, LoginRequestDto } from './auth.types';

export const signupHandler = async (
  req: Request<{}, {}, SignupRequestDto>,
  res: Response,
) => {
  const result = await signupService(req.body);
  res.status(201).json(result);
};

export const loginHandler = async (
  req: Request<{}, {}, LoginRequestDto>,
  res: Response,
) => {
  const result = await loginService(req.body);
  res.json(result);
};
