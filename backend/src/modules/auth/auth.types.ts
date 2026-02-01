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

export interface ChangeEmailDto {
  newEmail: string;
  password: string;
}

export interface Setup2FADto {
  password: string;
}

export interface Verify2FADto {
  code: string;
}

export interface Disable2FADto {
  password: string;
  code: string;
}

export interface Login2FADto {
  email: string;
  code: string;
  tempToken: string;
}

export interface DeactivateAccountDto {
  password: string;
}

export interface DeleteAccountDto {
  password: string;
  confirmation: string; // must be "DELETE"
}

export interface TwoFactorRequiredDto {
  requires2FA: true;
  tempToken: string;
  email: string;
}

export interface VerifyCodeResultDto {
  valid: boolean;
}

export interface Setup2FAResultDto {
  qrCode: string;
  secret: string;
}

export interface Verify2FAResultDto {
  backupCodes: string[];
}

export interface TwoFactorStatusDto {
  enabled: boolean;
}

// Account Sharing types
export interface ShareAccountDto {
  email: string;
  expiresInDays?: number;
}

export interface AcceptShareDto {
  shareId: number;
}

export interface RevokeShareDto {
  shareId: number;
}

export interface SharedLoginDto {
  ownerEmail: string;
  tempPassword: string;
}

export interface SharedAccountDto {
  id: number;
  ownerUserId: number;
  ownerEmail: string;
  ownerFullName: string | null;
  sharedWithEmail: string;
  sharedWithUserId: number | null;
  status: 'pending' | 'accepted' | 'revoked';
  tempPassword?: string; // Only returned when creating a share
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface NotificationDto {
  id: number;
  userId: number;
  type: 'account_shared' | 'share_accepted' | 'share_revoked' | 'general';
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface ShareAccountResultDto {
  share: SharedAccountDto;
  message: string;
}

export interface SharedAccountsListDto {
  sharedByMe: SharedAccountDto[];
  sharedWithMe: SharedAccountDto[];
}

export interface NotificationsListDto {
  notifications: NotificationDto[];
  unreadCount: number;
}

// Database row types for account sharing
export interface DbSharedAccountDto {
  id: number;
  owner_user_id: number;
  shared_with_email: string;
  shared_with_user_id: number | null;
  temp_password_hash: string;
  status: 'pending' | 'accepted' | 'revoked';
  expires_at: Date;
  accepted_at: Date | null;
  revoked_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface DbNotificationDto {
  id: number;
  user_id: number;
  type: 'account_shared' | 'share_accepted' | 'share_revoked' | 'general';
  title: string;
  message: string;
  metadata: string | null;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ChangeEmailResultDto {
  token: string;
  message: string;
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
  two_factor_secret: string | null;
  two_factor_enabled: boolean;
  deactivated_at: Date | null;
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

export interface DbBackupCodeDto {
  id: string;
  user_id: string;
  code_hash: string;
  used_at: Date | null;
  created_at: Date;
}

export type LoginResponseDto = ApiResponseDto<TokenResponseDto>;

export type SignupResponseDto = ApiResponseDto<TokenResponseDto>;

export type ForgotPasswordResponseDto = ApiResponseDto<MessageResponseDto>;

export type VerifyResetCodeResponseDto = ApiResponseDto<VerifyCodeResultDto>;

export type ResetPasswordResponseDto = ApiResponseDto<MessageResponseDto>;

export type ChangePasswordResponseDto = ApiResponseDto<MessageResponseDto>;

export type ChangeEmailResponseDto = ApiResponseDto<ChangeEmailResultDto>;

export type Setup2FAResponseDto = ApiResponseDto<Setup2FAResultDto>;

export type Verify2FAResponseDto = ApiResponseDto<Verify2FAResultDto>;

export type Disable2FAResponseDto = ApiResponseDto<MessageResponseDto>;

export type TwoFactorStatusResponseDto = ApiResponseDto<TwoFactorStatusDto>;

export type Login2FAResponseDto = ApiResponseDto<TokenResponseDto>;

export type TwoFactorRequiredResponseDto = ApiResponseDto<TwoFactorRequiredDto>;

export type DeactivateAccountResponseDto = ApiResponseDto<MessageResponseDto>;

export type DeleteAccountResponseDto = ApiResponseDto<MessageResponseDto>;

// Account sharing response types
export type ShareAccountResponseDto = ApiResponseDto<ShareAccountResultDto>;

export type SharedAccountsResponseDto = ApiResponseDto<SharedAccountsListDto>;

export type AcceptShareResponseDto = ApiResponseDto<MessageResponseDto>;

export type RevokeShareResponseDto = ApiResponseDto<MessageResponseDto>;

export type SharedLoginResponseDto = ApiResponseDto<TokenResponseDto>;

export type NotificationsResponseDto = ApiResponseDto<NotificationsListDto>;

export type MarkNotificationReadResponseDto = ApiResponseDto<MessageResponseDto>;
