import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
/**
 * Global error handling middleware
 */
export declare const errorHandler: (err: ApiError | Error, req: Request, res: Response, _next: NextFunction) => void;
/**
 * Async handler wrapper to catch errors in async route handlers
 */
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map