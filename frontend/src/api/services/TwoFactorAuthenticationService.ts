/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Disable2FADto } from '../models/Disable2FADto';
import type { PasswordActionResponseDto } from '../models/PasswordActionResponseDto';
import type { Setup2FADto } from '../models/Setup2FADto';
import type { Setup2FAResponseDto } from '../models/Setup2FAResponseDto';
import type { TwoFactorStatusResponseDto } from '../models/TwoFactorStatusResponseDto';
import type { Verify2FADto } from '../models/Verify2FADto';
import type { Verify2FAResponseDto } from '../models/Verify2FAResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TwoFactorAuthenticationService {
    /**
     * Get 2FA status for authenticated user
     * @returns TwoFactorStatusResponseDto 2FA status retrieved
     * @throws ApiError
     */
    public static getAuth2FaStatus(): CancelablePromise<TwoFactorStatusResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/2fa/status',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Setup 2FA for authenticated user
     * @param requestBody
     * @returns Setup2FAResponseDto 2FA setup initiated, returns QR code
     * @throws ApiError
     */
    public static postAuth2FaSetup(
        requestBody?: Setup2FADto,
    ): CancelablePromise<Setup2FAResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/2fa/setup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `2FA already enabled or invalid password`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Verify 2FA code and enable 2FA
     * @param requestBody
     * @returns Verify2FAResponseDto 2FA enabled successfully, returns backup codes
     * @throws ApiError
     */
    public static postAuth2FaVerify(
        requestBody?: Verify2FADto,
    ): CancelablePromise<Verify2FAResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/2fa/verify',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid verification code`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Disable 2FA for authenticated user
     * @param requestBody
     * @returns PasswordActionResponseDto 2FA disabled successfully
     * @throws ApiError
     */
    public static postAuth2FaDisable(
        requestBody?: Disable2FADto,
    ): CancelablePromise<PasswordActionResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/2fa/disable',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid password or code`,
                401: `Unauthorized`,
            },
        });
    }
}
