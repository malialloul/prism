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
} from './auth.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/login/2fa', login2FAHandler);
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

export default router;
