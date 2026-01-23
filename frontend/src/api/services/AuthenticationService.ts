/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginDto } from '../models/LoginDto';
import type { LoginResponseDto } from '../models/LoginResponseDto';
import type { SignupDto } from '../models/SignupDto';
import type { SignupResponseDto } from '../models/SignupResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Create a new user account
     * @param requestBody
     * @returns SignupResponseDto User created successfully
     * @throws ApiError
     */
    public static postAuthSignup(
        requestBody?: SignupDto,
    ): CancelablePromise<SignupResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Authenticate user and get JWT token
     * @param requestBody
     * @returns LoginResponseDto Login successful
     * @throws ApiError
     */
    public static postAuthLogin(
        requestBody?: LoginDto,
    ): CancelablePromise<LoginResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
