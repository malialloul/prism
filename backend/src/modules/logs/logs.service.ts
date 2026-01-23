// src/modules/logs/logs.service.ts

import { ClientErrorDto } from './logs.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Log client error to storage/monitoring service
 * In production, this would send to a service like Sentry, LogRocket, or a database
 */
export const logClientError = async (error: ClientErrorDto): Promise<string> => {
  const logId = uuidv4();
  
  // Log to console (in production, send to monitoring service)
  console.error(`[CLIENT_ERROR] [${logId}]`, {
    message: error.message,
    stack: error.stack,
    componentStack: error.componentStack,
    url: error.url,
    userAgent: error.userAgent,
    timestamp: error.timestamp,
  });

  // TODO: In production, persist to database or send to monitoring service
  // await pool.query(
  //   'INSERT INTO error_logs (id, message, stack, url, user_agent, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
  //   [logId, error.message, error.stack, error.url, error.userAgent, error.timestamp]
  // );

  return logId;
};
