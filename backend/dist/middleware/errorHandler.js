"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, _next) => {
    // Convert to ApiError if it's a regular Error
    const apiError = err instanceof errors_1.ApiError
        ? err
        : new errors_1.InternalServerError(err.message);
    const response = apiError.toJSON(req.originalUrl, req.body);
    console.error(`[${apiError.code}] ${apiError.message}`, {
        statusCode: apiError.statusCode,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    res.status(apiError.statusCode).json(response);
};
exports.errorHandler = errorHandler;
/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map