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
router.post('/forgot-password', auth_controller_1.forgotPasswordHandler);
router.post('/verify-reset-code', auth_controller_1.verifyResetCodeHandler);
router.post('/reset-password', auth_controller_1.resetPasswordHandler);
// Protected routes
router.post('/change-password', auth_1.authMiddleware, auth_controller_1.changePasswordHandler);
router.post('/change-email', auth_1.authMiddleware, auth_controller_1.changeEmailHandler);
// 2FA routes (protected)
router.get('/2fa/status', auth_1.authMiddleware, auth_controller_1.get2FAStatusHandler);
router.post('/2fa/setup', auth_1.authMiddleware, auth_controller_1.setup2FAHandler);
router.post('/2fa/verify', auth_1.authMiddleware, auth_controller_1.verify2FAHandler);
router.post('/2fa/disable', auth_1.authMiddleware, auth_controller_1.disable2FAHandler);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map