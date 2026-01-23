/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { Login } from '../models/Login';
import type { Signup } from '../models/Signup';
import type { TokenResponse } from '../models/TokenResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Create a new user account
     * @param requestBody
     * @returns AuthResponse User created successfully
     * @throws ApiError
     */
    public static postAuthSignup(
        requestBody?: Signup,
    ): CancelablePromise<AuthResponse> {
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
     * @returns TokenResponse Login successful
     * @throws ApiError
     */
    public static postAuthLogin(
        requestBody?: Login,
    ): CancelablePromise<TokenResponse> {
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
}
