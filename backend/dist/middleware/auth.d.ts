import { Request, Response, NextFunction } from 'express';
import type { SharePermissions } from '../modules/auth/auth.types';
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
export declare const authMiddleware: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to block shared access users from certain routes (like settings)
 * API token users are allowed (they have full access like account owners)
 */
export declare const blockSharedAccess: (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Middleware to require shared access (only shared users can access)
 */
export declare const requireSharedAccess: (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Middleware to check if shared user has specific permission
 * If user is not a shared access user, they have full access
 * For shared users, fetches current permissions from DB to ensure up-to-date access
 */
export declare const requirePermission: (permission: keyof SharePermissions) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check if shared user has ALL of the specified permissions
 * All permissions must be granted for access
 */
export declare const requirePermissions: (...permissions: (keyof SharePermissions)[]) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map