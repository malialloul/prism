// src/modules/logs/logs.controller.ts

import { Request, Response, NextFunction } from 'express';
import { logClientError } from './logs.service';
import { ClientErrorDto, LogResponseDto } from './logs.types';
import { asyncHandler } from '../../middleware/errorHandler';

export const logErrorHandler = asyncHandler(async (
  req: Request<{}, {}, ClientErrorDto>,
  res: Response<LogResponseDto>,
  _next: NextFunction,
) => {
  const logId = await logClientError(req.body);
  
  res.status(201).json({
    success: true,
    id: logId,
  });
});
