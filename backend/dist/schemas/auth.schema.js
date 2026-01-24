"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicUserSchema = exports.Login2FASchema = exports.Disable2FASchema = exports.Verify2FASchema = exports.Setup2FASchema = exports.ChangeEmailSchema = exports.ChangePasswordSchema = exports.ResetPasswordSchema = exports.VerifyResetCodeSchema = exports.ForgotPasswordSchema = exports.LoginSchema = exports.SignupSchema = exports.BackupCodeSchema = exports.PasswordResetTokenSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
const schema_registry_1 = require("../config/schema-registry");
// User table schema - automatically creates 'users' table
exports.UserSchema = (0, schema_registry_1.registerTable)("users", zod_1.z.object({
    email: zod_1.z.string().email(),
    passwordHash: zod_1.z.string(),
    fullName: zod_1.z.string().optional(),
    twoFactorSecret: zod_1.z.string().optional(),
    twoFactorEnabled: zod_1.z.boolean().default(false),
}), {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
        email: { unique: true },
    },
});
// Password reset tokens table
exports.PasswordResetTokenSchema = (0, schema_registry_1.registerTable)("password_reset_tokens", zod_1.z.object({
    userId: zod_1.z.string().uuid(),
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
    userId: zod_1.z.string().uuid(),
    codeHash: zod_1.z.string(),
    usedAt: zod_1.z.date().optional(),
}), {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
        userId: { references: { table: "users", column: "id" } },
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
// Public user schema for API responses (excludes sensitive fields)
exports.PublicUserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    fullName: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
//# sourceMappingURL=auth.schema.js.map