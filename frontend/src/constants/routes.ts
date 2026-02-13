/**
 * Application route constants
 * Use these constants instead of hardcoded path strings
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  SHARED_LOGIN: '/shared-login',
  FORGOT_PASSWORD: '/forgot-password',
  CHANGE_PASSWORD: '/change-password',
  OAUTH_CALLBACK: '/oauth/callback',

  // Protected routes
  SETTINGS: '/settings',
  FEEDBACK: '/feedback',
  LIMITS: '/limits',

  // Dashboard routes
  DASHBOARD: {
    ROOT: '/dashboard',
    OVERVIEW: '/dashboard/overview',
    SCHEMA: '/dashboard/schema',
    QUERY: '/dashboard/query',
    ER_DIAGRAM: '/dashboard/er-diagram',
  },

  // APIs routes
  APIS: {
    ROOT: '/apis',
    BUILD: '/apis/build',
    AUTO: '/apis/auto',
    OPENAPI: '/apis/openapi',
  },
} as const;

// Helper type for route values
export type RouteValue = typeof ROUTES[keyof typeof ROUTES] | string;
