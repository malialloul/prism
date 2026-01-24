"use strict";
// src/modules/logs/logs.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.logClientError = void 0;
const uuid_1 = require("uuid");
/**
 * Log client error to storage/monitoring service
 * In production, this would send to a service like Sentry, LogRocket, or a database
 */
const logClientError = async (error) => {
    const logId = (0, uuid_1.v4)();
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
exports.logClientError = logClientError;
//# sourceMappingURL=logs.service.js.map