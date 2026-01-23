/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Authentication response with token
 */
export type AuthResponseDto = {
    status: AuthResponseDto.status;
    message: string;
    data?: {
        token: string;
    };
};
export namespace AuthResponseDto {
    export enum status {
        SUCCESS = 'success',
        ERROR = 'error',
        FAIL = 'fail',
    }
}

