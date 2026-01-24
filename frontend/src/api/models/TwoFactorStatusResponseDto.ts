/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 2FA status response
 */
export type TwoFactorStatusResponseDto = {
    status: TwoFactorStatusResponseDto.status;
    message: string;
    data?: {
        enabled: boolean;
    };
};
export namespace TwoFactorStatusResponseDto {
    export enum status {
        SUCCESS = 'success',
        ERROR = 'error',
        FAIL = 'fail',
    }
}

