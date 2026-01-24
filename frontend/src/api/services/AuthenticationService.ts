/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponseDto } from '../models/AuthResponseDto';
import type { ChangeEmailDto } from '../models/ChangeEmailDto';
import type { ChangeEmailResponseDto } from '../models/ChangeEmailResponseDto';
import type { ChangePasswordDto } from '../models/ChangePasswordDto';
import type { ForgotPasswordDto } from '../models/ForgotPasswordDto';
import type { Login2FADto } from '../models/Login2FADto';
import type { LoginDto } from '../models/LoginDto';
import type { PasswordActionResponseDto } from '../models/PasswordActionResponseDto';
import type { ResetPasswordDto } from '../models/ResetPasswordDto';
import type { SignupDto } from '../models/SignupDto';
import type { TokenResponseDto } from '../models/TokenResponseDto';
import type { VerifyCodeResponseDto } from '../models/VerifyCodeResponseDto';
import type { VerifyResetCodeDto } from '../models/VerifyResetCodeDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Create a new user account
     * @param requestBody
     * @returns AuthResponseDto User created successfully
     * @throws ApiError
     */
    public static postAuthSignup(
        requestBody?: SignupDto,
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                409: `User already exists`,
            },
        });
    }
    /**
     * Authenticate user and get JWT token
     * @param requestBody
     * @returns TokenResponseDto Login successful
     * @throws ApiError
     */
    public static postAuthLogin(
        requestBody?: LoginDto,
    ): CancelablePromise<TokenResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
            },
        });
    }
    /**
     * Request password reset code
     * @param requestBody
     * @returns PasswordActionResponseDto Reset code sent if email exists
     * @throws ApiError
     */
    public static postAuthForgotPassword(
        requestBody?: ForgotPasswordDto,
    ): CancelablePromise<PasswordActionResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Verify password reset code
     * @param requestBody
     * @returns VerifyCodeResponseDto Code verification result
     * @throws ApiError
     */
    public static postAuthVerifyResetCode(
        requestBody?: VerifyResetCodeDto,
    ): CancelablePromise<VerifyCodeResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/verify-reset-code',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Reset password with valid code
     * @param requestBody
     * @returns PasswordActionResponseDto Password reset successfully
     * @throws ApiError
     */
    public static postAuthResetPassword(
        requestBody?: ResetPasswordDto,
    ): CancelablePromise<PasswordActionResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid or expired code`,
            },
        });
    }
    /**
     * Change password for authenticated user
     * @param requestBody
     * @returns PasswordActionResponseDto Password changed successfully
     * @throws ApiError
     */
    public static postAuthChangePassword(
        requestBody?: ChangePasswordDto,
    ): CancelablePromise<PasswordActionResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/change-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized or incorrect current password`,
            },
        });
    }
    /**
     * Change email for authenticated user
     * @param requestBody
     * @returns ChangeEmailResponseDto Email changed successfully, returns new token
     * @throws ApiError
     */
    public static postAuthChangeEmail(
        requestBody?: ChangeEmailDto,
    ): CancelablePromise<ChangeEmailResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/change-email',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized or incorrect password`,
                409: `Email already exists`,
            },
        });
    }
    /**
     * Complete login with 2FA code
     * @param requestBody
     * @returns TokenResponseDto Login successful
     * @throws ApiError
     */
    public static postAuthLogin2Fa(
        requestBody?: Login2FADto,
    ): CancelablePromise<TokenResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login/2fa',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid verification code`,
                401: `Invalid or expired session`,
            },
        });
    }
}
