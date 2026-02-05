import { z } from "zod";
export declare const UserSchema: z.ZodObject<{
    email: z.ZodString;
    passwordHash: z.ZodString;
    fullName: z.ZodOptional<z.ZodString>;
    twoFactorSecret: z.ZodOptional<z.ZodString>;
    twoFactorEnabled: z.ZodDefault<z.ZodBoolean>;
    deactivatedAt: z.ZodOptional<z.ZodDate>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    email: string;
    passwordHash: string;
    twoFactorEnabled: boolean;
    fullName?: string | undefined;
    twoFactorSecret?: string | undefined;
    deactivatedAt?: Date | undefined;
}, {
    email: string;
    passwordHash: string;
    fullName?: string | undefined;
    twoFactorSecret?: string | undefined;
    twoFactorEnabled?: boolean | undefined;
    deactivatedAt?: Date | undefined;
}>;
export declare const PasswordResetTokenSchema: z.ZodObject<{
    userId: z.ZodNumber;
    token: z.ZodString;
    expiresAt: z.ZodDate;
    usedAt: z.ZodOptional<z.ZodDate>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    token: string;
    userId: number;
    expiresAt: Date;
    usedAt?: Date | undefined;
}, {
    token: string;
    userId: number;
    expiresAt: Date;
    usedAt?: Date | undefined;
}>;
export declare const BackupCodeSchema: z.ZodObject<{
    userId: z.ZodNumber;
    codeHash: z.ZodString;
    usedAt: z.ZodOptional<z.ZodDate>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    userId: number;
    codeHash: string;
    usedAt?: Date | undefined;
}, {
    userId: number;
    codeHash: string;
    usedAt?: Date | undefined;
}>;
export declare const SharedAccountSchema: z.ZodObject<{
    ownerUserId: z.ZodNumber;
    sharedWithEmail: z.ZodString;
    sharedWithUserId: z.ZodOptional<z.ZodNumber>;
    tempPasswordHash: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "accepted", "revoked"]>>;
    permissions: z.ZodDefault<z.ZodString>;
    expiresAt: z.ZodDate;
    acceptedAt: z.ZodOptional<z.ZodDate>;
    revokedAt: z.ZodOptional<z.ZodDate>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    permissions: string;
    status: "pending" | "accepted" | "revoked";
    sharedWithEmail: string;
    expiresAt: Date;
    ownerUserId: number;
    tempPasswordHash: string;
    sharedWithUserId?: number | undefined;
    acceptedAt?: Date | undefined;
    revokedAt?: Date | undefined;
}, {
    sharedWithEmail: string;
    expiresAt: Date;
    ownerUserId: number;
    tempPasswordHash: string;
    permissions?: string | undefined;
    status?: "pending" | "accepted" | "revoked" | undefined;
    sharedWithUserId?: number | undefined;
    acceptedAt?: Date | undefined;
    revokedAt?: Date | undefined;
}>;
export declare const NotificationSchema: z.ZodObject<{
    userId: z.ZodNumber;
    type: z.ZodEnum<["account_shared", "share_accepted", "share_revoked", "permissions_updated", "permission_request", "request_approved", "request_rejected", "general"]>;
    title: z.ZodString;
    message: z.ZodString;
    metadata: z.ZodOptional<z.ZodString>;
    readAt: z.ZodOptional<z.ZodDate>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    message: string;
    userId: number;
    type: "account_shared" | "share_accepted" | "share_revoked" | "permissions_updated" | "permission_request" | "request_approved" | "request_rejected" | "general";
    title: string;
    metadata?: string | undefined;
    readAt?: Date | undefined;
}, {
    message: string;
    userId: number;
    type: "account_shared" | "share_accepted" | "share_revoked" | "permissions_updated" | "permission_request" | "request_approved" | "request_rejected" | "general";
    title: string;
    metadata?: string | undefined;
    readAt?: Date | undefined;
}>;
export declare const PermissionRequestSchema: z.ZodObject<{
    shareId: z.ZodNumber;
    requestedBy: z.ZodNumber;
    ownerUserId: z.ZodNumber;
    permission: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "approved", "rejected"]>>;
    message: z.ZodOptional<z.ZodString>;
    responseMessage: z.ZodOptional<z.ZodString>;
    respondedAt: z.ZodOptional<z.ZodDate>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    shareId: number;
    status: "pending" | "approved" | "rejected";
    permission: string;
    ownerUserId: number;
    requestedBy: number;
    message?: string | undefined;
    responseMessage?: string | undefined;
    respondedAt?: Date | undefined;
}, {
    shareId: number;
    permission: string;
    ownerUserId: number;
    requestedBy: number;
    message?: string | undefined;
    status?: "pending" | "approved" | "rejected" | undefined;
    responseMessage?: string | undefined;
    respondedAt?: Date | undefined;
}>;
export declare const SignupSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName?: string | undefined;
}, {
    email: string;
    password: string;
    fullName?: string | undefined;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const VerifyResetCodeSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    code: string;
}, {
    email: string;
    code: string;
}>;
export declare const ResetPasswordSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    code: string;
    newPassword: string;
}, {
    email: string;
    code: string;
    newPassword: string;
}>;
export declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newPassword: string;
    currentPassword: string;
}, {
    newPassword: string;
    currentPassword: string;
}>;
export declare const ChangeEmailSchema: z.ZodObject<{
    newEmail: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    newEmail: string;
}, {
    password: string;
    newEmail: string;
}>;
export declare const Setup2FASchema: z.ZodObject<{
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
}, {
    password: string;
}>;
export declare const Verify2FASchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
export declare const Disable2FASchema: z.ZodObject<{
    password: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    code: string;
}, {
    password: string;
    code: string;
}>;
export declare const Login2FASchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
    tempToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    tempToken: string;
    code: string;
}, {
    email: string;
    tempToken: string;
    code: string;
}>;
export declare const ShareAccountSchema: z.ZodObject<{
    email: z.ZodString;
    expiresInDays: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    email: string;
    expiresInDays: number;
}, {
    email: string;
    expiresInDays?: number | undefined;
}>;
export declare const AcceptShareSchema: z.ZodObject<{
    shareId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    shareId: number;
}, {
    shareId: number;
}>;
export declare const RevokeShareSchema: z.ZodObject<{
    shareId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    shareId: number;
}, {
    shareId: number;
}>;
export declare const SharedLoginSchema: z.ZodObject<{
    ownerEmail: z.ZodString;
    tempPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ownerEmail: string;
    tempPassword: string;
}, {
    ownerEmail: string;
    tempPassword: string;
}>;
export declare const PublicUserSchema: z.ZodObject<{
    id: z.ZodNumber;
    email: z.ZodString;
    fullName: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    email: string;
    id: number;
    createdAt: Date;
    updatedAt: Date;
    fullName?: string | undefined;
}, {
    email: string;
    id: number;
    createdAt: Date;
    updatedAt: Date;
    fullName?: string | undefined;
}>;
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
//# sourceMappingURL=auth.schema.d.ts.map