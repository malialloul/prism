import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiErrorResponseDto } from './models/ApiErrorResponseDto';
import type { ApiResponseStatus } from './models/ApiResponseStatus';
import { toastService } from '../services/toastService';

interface ApiResponse {
  status: ApiResponseStatus;
  message: string;
  data?: unknown;
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
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0`;
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
    toastService.error('Request failed');
    return Promise.reject(error);
  }
);

// Response interceptor - handle all responses globally
httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Show toast based on response status
    const { status, message } = response.data || {};
    
    if (status === 'success' && message) {
      toastService.success(message);
    } else if (status === 'fail' && message) {
      toastService.warning(message);
    } else if (status === 'error' && message) {
      toastService.error(message);
    }

    return response;
  },
  (error: AxiosError<ApiErrorResponseDto>) => {
    // Show error toast from error response
    const { status, message } = error.response?.data || {};
    const errorMessage = message || error.message || 'An error occurred';
    
    if (status === 'fail') {
      toastService.warning(errorMessage);
    } else {
      toastService.error(errorMessage);
    }

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
