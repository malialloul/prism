// src/modules/auth/auth.types.ts

export interface SignupRequestDto {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  email: string;
  fullName?: string;
}

export interface AuthResponseDto {
  user: UserDto;
  token: string;
}
