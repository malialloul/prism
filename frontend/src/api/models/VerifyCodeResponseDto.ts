/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Verify code response
 */
export type VerifyCodeResponseDto = {
    status: VerifyCodeResponseDto.status;
    message: string;
    data?: {
        valid: boolean;
    };
};
export namespace VerifyCodeResponseDto {
    export enum status {
        SUCCESS = 'success',
        ERROR = 'error',
        FAIL = 'fail',
    }
}

