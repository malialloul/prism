import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { UserDto } from './models/UserDto';
import type { SharePermissions } from './models/SharedAccountDto';
import { DEFAULT_SHARE_PERMISSIONS } from './models/SharedAccountDto';
import { ROUTES } from '../constants';

type ApiResponseStatus = 'success' | 'error' | 'fail';

interface ApiErrorResponseDto {
  status: ApiResponseStatus;
  message: string;
}

interface ApiResponse {
  status: ApiResponseStatus;
  message: string;
  data?: unknown;
}

// Token payload interface for shared access
interface TokenPayload {
  userId: string;
  email: string;
  fullName?: string;
  isSharedAccess?: boolean;
  shareId?: number;
  sharedWithEmail?: string;
  permissions?: SharePermissions;
}

// Cookie utilities
const TOKEN_COOKIE_NAME = 'auth_token';

export const setAuthToken = (token: string, rememberMe: boolean = false): void => {
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined; // 30 days if remember me
  const cookieValue = `${TOKEN_COOKIE_NAME}=${token}; path=/; SameSite=Strict${maxAge ? `; max-age=${maxAge}` : ''}`;
  document.cookie = cookieValue;
};

export const getAuthToken = (): string | null => {
  const match = document.cookie.match(new RegExp(`(^| )${TOKEN_COOKIE_NAME}=([^;]+)`));
  return match ? match[2] : null;
};

export const clearAuthToken = (): void => {
  // Clear with multiple variations to ensure removal regardless of how it was set
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0`;
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`;
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
};

/**
 * Decode the JWT token and return the payload
 */
const decodeToken = (): TokenPayload | null => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const base64Payload = token.split('.')[1];
    return JSON.parse(atob(base64Payload));
  } catch {
    return null;
  }
};

/**
 * Get permissions from the JWT token
 * Note: Backend always validates against the database for actual enforcement
 */
const getTokenPermissions = (): SharePermissions | undefined => {
  const payload = decodeToken();
  return payload?.permissions;
};

export const getUserFromToken = (): Pick<UserDto, 'id' | 'email' | 'fullName'> | null => {
  const payload = decodeToken();
  if (!payload) return null;

  return {
    id: payload.userId,
    email: payload.email,
    fullName: payload.fullName,
  };
};

/**
 * Check if current session is a shared access session
 */
export const isSharedAccessSession = (): boolean => {
  const payload = decodeToken();
  return payload?.isSharedAccess === true;
};

/**
 * Get shared access info from token
 */
export const getSharedAccessInfo = (): { shareId: number; sharedWithEmail: string; permissions: SharePermissions } | null => {
  const payload = decodeToken();
  if (!payload?.isSharedAccess) return null;

  return {
    shareId: payload.shareId!,
    sharedWithEmail: payload.sharedWithEmail!,
    permissions: getTokenPermissions() || DEFAULT_SHARE_PERMISSIONS,
  };
};

/**
 * Check if shared user has specific permission (based on JWT token)
 * Returns true for account owners (non-shared access)
 * Note: Backend always validates against the database for actual enforcement
 */
export const hasPermission = (permission: keyof SharePermissions): boolean => {
  const payload = decodeToken();
  // Account owners have full access
  if (!payload?.isSharedAccess) return true;
  // Check permissions from token
  const permissions = getTokenPermissions();
  return permissions?.[permission] ?? false;
};

/**
 * Configured axios instance with interceptors
 */
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token from cookie
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle all responses globally
httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Don't auto-show toasts here - let components handle their own toasts
    // This prevents duplicate toasts when components also show toasts
    return response;
  },
  (error: AxiosError<ApiErrorResponseDto>) => {
    // Don't auto-show error toasts here - let components handle their own error toasts
    // Only handle 401 redirect
    
    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      clearAuthToken();
      
      if (!window.location.pathname.includes(ROUTES.SIGN_IN) && 
          !window.location.pathname.includes(ROUTES.SIGN_UP) &&
          !window.location.pathname.includes(ROUTES.SHARED_LOGIN)) {
        window.location.href = ROUTES.SIGN_IN;
      }
    }

    return Promise.reject(error);
  }
);

export { httpClient };
