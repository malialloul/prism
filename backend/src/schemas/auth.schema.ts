import { z } from "zod";
import { registerTable } from "../config/schema-registry";

// User table schema - automatically creates 'users' table
export const UserSchema = registerTable(
  "users",
  z.object({
    email: z.string().email(),
    passwordHash: z.string(),
    fullName: z.string().optional(),
    twoFactorSecret: z.string().optional(),
    twoFactorEnabled: z.boolean().default(false),
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      email: { unique: true },
    },
  }
);

// Password reset tokens table
export const PasswordResetTokenSchema = registerTable(
  "password_reset_tokens",
  z.object({
    userId: z.string().uuid(),
    token: z.string(),
    expiresAt: z.date(),
    usedAt: z.date().optional(),
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      userId: { references: { table: "users", column: "id" } },
      token: { unique: true },
    },
  }
);

// 2FA backup codes table
export const BackupCodeSchema = registerTable(
  "backup_codes",
  z.object({
    userId: z.string().uuid(),
    codeHash: z.string(),
    usedAt: z.date().optional(),
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      userId: { references: { table: "users", column: "id" } },
    },
  }
);

// Request/Response schemas (not registered as tables)
export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const VerifyResetCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

export const ChangeEmailSchema = z.object({
  newEmail: z.string().email(),
  password: z.string(),
});

// 2FA schemas
export const Setup2FASchema = z.object({
  password: z.string(),
});

export const Verify2FASchema = z.object({
  code: z.string().length(6),
});

export const Disable2FASchema = z.object({
  password: z.string(),
  code: z.string().length(6),
});

export const Login2FASchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  tempToken: z.string(),
});

// Public user schema for API responses (excludes sensitive fields)
export const PublicUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserDto = z.infer<typeof UserSchema>;
export type PublicUserDto = z.infer<typeof PublicUserSchema>;
export type SignupDto = z.infer<typeof SignupSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
export type VerifyResetCodeDto = z.infer<typeof VerifyResetCodeSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
