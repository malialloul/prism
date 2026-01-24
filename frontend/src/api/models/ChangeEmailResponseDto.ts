/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Change email response with new token
 */
export type ChangeEmailResponseDto = {
    status: ChangeEmailResponseDto.status;
    message: string;
    data?: {
        token: string;
    };
};
export namespace ChangeEmailResponseDto {
    export enum status {
        SUCCESS = 'success',
        ERROR = 'error',
        FAIL = 'fail',
    }
}

