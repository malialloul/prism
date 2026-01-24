import { z } from "zod";
export declare const UserSchema: z.ZodObject<{
    email: z.ZodString;
    passwordHash: z.ZodString;
    fullName: z.ZodOptional<z.ZodString>;
    twoFactorSecret: z.ZodOptional<z.ZodString>;
    twoFactorEnabled: z.ZodDefault<z.ZodBoolean>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    email: string;
    passwordHash: string;
    twoFactorEnabled: boolean;
    fullName?: string | undefined;
    twoFactorSecret?: string | undefined;
}, {
    email: string;
    passwordHash: string;
    fullName?: string | undefined;
    twoFactorSecret?: string | undefined;
    twoFactorEnabled?: boolean | undefined;
}>;
export declare const PasswordResetTokenSchema: z.ZodObject<{
    userId: z.ZodString;
    token: z.ZodString;
    expiresAt: z.ZodDate;
    usedAt: z.ZodOptional<z.ZodDate>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    userId: string;
    token: string;
    expiresAt: Date;
    usedAt?: Date | undefined;
}, {
    userId: string;
    token: string;
    expiresAt: Date;
    usedAt?: Date | undefined;
}>;
export declare const BackupCodeSchema: z.ZodObject<{
    userId: z.ZodString;
    codeHash: z.ZodString;
    usedAt: z.ZodOptional<z.ZodDate>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    userId: string;
    codeHash: string;
    usedAt?: Date | undefined;
}, {
    userId: string;
    codeHash: string;
    usedAt?: Date | undefined;
}>;
export declare const SignupSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    fullName?: string | undefined;
}, {
    password: string;
    email: string;
    fullName?: string | undefined;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
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
export declare const PublicUserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    fullName: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    email: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    fullName?: string | undefined;
}, {
    email: string;
    id: string;
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
//# sourceMappingURL=auth.schema.d.ts.map