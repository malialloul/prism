/**
 * API Response status type
 */
export type ApiResponseStatus = 'success' | 'error' | 'fail';
/**
 * Base API Response type - all responses should follow this structure
 */
export interface ApiResponseDto<T = unknown> {
    status: ApiResponseStatus;
    message: string;
    data?: T;
}
/**
 * API Error Response type
 */
export interface ApiErrorResponseDto {
    status: 'error' | 'fail';
    message: string;
    code: string;
    statusCode: number;
    requestUrl: string;
    body?: unknown;
}
/**
 * Custom API Error class for handling application errors
 */
export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, code?: string, isOperational?: boolean);
    toJSON(requestUrl: string, body?: unknown): ApiErrorResponseDto;
}
/**
 * Validation Error - 400 Bad Request
 */
export declare class ValidationError extends ApiError {
    constructor(message: string);
}
/**
 * Authentication Error - 401 Unauthorized
 */
export declare class AuthenticationError extends ApiError {
    constructor(message?: string);
}
/**
 * Authorization Error - 403 Forbidden
 */
export declare class AuthorizationError extends ApiError {
    constructor(message?: string);
}
/**
 * Not Found Error - 404
 */
export declare class NotFoundError extends ApiError {
    constructor(message?: string);
}
/**
 * Conflict Error - 409 (e.g., duplicate email)
 */
export declare class ConflictError extends ApiError {
    constructor(message?: string);
}
/**
 * Internal Server Error - 500
 */
export declare class InternalServerError extends ApiError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map