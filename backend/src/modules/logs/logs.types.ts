// src/modules/logs/logs.types.ts

export interface ClientErrorDto {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

export interface LogResponseDto {
  success: boolean;
  id: string;
}
