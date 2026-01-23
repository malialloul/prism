/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseStatus } from './ApiResponseStatus';
import type { AuthDataDto } from './AuthDataDto';
/**
 * Login response
 */
export type LoginResponseDto = {
    status: ApiResponseStatus;
    message: string;
    data?: AuthDataDto;
};

