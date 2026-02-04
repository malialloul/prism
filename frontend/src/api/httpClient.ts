import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { UserDto } from './models/UserDto';
import type { SharePermissions } from './models/SharedAccountDto';
import { DEFAULT_SHARE_PERMISSIONS } from './models/SharedAccountDto';

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
// Storage key for runtime permission overrides (updated via WebSocket)
const PERMISSIONS_OVERRIDE_KEY = 'shared_permissions_override';

// Subscribers for permission updates
type PermissionUpdateCallback = () => void;
const permissionSubscribers = new Set<PermissionUpdateCallback>();

/**
 * Subscribe to permission updates. Returns unsubscribe function.
 */
export const onPermissionsChange = (callback: PermissionUpdateCallback): (() => void) => {
  permissionSubscribers.add(callback);
  return () => permissionSubscribers.delete(callback);
};

const notifyPermissionSubscribers = (): void => {
  permissionSubscribers.forEach(cb => cb());
};

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
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0`;
  // Also clear any permissions override
  localStorage.removeItem(PERMISSIONS_OVERRIDE_KEY);
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
 * Update permissions at runtime (called when WebSocket receives permissions_updated)
 */
export const updateSharedPermissions = (permissions: SharePermissions): void => {
  localStorage.setItem(PERMISSIONS_OVERRIDE_KEY, JSON.stringify(permissions));
  // Notify all subscribers
  notifyPermissionSubscribers();
};

/**
 * Clear the permissions override (called on logout)
 */
export const clearPermissionsOverride = (): void => {
  localStorage.removeItem(PERMISSIONS_OVERRIDE_KEY);
};

/**
 * Get the current effective permissions (override takes precedence over token)
 */
const getEffectivePermissions = (): SharePermissions | undefined => {
  // Check for runtime override first
  const override = localStorage.getItem(PERMISSIONS_OVERRIDE_KEY);
  if (override) {
    try {
      return JSON.parse(override);
    } catch {
      // Invalid JSON, fall through to token
    }
  }
  // Fall back to token permissions
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
    permissions: getEffectivePermissions() || DEFAULT_SHARE_PERMISSIONS,
  };
};

/**
 * Check if shared user has specific permission
 * Returns true for account owners (non-shared access)
 */
export const hasPermission = (permission: keyof SharePermissions): boolean => {
  const payload = decodeToken();
  // Account owners have full access
  if (!payload?.isSharedAccess) return true;
  // Check effective permissions (override or token)
  const permissions = getEffectivePermissions();
  return permissions?.[permission] ?? false;
};

/**
 * Configured axios instance with interceptors
 */
const httpClient = axios.create({
  baseURL: 'http://localhost:4000',
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
      
      if (!window.location.pathname.includes('/signin') && 
          !window.location.pathname.includes('/signup')) {
        window.location.href = '/signin';
      }
    }

    return Promise.reject(error);
  }
);

export { httpClient };
