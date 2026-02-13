import { z } from "zod";
import { registerTable } from "../config/schema-registry";

// User table schema - automatically creates 'users' table
export const UserSchema = registerTable(
  "users",
  z.object({
    email: z.string().email(),
    passwordHash: z.string().optional(), // Optional for OAuth users
    fullName: z.string().optional(),
    twoFactorSecret: z.string().optional(),
    twoFactorEnabled: z.boolean().default(false),
    deactivatedAt: z.date().optional(),
    oauthProvider: z.enum(['google', 'github']).optional(),
    oauthProviderId: z.string().optional(),
    avatarUrl: z.string().optional(),
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
    userId: z.number().int(),
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
    userId: z.number().int(),
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

// Account sharing table - tracks shared account access
export const SharedAccountSchema = registerTable(
  "shared_accounts",
  z.object({
    ownerUserId: z.number().int(),
    sharedWithEmail: z.string().email(),
    sharedWithUserId: z.number().int().optional(),
    tempPasswordHash: z.string(),
    tempPassword: z.string().optional(), // Plain text password, cleared after acceptance/expiry
    status: z.enum(['pending', 'accepted', 'revoked']).default('pending'),
    permissions: z.string().default('{}'), // JSONB stored as string
    expiresAt: z.date(),
    acceptedAt: z.date().optional(),
    revokedAt: z.date().optional(),
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      ownerUserId: { references: { table: "users", column: "id" } },
      sharedWithUserId: { references: { table: "users", column: "id" } },
      permissions: { type: 'JSONB' },
    },
  }
);

// Notifications table - stores user notifications
export const NotificationSchema = registerTable(
  "notifications",
  z.object({
    userId: z.number().int(),
    type: z.enum(['account_shared', 'share_accepted', 'share_revoked', 'permissions_updated', 'permission_request', 'request_approved', 'request_rejected', 'general']),
    title: z.string(),
    message: z.string(),
    metadata: z.string().optional(), // JSON string for additional data
    readAt: z.date().optional(),
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      userId: { references: { table: "users", column: "id" } },
    },
  }
);

// Permission requests table - stores requests from shared users for additional permissions
export const PermissionRequestSchema = registerTable(
  "permission_requests",
  z.object({
    shareId: z.number().int(),
    requestedBy: z.number().int(), // The shared user requesting the permission
    ownerUserId: z.number().int(), // The account owner who can approve/reject
    permission: z.string(), // The permission key being requested (e.g., 'createDatabase')
    status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
    message: z.string().optional(), // Optional message from requester
    responseMessage: z.string().optional(), // Optional message from owner when responding
    respondedAt: z.date().optional(),
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      shareId: { references: { table: "shared_accounts", column: "id" } },
      requestedBy: { references: { table: "users", column: "id" } },
      ownerUserId: { references: { table: "users", column: "id" } },
    },
  }
);

// API tokens table - stores user-generated API tokens for auto-generated APIs
export const ApiTokenSchema = registerTable(
  "api_tokens",
  z.object({
    userId: z.number().int(),
    name: z.string().max(100),
    tokenHash: z.string(), // Hashed token for validation
    tokenEncrypted: z.string(), // Encrypted token for retrieval
    tokenPrefix: z.string().max(12), // First 12 chars of token for identification (prism_xxxxx)
    lastUsedAt: z.date().optional(),
    expiresAt: z.date().optional(), // Optional expiration
    revokedAt: z.date().optional(),
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      userId: { references: { table: "users", column: "id" } },
      tokenHash: { unique: true },
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

// Account sharing schemas
export const ShareAccountSchema = z.object({
  email: z.string().email(),
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

export const AcceptShareSchema = z.object({
  shareId: z.number().int(),
});

export const RevokeShareSchema = z.object({
  shareId: z.number().int(),
});

export const SharedLoginSchema = z.object({
  ownerEmail: z.string().email(),
  tempPassword: z.string(),
});

// Public user schema for API responses (excludes sensitive fields)
export const PublicUserSchema = z.object({
  id: z.number().int(),
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
export type ShareAccountDto = z.infer<typeof ShareAccountSchema>;
export type AcceptShareDto = z.infer<typeof AcceptShareSchema>;
export type RevokeShareDto = z.infer<typeof RevokeShareSchema>;
export type SharedLoginDto = z.infer<typeof SharedLoginSchema>;
