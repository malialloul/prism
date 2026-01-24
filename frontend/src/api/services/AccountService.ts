/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeactivateAccountDto } from '../models/DeactivateAccountDto';
import type { DeleteAccountDto } from '../models/DeleteAccountDto';
import type { PasswordActionResponseDto } from '../models/PasswordActionResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AccountService {
    /**
     * Deactivate user account temporarily
     * @param requestBody
     * @returns PasswordActionResponseDto Account deactivated successfully
     * @throws ApiError
     */
    public static postAuthAccountDeactivate(
        requestBody?: DeactivateAccountDto,
    ): CancelablePromise<PasswordActionResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/account/deactivate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized or incorrect password`,
                400: `Account already deactivated`,
            },
        });
    }

    /**
     * Delete user account permanently
     * @param requestBody
     * @returns PasswordActionResponseDto Account deleted successfully
     * @throws ApiError
     */
    public static postAuthAccountDelete(
        requestBody?: DeleteAccountDto,
    ): CancelablePromise<PasswordActionResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/account/delete',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized or incorrect password`,
                400: `Invalid confirmation text`,
            },
        });
    }
}
