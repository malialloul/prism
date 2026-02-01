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
  sharedLoginHandler,
  getNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
  deleteNotificationHandler,
} from './auth.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/login/2fa', login2FAHandler);
router.post('/login/shared', sharedLoginHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/verify-reset-code', verifyResetCodeHandler);
router.post('/reset-password', resetPasswordHandler);

// Protected routes
router.post('/change-password', authMiddleware, changePasswordHandler);
router.post('/change-email', authMiddleware, changeEmailHandler);

// 2FA routes (protected)
router.get('/2fa/status', authMiddleware, get2FAStatusHandler);
router.post('/2fa/setup', authMiddleware, setup2FAHandler);
router.post('/2fa/verify', authMiddleware, verify2FAHandler);
router.post('/2fa/disable', authMiddleware, disable2FAHandler);

// Account management routes (protected)
router.post('/account/deactivate', authMiddleware, deactivateAccountHandler);
router.post('/account/delete', authMiddleware, deleteAccountHandler);

// Account sharing routes (protected)
router.post('/account/share', authMiddleware, shareAccountHandler);
router.get('/account/shares', authMiddleware, getSharedAccountsHandler);
router.post('/account/share/revoke', authMiddleware, revokeShareHandler);

// Notification routes (protected)
router.get('/notifications', authMiddleware, getNotificationsHandler);
router.post('/notifications/:id/read', authMiddleware, markNotificationReadHandler);
router.post('/notifications/read-all', authMiddleware, markAllNotificationsReadHandler);
router.delete('/notifications/:id', authMiddleware, deleteNotificationHandler);

export default router;
