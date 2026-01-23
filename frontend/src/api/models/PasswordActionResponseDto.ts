/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Password action response
 */
export type PasswordActionResponseDto = {
    status: PasswordActionResponseDto.status;
    message: string;
};
export namespace PasswordActionResponseDto {
    export enum status {
        SUCCESS = 'success',
        ERROR = 'error',
        FAIL = 'fail',
    }
}

