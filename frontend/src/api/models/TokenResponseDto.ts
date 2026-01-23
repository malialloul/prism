/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * JWT token response
 */
export type TokenResponseDto = {
    status: TokenResponseDto.status;
    message: string;
    data?: {
        token: string;
    };
};
export namespace TokenResponseDto {
    export enum status {
        SUCCESS = 'success',
        ERROR = 'error',
        FAIL = 'fail',
    }
}

