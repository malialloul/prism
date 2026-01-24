/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 2FA verification response with backup codes
 */
export type Verify2FAResponseDto = {
    status: Verify2FAResponseDto.status;
    message: string;
    data?: {
        backupCodes: Array<string>;
    };
};
export namespace Verify2FAResponseDto {
    export enum status {
        SUCCESS = 'success',
        ERROR = 'error',
        FAIL = 'fail',
    }
}

