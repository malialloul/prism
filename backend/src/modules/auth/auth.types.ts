// src/modules/auth/auth.types.ts

import type { ApiResponseDto } from '../../utils/errors';

export interface SignupDto {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  email: string;
  fullName?: string;
}

export interface TokenResponseDto {
  token: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyResetCodeDto {
  email: string;
  code: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface MessageResponseDto {
  message: string;
}

// Database row types
export interface DbUserDto {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DbPasswordResetTokenDto {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export type LoginResponseDto = ApiResponseDto<TokenResponseDto>;

export type SignupResponseDto = ApiResponseDto<TokenResponseDto>;

export type ForgotPasswordResponseDto = ApiResponseDto<MessageResponseDto>;

export type VerifyResetCodeResponseDto = ApiResponseDto<{ valid: boolean }>;

export type ResetPasswordResponseDto = ApiResponseDto<MessageResponseDto>;

export type ChangePasswordResponseDto = ApiResponseDto<MessageResponseDto>;
