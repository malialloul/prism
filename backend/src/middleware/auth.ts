// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import type { SharePermissions } from '../modules/auth/auth.types';
import { pool } from '../config';
import { validateApiTokenService } from '../modules/auth/auth.service';

export interface JwtPayload {
  userId: string;
  email: string;
  fullName?: string;
  isSharedAccess?: boolean;
  isApiToken?: boolean;
  shareId?: number;
  sharedWithEmail?: string;
  permissions?: SharePermissions;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Check for X-API-Key header first
    const apiKey = req.headers['x-api-key'] as string | undefined;
    if (apiKey && apiKey.startsWith('prism_')) {
      const userInfo = await validateApiTokenService(apiKey);
      if (!userInfo) {
        throw new AuthenticationError('Invalid or expired API token');
      }
      
      req.user = {
        userId: userInfo.userId,
        email: userInfo.email,
        fullName: userInfo.fullName,
        isApiToken: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // Placeholder, not used for API tokens
      };
      next();
      return;
    }

    // Check for Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);

    // Check if it's an API token (starts with prism_)
    if (token.startsWith('prism_')) {
      const userInfo = await validateApiTokenService(token);
      if (!userInfo) {
        throw new AuthenticationError('Invalid or expired API token');
      }
      
      req.user = {
        userId: userInfo.userId,
        email: userInfo.email,
        fullName: userInfo.fullName,
        isApiToken: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // Placeholder, not used for API tokens
      };
      next();
      return;
    }

    // Regular JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
      return;
    }
    next(new AuthenticationError('Invalid or expired token'));
  }
};

/**
 * Middleware to block shared access users from certain routes (like settings)
 * API token users are allowed (they have full access like account owners)
 */
export const blockSharedAccess = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  // API token users have full access, not shared access
  if (req.user?.isApiToken) {
    next();
    return;
  }
  if (req.user?.isSharedAccess) {
    throw new AuthorizationError('This action is not available for shared access accounts');
  }
  next();
};

/**
 * Middleware to require shared access (only shared users can access)
 */
export const requireSharedAccess = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user?.isSharedAccess) {
    throw new AuthorizationError('This action is only available for shared access accounts');
  }
  next();
};

/**
 * Middleware to check if shared user has specific permission
 * If user is not a shared access user, they have full access
 * For shared users, fetches current permissions from DB to ensure up-to-date access
 */
export const requirePermission = (permission: keyof SharePermissions) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Non-shared users (account owners) have full access
      if (!req.user?.isSharedAccess) {
        next();
        return;
      }

      // Fetch current permissions from database to ensure we have the latest
      const shareId = req.user.shareId;
      if (!shareId) {
        throw new AuthorizationError('Invalid shared access session');
      }

      const result = await pool.query<{ permissions: SharePermissions }>(
        'SELECT permissions FROM shared_accounts WHERE id = $1 AND status = $2 AND expires_at > NOW()',
        [shareId, 'accepted']
      );

      if (result.rows.length === 0) {
        throw new AuthorizationError('Shared access session is no longer valid');
      }

      const currentPermissions = result.rows[0].permissions;
      if (!currentPermissions || !currentPermissions[permission]) {
        throw new AuthorizationError(`You do not have permission to ${formatPermissionName(permission)}`);
      }

      // Update req.user.permissions with current DB permissions for downstream use
      req.user.permissions = currentPermissions;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if shared user has ALL of the specified permissions
 * All permissions must be granted for access
 */
export const requirePermissions = (...permissions: (keyof SharePermissions)[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Non-shared users (account owners) have full access
      if (!req.user?.isSharedAccess) {
        next();
        return;
      }

      // Fetch current permissions from database to ensure we have the latest
      const shareId = req.user.shareId;
      if (!shareId) {
        throw new AuthorizationError('Invalid shared access session');
      }

      const result = await pool.query<{ permissions: SharePermissions }>(
        'SELECT permissions FROM shared_accounts WHERE id = $1 AND status = $2 AND expires_at > NOW()',
        [shareId, 'accepted']
      );

      if (result.rows.length === 0) {
        throw new AuthorizationError('Shared access session is no longer valid');
      }

      const currentPermissions = result.rows[0].permissions;
      
      // Check all required permissions
      for (const permission of permissions) {
        if (!currentPermissions || !currentPermissions[permission]) {
          throw new AuthorizationError(`You do not have permission to ${formatPermissionName(permission)}`);
        }
      }

      // Update req.user.permissions with current DB permissions for downstream use
      req.user.permissions = currentPermissions;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Format permission name for user-friendly error messages
 */
function formatPermissionName(permission: keyof SharePermissions): string {
  const names: Record<keyof SharePermissions, string> = {
    createDatabase: 'create databases',
    connectDatabase: 'connect to databases',
    createTable: 'create tables',
    addColumn: 'add columns',
    editColumn: 'edit columns',
    deleteColumn: 'delete columns',
    deleteTable: 'delete tables',
    viewTableData: 'view table data',
    addRecord: 'add records',
    editRecord: 'edit records',
    deleteRecord: 'delete records',
    runQuery: 'run queries',
    createApiInQueryBuilder: 'create APIs in query builder',
    tryAutoGeneratedApis: 'try auto-generated APIs',
    tryOpenApi: 'try OpenAPI',
  };
  return names[permission] || permission;
}
