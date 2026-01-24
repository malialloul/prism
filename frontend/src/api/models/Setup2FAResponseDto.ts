/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 2FA setup response with QR code
 */
export type Setup2FAResponseDto = {
    status: Setup2FAResponseDto.status;
    message: string;
    data?: {
        qrCode: string;
        secret: string;
    };
};
export namespace Setup2FAResponseDto {
    export enum status {
        SUCCESS = 'success',
        ERROR = 'error',
        FAIL = 'fail',
    }
}

