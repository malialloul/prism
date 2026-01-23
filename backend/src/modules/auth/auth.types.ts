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

export type LoginResponseDto = ApiResponseDto<TokenResponseDto>;

export type SignupResponseDto = ApiResponseDto<TokenResponseDto>;
