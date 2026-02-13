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
  warning?: string;
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
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(requestUrl: string, body?: unknown): ApiErrorResponseDto {
    return {
      status: this.statusCode >= 500 ? 'error' : 'fail',
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      requestUrl,
      body,
    };
  }
}

/**
 * Validation Error - 400 Bad Request
 */
export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Authentication Error - 401 Unauthorized
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization Error - 403 Forbidden
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not Found Error - 404
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Conflict Error - 409 (e.g., duplicate email)
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Internal Server Error - 500
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR', false);
  }
}
