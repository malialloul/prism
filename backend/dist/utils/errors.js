"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ApiError = void 0;
/**
 * Custom API Error class for handling application errors
 */
class ApiError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON(requestUrl, body) {
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
exports.ApiError = ApiError;
/**
 * Validation Error - 400 Bad Request
 */
class ValidationError extends ApiError {
    constructor(message) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}
exports.ValidationError = ValidationError;
/**
 * Authentication Error - 401 Unauthorized
 */
class AuthenticationError extends ApiError {
    constructor(message = 'Invalid credentials') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Authorization Error - 403 Forbidden
 */
class AuthorizationError extends ApiError {
    constructor(message = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Not Found Error - 404
 */
class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Conflict Error - 409 (e.g., duplicate email)
 */
class ConflictError extends ApiError {
    constructor(message = 'Resource already exists') {
        super(message, 409, 'CONFLICT');
    }
}
exports.ConflictError = ConflictError;
/**
 * Internal Server Error - 500
 */
class InternalServerError extends ApiError {
    constructor(message = 'Internal server error') {
        super(message, 500, 'INTERNAL_ERROR', false);
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=errors.js.map