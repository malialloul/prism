"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPermissionRequestHandler = exports.respondPermissionRequestHandler = exports.getMyPermissionRequestsHandler = exports.getPermissionRequestsHandler = exports.createPermissionRequestHandler = exports.deleteNotificationHandler = exports.markAllNotificationsReadHandler = exports.markNotificationReadHandler = exports.getNotificationsHandler = exports.sharedLoginHandler = exports.deleteShareHandler = exports.updateSharePermissionsHandler = exports.revokeShareHandler = exports.getSharedAccountsHandler = exports.shareAccountHandler = exports.deleteAccountHandler = exports.deactivateAccountHandler = exports.login2FAHandler = exports.disable2FAHandler = exports.verify2FAHandler = exports.setup2FAHandler = exports.get2FAStatusHandler = exports.changeEmailHandler = exports.changePasswordHandler = exports.resetPasswordHandler = exports.verifyResetCodeHandler = exports.forgotPasswordHandler = exports.loginHandler = exports.signupHandler = void 0;
const auth_service_1 = require("./auth.service");
const errorHandler_1 = require("../../middleware/errorHandler");
const errors_1 = require("../../utils/errors");
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
exports.deactivateAccountHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.deactivateAccountService)(userId, req.body);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
exports.deleteAccountHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.deleteAccountService)(userId, req.body);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
// ============================================================================
// ACCOUNT SHARING HANDLERS
// ============================================================================
exports.shareAccountHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.shareAccountService)(userId, req.body);
    const result = {
        status: 'success',
        message: data.message,
        data,
    };
    res.json(result);
});
exports.getSharedAccountsHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.getSharedAccountsService)(userId);
    const result = {
        status: 'success',
        message: 'Shared accounts retrieved',
        data,
    };
    res.json(result);
});
exports.revokeShareHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.revokeShareService)(userId, req.body);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
exports.updateSharePermissionsHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const shareId = parseInt(req.params.shareId, 10);
    const { permissions } = req.body;
    const data = await (0, auth_service_1.updateSharePermissionsService)(userId, { shareId, permissions });
    res.json({
        status: 'success',
        message: data.message,
        data: { share: data.share },
    });
});
exports.deleteShareHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const shareId = parseInt(req.params.shareId, 10);
    const data = await (0, auth_service_1.deleteShareService)(userId, shareId);
    res.json({
        status: 'success',
        message: data.message,
    });
});
exports.sharedLoginHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const data = await (0, auth_service_1.sharedLoginService)(req.body);
    const result = {
        status: 'success',
        message: 'Shared login successful',
        data,
    };
    res.json(result);
});
// ============================================================================
// NOTIFICATION HANDLERS
// ============================================================================
exports.getNotificationsHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const isSharedAccess = req.user.isSharedAccess || false;
    const shareId = req.user.shareId;
    const data = await (0, auth_service_1.getNotificationsService)(userId, isSharedAccess, shareId);
    const result = {
        status: 'success',
        message: 'Notifications retrieved',
        data,
    };
    res.json(result);
});
exports.markNotificationReadHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const notificationId = req.params.id;
    const data = await (0, auth_service_1.markNotificationReadService)(userId, notificationId);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
exports.markAllNotificationsReadHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.markAllNotificationsReadService)(userId);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
exports.deleteNotificationHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const notificationId = req.params.id;
    const { deleteNotificationService } = await Promise.resolve().then(() => __importStar(require('./auth.service')));
    const data = await deleteNotificationService(userId, notificationId);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
// ============================================================================
// PERMISSION REQUEST HANDLERS
// ============================================================================
exports.createPermissionRequestHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const tokenShareId = req.user.shareId; // Share ID from the token
    const shareId = parseInt(req.params.shareId, 10);
    // Verify the share ID in the URL matches the one in the token
    if (!tokenShareId || tokenShareId !== shareId) {
        throw new errors_1.AuthorizationError('You can only request permissions for your own share');
    }
    const body = req.body;
    const data = await (0, auth_service_1.createPermissionRequestService)(userId, shareId, body);
    const result = {
        status: 'success',
        message: 'Permission request created successfully',
        data,
    };
    res.status(201).json(result);
});
exports.getPermissionRequestsHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.getPermissionRequestsService)(userId);
    const result = {
        status: 'success',
        message: 'Permission requests retrieved',
        data,
    };
    res.json(result);
});
exports.getMyPermissionRequestsHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const shareId = req.user.shareId; // Pass shareId for shared users
    const data = await (0, auth_service_1.getMyPermissionRequestsService)(userId, shareId);
    const result = {
        status: 'success',
        message: 'Your permission requests retrieved',
        data,
    };
    res.json(result);
});
exports.respondPermissionRequestHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const data = await (0, auth_service_1.respondPermissionRequestService)(userId, req.body);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
exports.cancelPermissionRequestHandler = (0, errorHandler_1.asyncHandler)(async (req, res, _next) => {
    const userId = req.user.userId;
    const shareId = req.user.shareId;
    const requestId = req.params.requestId;
    if (!shareId) {
        throw new errors_1.AuthorizationError('Share ID not found in token');
    }
    const data = await (0, auth_service_1.cancelPermissionRequestService)(userId, requestId, shareId);
    const result = {
        status: 'success',
        message: data.message,
    };
    res.json(result);
});
//# sourceMappingURL=auth.controller.js.map