// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { 
  loginHandler, 
  signupHandler, 
  forgotPasswordHandler, 
  verifyResetCodeHandler, 
  resetPasswordHandler,
  changePasswordHandler,
} from './auth.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/verify-reset-code', verifyResetCodeHandler);
router.post('/reset-password', resetPasswordHandler);

// Protected routes
router.post('/change-password', authMiddleware, changePasswordHandler);

export default router;
