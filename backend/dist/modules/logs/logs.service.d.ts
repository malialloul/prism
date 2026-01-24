import { ClientErrorDto } from './logs.types';
/**
 * Log client error to storage/monitoring service
 * In production, this would send to a service like Sentry, LogRocket, or a database
 */
export declare const logClientError: (error: ClientErrorDto) => Promise<string>;
//# sourceMappingURL=logs.service.d.ts.map