/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClientErrorDto } from '../models/ClientErrorDto';
import type { LogResponseDto } from '../models/LogResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LogsService {
    /**
     * Log client-side error
     * @param requestBody
     * @returns LogResponseDto Error logged successfully
     * @throws ApiError
     */
    public static postLogsError(
        requestBody?: ClientErrorDto,
    ): CancelablePromise<LogResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/logs/error',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
