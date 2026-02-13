"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/auth/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/signup', auth_controller_1.signupHandler);
router.post('/login', auth_controller_1.loginHandler);
router.post('/login/2fa', auth_controller_1.login2FAHandler);
router.post('/login/shared', auth_controller_1.sharedLoginHandler);
router.post('/forgot-password', auth_controller_1.forgotPasswordHandler);
router.post('/verify-reset-code', auth_controller_1.verifyResetCodeHandler);
router.post('/reset-password', auth_controller_1.resetPasswordHandler);
// OAuth routes (public)
router.get('/oauth/google', auth_controller_1.googleOAuthHandler);
router.get('/oauth/google/callback', auth_controller_1.googleOAuthCallbackHandler);
router.get('/oauth/github', auth_controller_1.githubOAuthHandler);
router.get('/oauth/github/callback', auth_controller_1.githubOAuthCallbackHandler);
// Protected routes - blocked for shared access users (settings)
router.post('/change-password', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.changePasswordHandler);
router.post('/change-email', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.changeEmailHandler);
// 2FA routes (protected) - blocked for shared access users
router.get('/2fa/status', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.get2FAStatusHandler);
router.post('/2fa/setup', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.setup2FAHandler);
router.post('/2fa/verify', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.verify2FAHandler);
router.post('/2fa/disable', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.disable2FAHandler);
// Account management routes (protected) - blocked for shared access users
router.post('/account/deactivate', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.deactivateAccountHandler);
router.post('/account/delete', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.deleteAccountHandler);
// Account sharing routes (protected) - blocked for shared access users
router.post('/account/share', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.shareAccountHandler);
router.get('/account/shares', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.getSharedAccountsHandler);
router.post('/account/share/revoke', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.revokeShareHandler);
router.put('/account/share/:shareId/permissions', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.updateSharePermissionsHandler);
router.delete('/account/share/:shareId', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.deleteShareHandler);
// Notification routes (protected) - allow shared users to see notifications
router.get('/notifications', auth_1.authMiddleware, auth_controller_1.getNotificationsHandler);
router.post('/notifications/:id/read', auth_1.authMiddleware, auth_controller_1.markNotificationReadHandler);
router.post('/notifications/read-all', auth_1.authMiddleware, auth_controller_1.markAllNotificationsReadHandler);
router.delete('/notifications/:id', auth_1.authMiddleware, auth_controller_1.deleteNotificationHandler);
// Permission request routes (protected)
// Routes for account owners to manage permission requests (specific routes first)
router.get('/permission-requests', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.getPermissionRequestsHandler);
router.post('/permission-requests/respond', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.respondPermissionRequestHandler);
// Routes for shared users to request permissions (parameterized routes after)
router.get('/permission-requests/my', auth_1.authMiddleware, auth_1.requireSharedAccess, auth_controller_1.getMyPermissionRequestsHandler);
router.post('/permission-requests/:shareId', auth_1.authMiddleware, auth_1.requireSharedAccess, auth_controller_1.createPermissionRequestHandler);
router.delete('/permission-requests/:requestId', auth_1.authMiddleware, auth_1.requireSharedAccess, auth_controller_1.cancelPermissionRequestHandler);
// Get current permissions for shared user (fetches from DB, not from stale JWT)
router.get('/my-permissions', auth_1.authMiddleware, auth_1.requireSharedAccess, auth_controller_1.getMyPermissionsHandler);
// API Token routes (protected) - blocked for shared access users
router.post('/api-tokens', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.createApiTokenHandler);
router.get('/api-tokens', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.getApiTokensHandler);
router.get('/api-tokens/:tokenId/reveal', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.revealApiTokenHandler);
router.delete('/api-tokens/:tokenId', auth_1.authMiddleware, auth_1.blockSharedAccess, auth_controller_1.revokeApiTokenHandler);
// Version & Limits route (protected) - all users can see their limits
router.get('/version', auth_1.authMiddleware, auth_controller_1.getVersionLimitsHandler);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map