"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login2FAHandler = exports.disable2FAHandler = exports.verify2FAHandler = exports.setup2FAHandler = exports.get2FAStatusHandler = exports.changeEmailHandler = exports.changePasswordHandler = exports.resetPasswordHandler = exports.verifyResetCodeHandler = exports.forgotPasswordHandler = exports.loginHandler = exports.signupHandler = void 0;
const auth_service_1 = require("./auth.service");
const errorHandler_1 = require("../../middleware/errorHandler");
exports.signupHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const authData = await (0, auth_service_1.signupService)(req.body);
    const result = {
        status: 'success',
        message: 'Account created successfully',
        data: authData,
    };
    res.status(201).json(result);
});
exports.loginHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const authData = await (0, auth_service_1.loginService)(req.body);
    // Check if 2FA is required
    if ('requires2FA' in authData && authData.requires2FA) {
        res.json({
            status: 'success',
            message: 'Two-factor authentication required',
            data: {
                requires2FA: true,
                tempToken: authData.tempToken,
                email: authData.email,
            },
        });
        return;
    }
    const result = {
        status: 'success',
        message: 'Login successful',
        data: authData,
    };
    res.json(result);
});
exports.forgotPasswordHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const data = await (0, auth_service_1.forgotPasswordService)(req.body);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
exports.verifyResetCodeHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const data = await (0, auth_service_1.verifyResetCodeService)(req.body);
    const result = {
        status: 'success',
        message: data.valid ? 'Code is valid' : 'Invalid or expired code',
        data,
    };
    res.json(result);
});
exports.resetPasswordHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const data = await (0, auth_service_1.resetPasswordService)(req.body);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
exports.changePasswordHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.changePasswordService)(userId, req.body);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
exports.changeEmailHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.changeEmailService)(userId, req.body);
    const result = {
        status: 'success',
        message: data.message,
        data: { token: data.token, message: data.message },
    };
    res.json(result);
});
// 2FA Handlers
exports.get2FAStatusHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.get2FAStatusService)(userId);
    const result = {
        status: 'success',
        message: 'Two-factor authentication status retrieved',
        data,
    };
    res.json(result);
});
exports.setup2FAHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.setup2FAService)(userId, req.body);
    const result = {
        status: 'success',
        message: 'Scan the QR code with your authenticator app',
        data,
    };
    res.json(result);
});
exports.verify2FAHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.verify2FAService)(userId, req.body);
    const result = {
        status: 'success',
        message: 'Two-factor authentication enabled successfully',
        data,
    };
    res.json(result);
});
exports.disable2FAHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.disable2FAService)(userId, req.body);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
exports.login2FAHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const data = await (0, auth_service_1.login2FAService)(req.body);
    const result = {
        status: 'success',
        message: 'Login successful',
        data,
    };
    res.json(result);
});
//# sourceMappingURL=auth.controller.js.map