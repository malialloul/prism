import { httpClient } from '../api/httpClient';

interface ClientErrorDto {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

/**
 * Send error to backend logging service
 * Silently fails to avoid cascading errors
 */
export const logErrorToService = async (
  error: Error,
  componentStack?: string
): Promise<void> => {
  // Don't log in development
  if (import.meta.env.DEV) {
    return;
  }

  const payload: ClientErrorDto = {
    message: error.message,
    stack: error.stack,
    componentStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  try {
    await httpClient.post('/logs/error', payload);
  } catch {
    // Silently fail - don't cause more errors when logging errors
    console.error('Failed to log error to service');
  }
};

export default logErrorToService;
