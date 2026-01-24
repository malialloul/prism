/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Login response when 2FA is required
 */
export type Login2FARequiredResponseDto = {
    status: Login2FARequiredResponseDto.status;
    message: string;
    data?: {
        requires2FA: boolean;
        tempToken: string;
        email: string;
    };
};
export namespace Login2FARequiredResponseDto {
    export enum status {
        SUCCESS = 'success',
        ERROR = 'error',
        FAIL = 'fail',
    }
}

