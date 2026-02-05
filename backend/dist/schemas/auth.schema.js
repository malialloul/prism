"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicUserSchema = exports.SharedLoginSchema = exports.RevokeShareSchema = exports.AcceptShareSchema = exports.ShareAccountSchema = exports.Login2FASchema = exports.Disable2FASchema = exports.Verify2FASchema = exports.Setup2FASchema = exports.ChangeEmailSchema = exports.ChangePasswordSchema = exports.ResetPasswordSchema = exports.VerifyResetCodeSchema = exports.ForgotPasswordSchema = exports.LoginSchema = exports.SignupSchema = exports.PermissionRequestSchema = exports.NotificationSchema = exports.SharedAccountSchema = exports.BackupCodeSchema = exports.PasswordResetTokenSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
const schema_registry_1 = require("../config/schema-registry");
// User table schema - automatically creates 'users' table
exports.UserSchema = (0, schema_registry_1.registerTable)("users", zod_1.z.object({
    email: zod_1.z.string().email(),
    passwordHash: zod_1.z.string(),
    fullName: zod_1.z.string().optional(),
    twoFactorSecret: zod_1.z.string().optional(),
    twoFactorEnabled: zod_1.z.boolean().default(false),
    deactivatedAt: zod_1.z.date().optional(),
}), {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
        email: { unique: true },
    },
});
// Password reset tokens table
exports.PasswordResetTokenSchema = (0, schema_registry_1.registerTable)("password_reset_tokens", zod_1.z.object({
    userId: zod_1.z.number().int(),
    token: zod_1.z.string(),
    expiresAt: zod_1.z.date(),
    usedAt: zod_1.z.date().optional(),
}), {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
        userId: { references: { table: "users", column: "id" } },
        token: { unique: true },
    },
});
// 2FA backup codes table
exports.BackupCodeSchema = (0, schema_registry_1.registerTable)("backup_codes", zod_1.z.object({
    userId: zod_1.z.number().int(),
    codeHash: zod_1.z.string(),
    usedAt: zod_1.z.date().optional(),
}), {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
        userId: { references: { table: "users", column: "id" } },
    },
});
// Account sharing table - tracks shared account access
exports.SharedAccountSchema = (0, schema_registry_1.registerTable)("shared_accounts", zod_1.z.object({
    ownerUserId: zod_1.z.number().int(),
    sharedWithEmail: zod_1.z.string().email(),
    sharedWithUserId: zod_1.z.number().int().optional(),
    tempPasswordHash: zod_1.z.string(),
    status: zod_1.z.enum(['pending', 'accepted', 'revoked']).default('pending'),
    permissions: zod_1.z.string().default('{}'), // JSONB stored as string
    expiresAt: zod_1.z.date(),
    acceptedAt: zod_1.z.date().optional(),
    revokedAt: zod_1.z.date().optional(),
}), {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
        ownerUserId: { references: { table: "users", column: "id" } },
        sharedWithUserId: { references: { table: "users", column: "id" } },
        permissions: { type: 'JSONB' },
    },
});
// Notifications table - stores user notifications
exports.NotificationSchema = (0, schema_registry_1.registerTable)("notifications", zod_1.z.object({
    userId: zod_1.z.number().int(),
    type: zod_1.z.enum(['account_shared', 'share_accepted', 'share_revoked', 'permissions_updated', 'permission_request', 'request_approved', 'request_rejected', 'general']),
    title: zod_1.z.string(),
    message: zod_1.z.string(),
    metadata: zod_1.z.string().optional(), // JSON string for additional data
    readAt: zod_1.z.date().optional(),
}), {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
        userId: { references: { table: "users", column: "id" } },
    },
});
// Permission requests table - stores requests from shared users for additional permissions
exports.PermissionRequestSchema = (0, schema_registry_1.registerTable)("permission_requests", zod_1.z.object({
    shareId: zod_1.z.number().int(),
    requestedBy: zod_1.z.number().int(), // The shared user requesting the permission
    ownerUserId: zod_1.z.number().int(), // The account owner who can approve/reject
    permission: zod_1.z.string(), // The permission key being requested (e.g., 'createDatabase')
    status: zod_1.z.enum(['pending', 'approved', 'rejected']).default('pending'),
    message: zod_1.z.string().optional(), // Optional message from requester
    responseMessage: zod_1.z.string().optional(), // Optional message from owner when responding
    respondedAt: zod_1.z.date().optional(),
}), {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
        shareId: { references: { table: "shared_accounts", column: "id" } },
        requestedBy: { references: { table: "users", column: "id" } },
        ownerUserId: { references: { table: "users", column: "id" } },
    },
});
// Request/Response schemas (not registered as tables)
exports.SignupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    fullName: zod_1.z.string().min(2).optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.VerifyResetCodeSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6),
});
exports.ResetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6),
    newPassword: zod_1.z.string().min(8),
});
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8),
});
exports.ChangeEmailSchema = zod_1.z.object({
    newEmail: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
// 2FA schemas
exports.Setup2FASchema = zod_1.z.object({
    password: zod_1.z.string(),
});
exports.Verify2FASchema = zod_1.z.object({
    code: zod_1.z.string().length(6),
});
exports.Disable2FASchema = zod_1.z.object({
    password: zod_1.z.string(),
    code: zod_1.z.string().length(6),
});
exports.Login2FASchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6),
    tempToken: zod_1.z.string(),
});
// Account sharing schemas
exports.ShareAccountSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    expiresInDays: zod_1.z.number().int().min(1).max(30).default(7),
});
exports.AcceptShareSchema = zod_1.z.object({
    shareId: zod_1.z.number().int(),
});
exports.RevokeShareSchema = zod_1.z.object({
    shareId: zod_1.z.number().int(),
});
exports.SharedLoginSchema = zod_1.z.object({
    ownerEmail: zod_1.z.string().email(),
    tempPassword: zod_1.z.string(),
});
// Public user schema for API responses (excludes sensitive fields)
exports.PublicUserSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    email: zod_1.z.string().email(),
    fullName: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
//# sourceMappingURL=auth.schema.js.map