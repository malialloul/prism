import { Request, Response, NextFunction } from 'express';
import { ApiError, InternalServerError } from '../utils/errors';
import type { ApiErrorResponseDto } from '../utils/errors';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Convert to ApiError if it's a regular Error
  const apiError = err instanceof ApiError 
    ? err 
    : new InternalServerError(err.message);

  const response: ApiErrorResponseDto = apiError.toJSON(req.originalUrl, req.body);

  console.error(`[${apiError.code}] ${apiError.message}`, {
    statusCode: apiError.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(apiError.statusCode).json(response);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
