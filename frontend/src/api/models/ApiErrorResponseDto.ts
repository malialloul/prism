/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseStatus } from './ApiResponseStatus';
/**
 * API error response
 */
export type ApiErrorResponseDto = {
    status: ApiResponseStatus;
    message: string;
    code: string;
    statusCode: number;
    requestUrl: string;
    body?: Record<string, any>;
};

