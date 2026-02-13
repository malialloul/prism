import { Request, Response, NextFunction } from 'express';
export declare const signupHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const loginHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const forgotPasswordHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const verifyResetCodeHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const resetPasswordHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const changePasswordHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const changeEmailHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const get2FAStatusHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const setup2FAHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const verify2FAHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const disable2FAHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const login2FAHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const deactivateAccountHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const deleteAccountHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const shareAccountHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const getSharedAccountsHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const revokeShareHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateSharePermissionsHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const deleteShareHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const sharedLoginHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const getNotificationsHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const markNotificationReadHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const markAllNotificationsReadHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const deleteNotificationHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const createPermissionRequestHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const getPermissionRequestsHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const getMyPermissionRequestsHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const respondPermissionRequestHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const cancelPermissionRequestHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const getMyPermissionsHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Redirect to Google OAuth
 */
export declare const googleOAuthHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Handle Google OAuth callback
 */
export declare const googleOAuthCallbackHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Redirect to GitHub OAuth
 */
export declare const githubOAuthHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Handle GitHub OAuth callback
 */
export declare const githubOAuthCallbackHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Create a new API token
 */
export declare const createApiTokenHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Get all API tokens for the current user
 */
export declare const getApiTokensHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Revoke an API token
 */
export declare const revokeApiTokenHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Reveal (get plain text) an API token
 */
export declare const revealApiTokenHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Get current version info and user's limits/usage
 */
export declare const getVersionLimitsHandler: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.controller.d.ts.map