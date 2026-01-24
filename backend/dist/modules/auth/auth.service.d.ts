import type { SignupDto, LoginDto, ForgotPasswordDto, VerifyResetCodeDto, ResetPasswordDto, ChangePasswordDto, ChangeEmailDto, Setup2FADto, Verify2FADto, Disable2FADto, Login2FADto, TokenResponseDto, TwoFactorRequiredDto, VerifyCodeResultDto, Setup2FAResultDto, Verify2FAResultDto, TwoFactorStatusDto, ChangeEmailResultDto, MessageResponseDto } from './auth.types';
export declare const signupService: (body: SignupDto) => Promise<TokenResponseDto>;
export declare const loginService: (body: LoginDto) => Promise<TokenResponseDto | TwoFactorRequiredDto>;
/**
 * Request password reset - sends OTP to email
 */
export declare const forgotPasswordService: (body: ForgotPasswordDto) => Promise<MessageResponseDto>;
/**
 * Verify reset code is valid
 */
export declare const verifyResetCodeService: (body: VerifyResetCodeDto) => Promise<VerifyCodeResultDto>;
/**
 * Reset password with valid code
 */
export declare const resetPasswordService: (body: ResetPasswordDto) => Promise<MessageResponseDto>;
/**
 * Change password for authenticated user
 */
export declare const changePasswordService: (userId: string, body: ChangePasswordDto) => Promise<MessageResponseDto>;
/**
 * Change email for authenticated user
 */
export declare const changeEmailService: (userId: string, body: ChangeEmailDto) => Promise<ChangeEmailResultDto>;
/**
 * Get 2FA status for authenticated user
 */
export declare const get2FAStatusService: (userId: string) => Promise<TwoFactorStatusDto>;
/**
 * Setup 2FA for authenticated user - generates secret and QR code
 */
export declare const setup2FAService: (userId: string, body: Setup2FADto) => Promise<Setup2FAResultDto>;
/**
 * Verify 2FA code and enable 2FA
 */
export declare const verify2FAService: (userId: string, body: Verify2FADto) => Promise<Verify2FAResultDto>;
/**
 * Disable 2FA for authenticated user
 */
export declare const disable2FAService: (userId: string, body: Disable2FADto) => Promise<MessageResponseDto>;
/**
 * Verify 2FA code during login
 */
export declare const login2FAService: (body: Login2FADto) => Promise<TokenResponseDto>;
//# sourceMappingURL=auth.service.d.ts.map