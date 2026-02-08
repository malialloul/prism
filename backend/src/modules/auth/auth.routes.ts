// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { 
  loginHandler, 
  signupHandler, 
  forgotPasswordHandler, 
  verifyResetCodeHandler, 
  resetPasswordHandler,
  changePasswordHandler,
  changeEmailHandler,
  get2FAStatusHandler,
  setup2FAHandler,
  verify2FAHandler,
  disable2FAHandler,
  login2FAHandler,
  deactivateAccountHandler,
  deleteAccountHandler,
  shareAccountHandler,
  getSharedAccountsHandler,
  revokeShareHandler,
  updateSharePermissionsHandler,
  deleteShareHandler,
  sharedLoginHandler,
  getNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
  deleteNotificationHandler,
  createPermissionRequestHandler,
  getPermissionRequestsHandler,
  getMyPermissionRequestsHandler,
  respondPermissionRequestHandler,
  cancelPermissionRequestHandler,
  getMyPermissionsHandler,
  googleOAuthHandler,
  googleOAuthCallbackHandler,
  githubOAuthHandler,
  githubOAuthCallbackHandler,
} from './auth.controller';
import { authMiddleware, blockSharedAccess, requireSharedAccess } from '../../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/login/2fa', login2FAHandler);
router.post('/login/shared', sharedLoginHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/verify-reset-code', verifyResetCodeHandler);
router.post('/reset-password', resetPasswordHandler);

// OAuth routes (public)
router.get('/oauth/google', googleOAuthHandler);
router.get('/oauth/google/callback', googleOAuthCallbackHandler);
router.get('/oauth/github', githubOAuthHandler);
router.get('/oauth/github/callback', githubOAuthCallbackHandler);

// Protected routes - blocked for shared access users (settings)
router.post('/change-password', authMiddleware, blockSharedAccess, changePasswordHandler);
router.post('/change-email', authMiddleware, blockSharedAccess, changeEmailHandler);

// 2FA routes (protected) - blocked for shared access users
router.get('/2fa/status', authMiddleware, blockSharedAccess, get2FAStatusHandler);
router.post('/2fa/setup', authMiddleware, blockSharedAccess, setup2FAHandler);
router.post('/2fa/verify', authMiddleware, blockSharedAccess, verify2FAHandler);
router.post('/2fa/disable', authMiddleware, blockSharedAccess, disable2FAHandler);

// Account management routes (protected) - blocked for shared access users
router.post('/account/deactivate', authMiddleware, blockSharedAccess, deactivateAccountHandler);
router.post('/account/delete', authMiddleware, blockSharedAccess, deleteAccountHandler);

// Account sharing routes (protected) - blocked for shared access users
router.post('/account/share', authMiddleware, blockSharedAccess, shareAccountHandler);
router.get('/account/shares', authMiddleware, blockSharedAccess, getSharedAccountsHandler);
router.post('/account/share/revoke', authMiddleware, blockSharedAccess, revokeShareHandler);
router.put('/account/share/:shareId/permissions', authMiddleware, blockSharedAccess, updateSharePermissionsHandler);
router.delete('/account/share/:shareId', authMiddleware, blockSharedAccess, deleteShareHandler);

// Notification routes (protected) - allow shared users to see notifications
router.get('/notifications', authMiddleware, getNotificationsHandler);
router.post('/notifications/:id/read', authMiddleware, markNotificationReadHandler);
router.post('/notifications/read-all', authMiddleware, markAllNotificationsReadHandler);
router.delete('/notifications/:id', authMiddleware, deleteNotificationHandler);

// Permission request routes (protected)
// Routes for account owners to manage permission requests (specific routes first)
router.get('/permission-requests', authMiddleware, blockSharedAccess, getPermissionRequestsHandler);
router.post('/permission-requests/respond', authMiddleware, blockSharedAccess, respondPermissionRequestHandler);
// Routes for shared users to request permissions (parameterized routes after)
router.get('/permission-requests/my', authMiddleware, requireSharedAccess, getMyPermissionRequestsHandler);
router.post('/permission-requests/:shareId', authMiddleware, requireSharedAccess, createPermissionRequestHandler);
router.delete('/permission-requests/:requestId', authMiddleware, requireSharedAccess, cancelPermissionRequestHandler);

// Get current permissions for shared user (fetches from DB, not from stale JWT)
router.get('/my-permissions', authMiddleware, requireSharedAccess, getMyPermissionsHandler);

export default router;
