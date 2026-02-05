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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPermissionRequestService = exports.respondPermissionRequestService = exports.getMyPermissionRequestsService = exports.getPermissionRequestsService = exports.createPermissionRequestService = exports.deleteNotificationService = exports.markAllNotificationsReadService = exports.markNotificationReadService = exports.getNotificationsService = exports.sharedLoginService = exports.deleteShareService = exports.updateSharePermissionsService = exports.revokeShareService = exports.getSharedAccountsService = exports.shareAccountService = exports.deleteAccountService = exports.reactivateAccountService = exports.deactivateAccountService = exports.login2FAService = exports.disable2FAService = exports.verify2FAService = exports.setup2FAService = exports.get2FAStatusService = exports.changeEmailService = exports.changePasswordService = exports.resetPasswordService = exports.verifyResetCodeService = exports.forgotPasswordService = exports.loginService = exports.signupService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const otplib_1 = require("otplib");
const qrcode = __importStar(require("qrcode"));
const db_1 = require("../../config/db");
const env_1 = require("../../config/env");
const auth_types_1 = require("./auth.types");
const errors_1 = require("../../utils/errors");
const signupService = async (body) => {
    const { email, password, fullName } = body;
    const exists = await db_1.pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rowCount && exists.rowCount > 0) {
        throw new errors_1.ConflictError('An account with this email already exists');
    }
    const hash = await bcrypt_1.default.hash(password, 12);
    const userResult = await db_1.pool.query(`INSERT INTO users(email, password_hash, full_name)
     VALUES ($1,$2,$3)
     RETURNING id,email,full_name,password_hash`, [email, hash, fullName ?? null]);
    const user = userResult.rows[0];
    // Token contains encrypted user details
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email,
        fullName: user.full_name ?? undefined,
    }, env_1.config.jwt.secret, { expiresIn: env_1.config.jwt.expiresIn });
    return { token };
};
exports.signupService = signupService;
const loginService = async (body) => {
    const { email, password } = body;
    const result = await db_1.pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!result.rowCount) {
        throw new errors_1.AuthenticationError('Invalid email or password');
    }
    const user = result.rows[0];
    const valid = await bcrypt_1.default.compare(password, user.password_hash);
    if (!valid)
        throw new errors_1.AuthenticationError('Invalid email or password');
    // Check if account is deactivated and reactivate it
    if (user.deactivated_at) {
        await db_1.pool.query('UPDATE users SET deactivated_at = NULL, updated_at = NOW() WHERE id = $1', [user.id]);
        console.log(`Account reactivated for user: ${user.email}`);
    }
    // Check if 2FA is enabled
    if (user.two_factor_enabled && user.two_factor_secret) {
        // Generate a temporary token for 2FA verification
        const tempToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            purpose: '2fa-verification',
        }, env_1.config.jwt.secret, { expiresIn: '5m' });
        return { requires2FA: true, tempToken, email: user.email };
    }
    // Token contains encrypted user details
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email,
        fullName: user.full_name ?? undefined,
    }, env_1.config.jwt.secret, { expiresIn: env_1.config.jwt.expiresIn });
    return { token };
};
exports.loginService = loginService;
/**
 * Generate a 6-digit OTP code
 */
const generateOtpCode = () => {
    return crypto_1.default.randomInt(100000, 999999).toString();
};
/**
 * Request password reset - sends OTP to email
 */
const forgotPasswordService = async (body) => {
    const { email } = body;
    // Find user by email
    const userResult = await db_1.pool.query('SELECT id, email FROM users WHERE email=$1', [email]);
    // Always return success to prevent email enumeration
    if (!userResult.rowCount) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        return { message: 'If an account exists with this email, you will receive a reset code.' };
    }
    const user = userResult.rows[0];
    // Invalidate any existing tokens for this user
    await db_1.pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [user.id]);
    // Generate OTP code
    const otpCode = generateOtpCode();
    console.log(`🔐 Password reset code for ${email}: ${otpCode}`);
    // Hash the OTP for storage
    const hashedToken = await bcrypt_1.default.hash(otpCode, 10);
    // Token expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    // Store the token
    await db_1.pool.query(`INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`, [user.id, hashedToken, expiresAt]);
    return { message: 'If an account exists with this email, you will receive a reset code.' };
};
exports.forgotPasswordService = forgotPasswordService;
/**
 * Verify reset code is valid
 */
const verifyResetCodeService = async (body) => {
    const { email, code } = body;
    // Find user
    const userResult = await db_1.pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (!userResult.rowCount) {
        return { valid: false };
    }
    const user = userResult.rows[0];
    // Find valid token
    const tokenResult = await db_1.pool.query(`SELECT * FROM password_reset_tokens 
     WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`, [user.id]);
    if (!tokenResult.rowCount) {
        return { valid: false };
    }
    const resetToken = tokenResult.rows[0];
    // Verify the code
    const valid = await bcrypt_1.default.compare(code, resetToken.token);
    return { valid };
};
exports.verifyResetCodeService = verifyResetCodeService;
/**
 * Reset password with valid code
 */
const resetPasswordService = async (body) => {
    const { email, code, newPassword } = body;
    // Find user
    const userResult = await db_1.pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (!userResult.rowCount) {
        throw new errors_1.NotFoundError('Invalid reset request');
    }
    const user = userResult.rows[0];
    // Find valid token
    const tokenResult = await db_1.pool.query(`SELECT * FROM password_reset_tokens 
     WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`, [user.id]);
    if (!tokenResult.rowCount) {
        throw new errors_1.ValidationError('Reset code has expired. Please request a new one.');
    }
    const resetToken = tokenResult.rows[0];
    // Verify the code
    const valid = await bcrypt_1.default.compare(code, resetToken.token);
    if (!valid) {
        throw new errors_1.ValidationError('Invalid reset code');
    }
    // Hash new password
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 12);
    // Update password
    await db_1.pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, user.id]);
    // Mark token as used
    await db_1.pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [resetToken.id]);
    return { message: 'Password reset successfully' };
};
exports.resetPasswordService = resetPasswordService;
/**
 * Change password for authenticated user
 */
const changePasswordService = async (userId, body) => {
    const { currentPassword, newPassword } = body;
    // Find user
    const userResult = await db_1.pool.query('SELECT id, password_hash FROM users WHERE id = $1', [userId]);
    if (!userResult.rowCount) {
        throw new errors_1.NotFoundError('User not found');
    }
    const user = userResult.rows[0];
    // Verify current password
    const validCurrentPassword = await bcrypt_1.default.compare(currentPassword, user.password_hash);
    if (!validCurrentPassword) {
        throw new errors_1.ValidationError('Current password is incorrect');
    }
    // Check if new password is same as current password
    const isSamePassword = await bcrypt_1.default.compare(newPassword, user.password_hash);
    if (isSamePassword) {
        throw new errors_1.ValidationError('New password must be different from current password');
    }
    // Hash new password
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 12);
    // Update password
    await db_1.pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, userId]);
    return { message: 'Password changed successfully' };
};
exports.changePasswordService = changePasswordService;
/**
 * Change email for authenticated user
 */
const changeEmailService = async (userId, body) => {
    const { newEmail, password } = body;
    // Find user
    const userResult = await db_1.pool.query('SELECT id, email, password_hash, full_name FROM users WHERE id = $1', [userId]);
    if (!userResult.rowCount) {
        throw new errors_1.NotFoundError('User not found');
    }
    const user = userResult.rows[0];
    // Verify password
    const validPassword = await bcrypt_1.default.compare(password, user.password_hash);
    if (!validPassword) {
        throw new errors_1.ValidationError('Password is incorrect');
    }
    // Check if new email is same as current email
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
        throw new errors_1.ValidationError('New email must be different from current email');
    }
    // Check if email already exists
    const existingEmail = await db_1.pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [newEmail.toLowerCase(), userId]);
    if (existingEmail.rowCount && existingEmail.rowCount > 0) {
        throw new errors_1.ConflictError('An account with this email already exists');
    }
    // Update email
    await db_1.pool.query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [newEmail.toLowerCase(), userId]);
    // Generate new token with updated email
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        email: newEmail.toLowerCase(),
        fullName: user.full_name ?? undefined,
    }, env_1.config.jwt.secret, { expiresIn: env_1.config.jwt.expiresIn });
    return { token, message: 'Email changed successfully' };
};
exports.changeEmailService = changeEmailService;
/**
 * Get 2FA status for authenticated user
 */
const get2FAStatusService = async (userId) => {
    const userResult = await db_1.pool.query('SELECT two_factor_enabled FROM users WHERE id = $1', [userId]);
    if (!userResult.rowCount) {
        throw new errors_1.NotFoundError('User not found');
    }
    return { enabled: userResult.rows[0].two_factor_enabled };
};
exports.get2FAStatusService = get2FAStatusService;
/**
 * Setup 2FA for authenticated user - generates secret and QR code
 */
const setup2FAService = async (userId, body) => {
    const { password } = body;
    // Find user
    const userResult = await db_1.pool.query('SELECT id, email, password_hash, two_factor_enabled FROM users WHERE id = $1', [userId]);
    if (!userResult.rowCount) {
        throw new errors_1.NotFoundError('User not found');
    }
    const user = userResult.rows[0];
    // Verify password
    const validPassword = await bcrypt_1.default.compare(password, user.password_hash);
    if (!validPassword) {
        throw new errors_1.ValidationError('Password is incorrect');
    }
    // Check if 2FA is already enabled
    if (user.two_factor_enabled) {
        throw new errors_1.ValidationError('Two-factor authentication is already enabled');
    }
    // Generate secret
    const secret = (0, otplib_1.generateSecret)();
    // Store secret (not yet enabled)
    await db_1.pool.query('UPDATE users SET two_factor_secret = $1, updated_at = NOW() WHERE id = $2', [secret, userId]);
    // Generate QR code
    const otpauth = (0, otplib_1.generateURI)({
        issuer: 'Prism',
        label: user.email,
        secret,
    });
    const qrCode = await qrcode.toDataURL(otpauth);
    return { qrCode, secret };
};
exports.setup2FAService = setup2FAService;
/**
 * Verify 2FA code and enable 2FA
 */
const verify2FAService = async (userId, body) => {
    const { code } = body;
    // Find user
    const userResult = await db_1.pool.query('SELECT id, two_factor_secret, two_factor_enabled FROM users WHERE id = $1', [userId]);
    if (!userResult.rowCount) {
        throw new errors_1.NotFoundError('User not found');
    }
    const user = userResult.rows[0];
    if (!user.two_factor_secret) {
        throw new errors_1.ValidationError('Please setup 2FA first');
    }
    if (user.two_factor_enabled) {
        throw new errors_1.ValidationError('Two-factor authentication is already enabled');
    }
    // Verify the code (must be from authenticator app during setup)
    const totpResult = await (0, otplib_1.verify)({ token: code, secret: user.two_factor_secret });
    console.log('DEBUG verify2FA - code:', code, 'totpResult:', totpResult, 'type:', typeof totpResult, 'JSON:', JSON.stringify(totpResult));
    // otplib v13 may return an object with .valid property or boolean
    const isValid = typeof totpResult === 'boolean' ? totpResult : totpResult?.valid;
    if (!isValid) {
        throw new errors_1.ValidationError('Invalid verification code');
    }
    // Enable 2FA
    await db_1.pool.query('UPDATE users SET two_factor_enabled = true, updated_at = NOW() WHERE id = $1', [userId]);
    // Delete any existing backup codes for this user
    await db_1.pool.query('DELETE FROM backup_codes WHERE user_id = $1', [userId]);
    // Generate backup codes (6-digit numbers)
    const backupCodes = Array.from({ length: 8 }, () => crypto_1.default.randomInt(100000, 999999).toString());
    // Hash and store backup codes
    for (const code of backupCodes) {
        const codeHash = await bcrypt_1.default.hash(code, 10);
        await db_1.pool.query('INSERT INTO backup_codes (user_id, code_hash) VALUES ($1, $2)', [userId, codeHash]);
    }
    return { backupCodes };
};
exports.verify2FAService = verify2FAService;
/**
 * Disable 2FA for authenticated user
 */
const disable2FAService = async (userId, body) => {
    const { password, code } = body;
    // Find user
    const userResult = await db_1.pool.query('SELECT id, password_hash, two_factor_secret, two_factor_enabled FROM users WHERE id = $1', [userId]);
    if (!userResult.rowCount) {
        throw new errors_1.NotFoundError('User not found');
    }
    const user = userResult.rows[0];
    // Verify password
    const validPassword = await bcrypt_1.default.compare(password, user.password_hash);
    if (!validPassword) {
        throw new errors_1.ValidationError('Password is incorrect');
    }
    if (!user.two_factor_enabled || !user.two_factor_secret) {
        throw new errors_1.ValidationError('Two-factor authentication is not enabled');
    }
    // First try TOTP verification
    const totpResult = await (0, otplib_1.verify)({ token: code, secret: user.two_factor_secret });
    // otplib v13 returns object with .valid property
    let isValid = typeof totpResult === 'boolean' ? totpResult : totpResult?.valid;
    // If TOTP fails, check if it's a backup code
    if (!isValid) {
        const backupCodes = await db_1.pool.query('SELECT * FROM backup_codes WHERE user_id = $1 AND used_at IS NULL', [userId]);
        for (const backupCode of backupCodes.rows) {
            const matches = await bcrypt_1.default.compare(code, backupCode.code_hash);
            if (matches) {
                // Mark backup code as used
                await db_1.pool.query('UPDATE backup_codes SET used_at = NOW() WHERE id = $1', [backupCode.id]);
                isValid = true;
                break;
            }
        }
    }
    if (!isValid) {
        throw new errors_1.ValidationError('Invalid verification code');
    }
    // Disable 2FA
    await db_1.pool.query('UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL, updated_at = NOW() WHERE id = $1', [userId]);
    // Delete backup codes
    await db_1.pool.query('DELETE FROM backup_codes WHERE user_id = $1', [userId]);
    return { message: 'Two-factor authentication disabled successfully' };
};
exports.disable2FAService = disable2FAService;
/**
 * Verify 2FA code during login
 */
const login2FAService = async (body) => {
    const { email, code, tempToken } = body;
    // Verify temp token
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(tempToken, env_1.config.jwt.secret);
    }
    catch {
        throw new errors_1.AuthenticationError('Invalid or expired session. Please login again.');
    }
    if (decoded.purpose !== '2fa-verification' || decoded.email !== email) {
        throw new errors_1.AuthenticationError('Invalid session. Please login again.');
    }
    // Find user
    const userResult = await db_1.pool.query('SELECT id, email, full_name, two_factor_secret, two_factor_enabled FROM users WHERE id = $1', [decoded.userId]);
    if (!userResult.rowCount) {
        throw new errors_1.NotFoundError('User not found');
    }
    const user = userResult.rows[0];
    if (!user.two_factor_enabled || !user.two_factor_secret) {
        throw new errors_1.ValidationError('Two-factor authentication is not enabled');
    }
    // First try TOTP verification
    console.log('DEBUG login2FA - code:', code, 'secret:', user.two_factor_secret);
    const totpResult = await (0, otplib_1.verify)({ token: code, secret: user.two_factor_secret });
    console.log('DEBUG login2FA - totpResult:', totpResult, 'type:', typeof totpResult);
    // otplib v13 returns object with .valid property
    let isValid = typeof totpResult === 'boolean' ? totpResult : totpResult?.valid;
    // If TOTP fails, check if it's a backup code
    if (!isValid) {
        const backupCodes = await db_1.pool.query('SELECT * FROM backup_codes WHERE user_id = $1 AND used_at IS NULL', [user.id]);
        for (const backupCode of backupCodes.rows) {
            const matches = await bcrypt_1.default.compare(code, backupCode.code_hash);
            if (matches) {
                // Mark backup code as used
                await db_1.pool.query('UPDATE backup_codes SET used_at = NOW() WHERE id = $1', [backupCode.id]);
                isValid = true;
                console.log('DEBUG login2FA - used backup code');
                break;
            }
        }
    }
    if (!isValid) {
        throw new errors_1.ValidationError('Invalid verification code');
    }
    // Generate full auth token
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email,
        fullName: user.full_name ?? undefined,
    }, env_1.config.jwt.secret, { expiresIn: env_1.config.jwt.expiresIn });
    return { token };
};
exports.login2FAService = login2FAService;
/**
 * Deactivate account for authenticated user
 */
const deactivateAccountService = async (userId, body) => {
    const { password } = body;
    // Find user
    const userResult = await db_1.pool.query('SELECT id, password_hash, deactivated_at FROM users WHERE id = $1', [userId]);
    if (!userResult.rowCount) {
        throw new errors_1.NotFoundError('User not found');
    }
    const user = userResult.rows[0];
    // Verify password
    const validPassword = await bcrypt_1.default.compare(password, user.password_hash);
    if (!validPassword) {
        throw new errors_1.ValidationError('Password is incorrect');
    }
    // Check if already deactivated
    if (user.deactivated_at) {
        throw new errors_1.ValidationError('Account is already deactivated');
    }
    // Deactivate the account
    await db_1.pool.query('UPDATE users SET deactivated_at = NOW(), updated_at = NOW() WHERE id = $1', [userId]);
    return { message: 'Account deactivated successfully. You can reactivate by logging in again.' };
};
exports.deactivateAccountService = deactivateAccountService;
/**
 * Reactivate a deactivated account during login
 */
const reactivateAccountService = async (userId) => {
    await db_1.pool.query('UPDATE users SET deactivated_at = NULL, updated_at = NOW() WHERE id = $1', [userId]);
};
exports.reactivateAccountService = reactivateAccountService;
/**
 * Delete account permanently for authenticated user
 */
const deleteAccountService = async (userId, body) => {
    const { password, confirmation } = body;
    // Verify confirmation text
    if (confirmation !== 'DELETE') {
        throw new errors_1.ValidationError('Please type DELETE to confirm account deletion');
    }
    // Find user
    const userResult = await db_1.pool.query('SELECT id, password_hash FROM users WHERE id = $1', [userId]);
    if (!userResult.rowCount) {
        throw new errors_1.NotFoundError('User not found');
    }
    const user = userResult.rows[0];
    // Verify password
    const validPassword = await bcrypt_1.default.compare(password, user.password_hash);
    if (!validPassword) {
        throw new errors_1.ValidationError('Password is incorrect');
    }
    // Delete related data first (foreign key constraints)
    await db_1.pool.query('DELETE FROM backup_codes WHERE user_id = $1', [userId]);
    await db_1.pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
    // Delete the user
    await db_1.pool.query('DELETE FROM users WHERE id = $1', [userId]);
    return { message: 'Account deleted permanently' };
};
exports.deleteAccountService = deleteAccountService;
// ============================================================================
// ACCOUNT SHARING SERVICES
// ============================================================================
/**
 * Generate a secure random temporary password
 */
const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};
/**
 * Share account with another user
 */
const shareAccountService = async (userId, body) => {
    const { email, expiresInDays = 7, permissions: inputPermissions } = body;
    // Merge provided permissions with defaults
    const permissions = {
        ...auth_types_1.DEFAULT_SHARE_PERMISSIONS,
        ...inputPermissions,
    };
    // Find the owner user
    const ownerResult = await db_1.pool.query('SELECT id, email, full_name FROM users WHERE id = $1', [userId]);
    if (!ownerResult.rowCount) {
        throw new errors_1.NotFoundError('User not found');
    }
    const owner = ownerResult.rows[0];
    // Cannot share with yourself
    if (owner.email.toLowerCase() === email.toLowerCase()) {
        throw new errors_1.ValidationError('You cannot share your account with yourself');
    }
    // Check if target user exists
    const targetResult = await db_1.pool.query('SELECT id, email, full_name FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    const targetUserId = targetResult.rowCount ? targetResult.rows[0].id : null;
    // Check for existing pending/accepted share
    const existingShare = await db_1.pool.query(`SELECT id FROM shared_accounts 
     WHERE owner_user_id = $1 AND LOWER(shared_with_email) = LOWER($2) 
     AND status IN ('pending', 'accepted') AND expires_at > NOW()`, [userId, email]);
    if (existingShare.rowCount && existingShare.rowCount > 0) {
        throw new errors_1.ConflictError('You already have an active share with this user');
    }
    // Generate temporary password
    const tempPassword = generateTempPassword();
    const tempPasswordHash = await bcrypt_1.default.hash(tempPassword, 12);
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    // Create the share record with permissions
    const shareResult = await db_1.pool.query(`INSERT INTO shared_accounts (owner_user_id, shared_with_email, shared_with_user_id, temp_password_hash, status, permissions, expires_at)
     VALUES ($1, $2, $3, $4, 'pending', $5, $6)
     RETURNING *`, [userId, email, targetUserId, tempPasswordHash, JSON.stringify(permissions), expiresAt]);
    const share = shareResult.rows[0];
    // Create notification for the target user if they exist
    if (targetUserId) {
        await db_1.pool.query(`INSERT INTO notifications (user_id, type, title, message, metadata)
       VALUES ($1, 'account_shared', $2, $3, $4)`, [
            targetUserId,
            'Account Shared With You',
            `${owner.full_name || owner.email} has shared their account with you.`,
            JSON.stringify({
                shareId: share.id,
                ownerEmail: owner.email,
                ownerName: owner.full_name,
                tempPassword, // Include temp password in notification
            }),
        ]);
        // Emit real-time notification via WebSocket
        const { emitNotification } = await Promise.resolve().then(() => __importStar(require('../../websocket/notificationEmitter')));
        emitNotification(targetUserId.toString(), {
            id: 0, // Will be updated with actual ID
            userId: Number(targetUserId),
            type: 'account_shared',
            title: 'Account Shared With You',
            message: `${owner.full_name || owner.email} has shared their account with you.`,
            metadata: JSON.stringify({
                shareId: share.id,
                ownerEmail: owner.email,
                ownerName: owner.full_name,
                tempPassword,
            }),
            readAt: null,
            createdAt: new Date(),
        });
    }
    return {
        share: {
            id: share.id,
            ownerUserId: Number(share.owner_user_id),
            ownerEmail: owner.email,
            ownerFullName: owner.full_name,
            sharedWithEmail: share.shared_with_email,
            sharedWithUserId: share.shared_with_user_id ? Number(share.shared_with_user_id) : null,
            status: share.status,
            permissions,
            tempPassword, // Return plain text password only on creation
            expiresAt: share.expires_at,
            acceptedAt: share.accepted_at,
            revokedAt: share.revoked_at,
            createdAt: share.created_at,
        },
        message: `Account shared successfully. Temporary password: ${tempPassword}`,
    };
};
exports.shareAccountService = shareAccountService;
/**
 * Get all shared accounts (both shared by me and shared with me)
 */
const getSharedAccountsService = async (userId) => {
    // Get current user's email
    const userResult = await db_1.pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (!userResult.rowCount) {
        throw new errors_1.NotFoundError('User not found');
    }
    const userEmail = userResult.rows[0].email;
    // Get shares where I am the owner
    const sharedByMeResult = await db_1.pool.query(`SELECT sa.*, u.email as owner_email, u.full_name as owner_full_name
     FROM shared_accounts sa
     JOIN users u ON sa.owner_user_id = u.id
     WHERE sa.owner_user_id = $1
     ORDER BY sa.created_at DESC`, [userId]);
    // Get shares where I am the recipient
    const sharedWithMeResult = await db_1.pool.query(`SELECT sa.*, u.email as owner_email, u.full_name as owner_full_name
     FROM shared_accounts sa
     JOIN users u ON sa.owner_user_id = u.id
     WHERE LOWER(sa.shared_with_email) = LOWER($1) OR sa.shared_with_user_id = $2
     ORDER BY sa.created_at DESC`, [userEmail, userId]);
    const mapShare = (row) => ({
        id: row.id,
        ownerUserId: Number(row.owner_user_id),
        ownerEmail: row.owner_email,
        ownerFullName: row.owner_full_name,
        sharedWithEmail: row.shared_with_email,
        sharedWithUserId: row.shared_with_user_id ? Number(row.shared_with_user_id) : null,
        status: row.status,
        permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || auth_types_1.DEFAULT_SHARE_PERMISSIONS),
        expiresAt: row.expires_at,
        acceptedAt: row.accepted_at,
        revokedAt: row.revoked_at,
        createdAt: row.created_at,
    });
    return {
        sharedByMe: sharedByMeResult.rows.map(mapShare),
        sharedWithMe: sharedWithMeResult.rows.map(mapShare),
    };
};
exports.getSharedAccountsService = getSharedAccountsService;
/**
 * Revoke a shared account
 */
const revokeShareService = async (userId, body) => {
    const { shareId } = body;
    // Find the share
    const shareResult = await db_1.pool.query('SELECT * FROM shared_accounts WHERE id = $1 AND owner_user_id = $2', [shareId, userId]);
    if (!shareResult.rowCount) {
        throw new errors_1.NotFoundError('Share not found or you are not the owner');
    }
    const share = shareResult.rows[0];
    if (share.status === 'revoked') {
        throw new errors_1.ValidationError('This share has already been revoked');
    }
    // Update the share status
    await db_1.pool.query(`UPDATE shared_accounts SET status = 'revoked', revoked_at = NOW(), updated_at = NOW() WHERE id = $1`, [shareId]);
    // Notify the shared user if they exist
    if (share.shared_with_user_id) {
        const ownerResult = await db_1.pool.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
        const owner = ownerResult.rows[0];
        await db_1.pool.query(`INSERT INTO notifications (user_id, type, title, message, metadata)
       VALUES ($1, 'share_revoked', $2, $3, $4)`, [
            share.shared_with_user_id,
            'Account Access Revoked',
            `${owner.full_name || owner.email} has revoked your access to their account.`,
            JSON.stringify({ shareId, ownerEmail: owner.email }),
        ]);
        // Emit force logout event via WebSocket to immediately log out the shared user
        // NOTE: Shared users are connected to the OWNER's WebSocket room (because their JWT has userId: owner.id)
        // So we emit to owner_user_id (which is the current userId), not shared_with_user_id
        const { emitForceLogout } = await Promise.resolve().then(() => __importStar(require('../../websocket/notificationEmitter')));
        emitForceLogout(userId, {
            reason: 'share_revoked',
            message: `${owner.full_name || owner.email} has revoked your access to their account. You have been logged out.`,
            shareId: share.id, // Include shareId so frontend can check if this session should be logged out
        });
    }
    return { message: 'Account share revoked successfully' };
};
exports.revokeShareService = revokeShareService;
/**
 * Update permissions for a shared account
 */
const updateSharePermissionsService = async (userId, body) => {
    const { shareId, permissions } = body;
    // Find the share
    const shareResult = await db_1.pool.query('SELECT * FROM shared_accounts WHERE id = $1 AND owner_user_id = $2', [shareId, userId]);
    if (!shareResult.rowCount) {
        throw new errors_1.NotFoundError('Share not found or you are not the owner');
    }
    const share = shareResult.rows[0];
    if (share.status === 'revoked') {
        throw new errors_1.ValidationError('Cannot update permissions for a revoked share');
    }
    // Check if share is expired
    if (new Date(share.expires_at) < new Date()) {
        throw new errors_1.ValidationError('Cannot update permissions for an expired share');
    }
    // Update permissions
    await db_1.pool.query(`UPDATE shared_accounts SET permissions = $1, updated_at = NOW() WHERE id = $2`, [JSON.stringify(permissions), shareId]);
    // Get updated share data
    const updatedShareResult = await db_1.pool.query('SELECT * FROM shared_accounts WHERE id = $1', [shareId]);
    const updatedShare = updatedShareResult.rows[0];
    // Get owner info
    const ownerResult = await db_1.pool.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    const owner = ownerResult.rows[0];
    // Notify the shared user if they have accepted the share
    if (share.shared_with_user_id && share.status === 'accepted') {
        // Insert notification into database
        const notificationResult = await db_1.pool.query(`INSERT INTO notifications (user_id, type, title, message, metadata)
       VALUES ($1, 'permissions_updated', $2, $3, $4)
       RETURNING *`, [
            share.shared_with_user_id,
            'Permissions Updated',
            `${owner.full_name || owner.email} has updated your access permissions.`,
            JSON.stringify({ shareId, ownerEmail: owner.email, permissions }),
        ]);
        const notification = notificationResult.rows[0];
        // Emit real-time notification for the bell icon
        const { emitNotification, emitPermissionsUpdated } = await Promise.resolve().then(() => __importStar(require('../../websocket/notificationEmitter')));
        // Emit notification for the bell
        emitNotification(String(share.shared_with_user_id), {
            id: notification.id,
            userId: notification.user_id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            metadata: notification.metadata,
            readAt: notification.read_at,
            createdAt: notification.created_at,
        });
        // Emit permissions update for auto-refresh of UI
        emitPermissionsUpdated(String(share.shared_with_user_id), {
            shareId: share.id,
            permissions: permissions,
            message: `${owner.full_name || owner.email} has updated your access permissions.`,
        });
    }
    // Map the updated share to DTO
    const shareDto = {
        id: updatedShare.id,
        ownerUserId: Number(updatedShare.owner_user_id),
        ownerEmail: owner.email,
        ownerFullName: owner.full_name,
        sharedWithEmail: updatedShare.shared_with_email,
        sharedWithUserId: updatedShare.shared_with_user_id ? Number(updatedShare.shared_with_user_id) : null,
        status: updatedShare.status,
        permissions: typeof updatedShare.permissions === 'string'
            ? JSON.parse(updatedShare.permissions)
            : (updatedShare.permissions || auth_types_1.DEFAULT_SHARE_PERMISSIONS),
        expiresAt: updatedShare.expires_at,
        acceptedAt: updatedShare.accepted_at,
        revokedAt: updatedShare.revoked_at,
        createdAt: updatedShare.created_at,
    };
    return {
        share: shareDto,
        message: 'Permissions updated successfully',
    };
};
exports.updateSharePermissionsService = updateSharePermissionsService;
/**
 * Delete a shared account record (removes it completely from database)
 */
const deleteShareService = async (userId, shareId) => {
    // Find the share
    const shareResult = await db_1.pool.query('SELECT * FROM shared_accounts WHERE id = $1 AND owner_user_id = $2', [shareId, userId]);
    if (!shareResult.rowCount) {
        throw new errors_1.NotFoundError('Share not found or you are not the owner');
    }
    const share = shareResult.rows[0];
    // If share is still active, force logout the user first
    if (share.status !== 'revoked' && share.shared_with_user_id) {
        const ownerResult = await db_1.pool.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
        const owner = ownerResult.rows[0];
        // Emit force logout event
        const { emitForceLogout } = await Promise.resolve().then(() => __importStar(require('../../websocket/notificationEmitter')));
        emitForceLogout(userId, {
            reason: 'share_revoked',
            message: `${owner.full_name || owner.email} has revoked your access to their account. You have been logged out.`,
            shareId: share.id,
        });
    }
    // Delete associated permission requests first (foreign key constraint)
    await db_1.pool.query('DELETE FROM permission_requests WHERE share_id = $1', [shareId]);
    // Delete the share record
    await db_1.pool.query('DELETE FROM shared_accounts WHERE id = $1', [shareId]);
    return { message: 'Share record deleted successfully' };
};
exports.deleteShareService = deleteShareService;
/**
 * Login to a shared account using temp password
 */
const sharedLoginService = async (body) => {
    const { ownerEmail, tempPassword } = body;
    // Find the owner user
    const ownerResult = await db_1.pool.query('SELECT id, email, full_name, deactivated_at FROM users WHERE LOWER(email) = LOWER($1)', [ownerEmail]);
    if (!ownerResult.rowCount) {
        throw new errors_1.AuthenticationError('Invalid credentials');
    }
    const owner = ownerResult.rows[0];
    if (owner.deactivated_at) {
        throw new errors_1.AuthenticationError('This account has been deactivated');
    }
    // Find a valid share for this owner
    const shareResult = await db_1.pool.query(`SELECT * FROM shared_accounts 
     WHERE owner_user_id = $1 AND status IN ('pending', 'accepted') AND expires_at > NOW()
     ORDER BY created_at DESC`, [owner.id]);
    if (!shareResult.rowCount) {
        throw new errors_1.AuthenticationError('Invalid credentials');
    }
    // Try to match the temp password against any active share
    let validShare = null;
    for (const share of shareResult.rows) {
        const isValid = await bcrypt_1.default.compare(tempPassword, share.temp_password_hash);
        if (isValid) {
            validShare = share;
            break;
        }
    }
    if (!validShare) {
        throw new errors_1.AuthenticationError('Invalid credentials');
    }
    // Update share status to accepted if pending
    if (validShare.status === 'pending') {
        await db_1.pool.query(`UPDATE shared_accounts SET status = 'accepted', accepted_at = NOW(), updated_at = NOW() WHERE id = $1`, [validShare.id]);
        // Notify the owner that share was accepted
        await db_1.pool.query(`INSERT INTO notifications (user_id, type, title, message, metadata)
       VALUES ($1, 'share_accepted', $2, $3, $4)`, [
            owner.id,
            'Account Access Accepted',
            `${validShare.shared_with_email} has accepted access to your account.`,
            JSON.stringify({ shareId: validShare.id, sharedWithEmail: validShare.shared_with_email }),
        ]);
    }
    // Parse permissions from the share
    const sharePermissions = typeof validShare.permissions === 'string'
        ? JSON.parse(validShare.permissions)
        : (validShare.permissions || auth_types_1.DEFAULT_SHARE_PERMISSIONS);
    // Generate token for the owner's account (shared access)
    const token = jsonwebtoken_1.default.sign({
        userId: owner.id,
        email: owner.email,
        fullName: owner.full_name ?? undefined,
        isSharedAccess: true,
        shareId: validShare.id,
        sharedWithEmail: validShare.shared_with_email,
        permissions: sharePermissions,
    }, env_1.config.jwt.secret, { expiresIn: env_1.config.jwt.expiresIn });
    return { token };
};
exports.sharedLoginService = sharedLoginService;
// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================
/**
 * Get notifications for a user
 */
const getNotificationsService = async (userId, isSharedAccess = false, shareId) => {
    let result;
    let unreadResult;
    if (isSharedAccess && shareId) {
        // For shared users, only show notifications related to their share
        // This includes: request_approved, request_rejected, and permissions_updated for their shareId
        result = await db_1.pool.query(`SELECT * FROM notifications 
       WHERE user_id = $1 
       AND (
         (type IN ('request_approved', 'request_rejected', 'permissions_updated') 
          AND metadata::jsonb->>'shareId' = $2)
       )
       ORDER BY created_at DESC LIMIT 50`, [userId, String(shareId)]);
        unreadResult = await db_1.pool.query(`SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = $1 AND read_at IS NULL
       AND (
         (type IN ('request_approved', 'request_rejected', 'permissions_updated') 
          AND metadata::jsonb->>'shareId' = $2)
       )`, [userId, String(shareId)]);
    }
    else {
        // For account owners, show all their notifications EXCEPT request_approved/request_rejected
        // (those are for shared users only)
        result = await db_1.pool.query(`SELECT * FROM notifications 
       WHERE user_id = $1 
       AND type NOT IN ('request_approved', 'request_rejected')
       ORDER BY created_at DESC LIMIT 50`, [userId]);
        unreadResult = await db_1.pool.query(`SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = $1 AND read_at IS NULL
       AND type NOT IN ('request_approved', 'request_rejected')`, [userId]);
    }
    const notifications = result.rows.map((row) => ({
        id: row.id,
        userId: Number(row.user_id),
        type: row.type,
        title: row.title,
        message: row.message,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
        readAt: row.read_at,
        createdAt: row.created_at,
    }));
    return {
        notifications,
        unreadCount: parseInt(unreadResult.rows[0].count, 10),
    };
};
exports.getNotificationsService = getNotificationsService;
/**
 * Mark a notification as read
 */
const markNotificationReadService = async (userId, notificationId) => {
    const result = await db_1.pool.query(`UPDATE notifications SET read_at = NOW(), updated_at = NOW() 
     WHERE id = $1 AND user_id = $2 AND read_at IS NULL`, [notificationId, userId]);
    if (!result.rowCount) {
        throw new errors_1.NotFoundError('Notification not found or already read');
    }
    return { message: 'Notification marked as read' };
};
exports.markNotificationReadService = markNotificationReadService;
/**
 * Mark all notifications as read
 */
const markAllNotificationsReadService = async (userId) => {
    await db_1.pool.query(`UPDATE notifications SET read_at = NOW(), updated_at = NOW() 
     WHERE user_id = $1 AND read_at IS NULL`, [userId]);
    return { message: 'All notifications marked as read' };
};
exports.markAllNotificationsReadService = markAllNotificationsReadService;
/**
 * Delete a notification
 */
const deleteNotificationService = async (userId, notificationId) => {
    const result = await db_1.pool.query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [notificationId, userId]);
    if (!result.rowCount) {
        throw new errors_1.NotFoundError('Notification not found');
    }
    return { message: 'Notification deleted' };
};
exports.deleteNotificationService = deleteNotificationService;
// ============================================================================
// PERMISSION REQUEST SERVICES
// ============================================================================
const formatPermissionName = (permission) => {
    const names = {
        createDatabase: 'create databases',
        connectDatabase: 'connect databases',
        createTable: 'create tables',
        addColumn: 'add columns',
        editColumn: 'edit columns',
        deleteColumn: 'delete columns',
        deleteTable: 'delete tables',
        viewTableData: 'view table data',
        editTableData: 'edit table data',
        runQuery: 'run queries',
        createApiInQueryBuilder: 'create APIs in query builder',
        tryAutoGeneratedApis: 'try auto-generated APIs',
        tryOpenApi: 'try OpenAPI',
    };
    return names[permission] || permission;
};
/**
 * Create a permission request from a shared user
 */
const createPermissionRequestService = async (userId, shareId, body) => {
    const { permission, message } = body;
    // Get the share record to verify the user and get owner info
    const shareResult = await db_1.pool.query('SELECT * FROM shared_accounts WHERE id = $1', [shareId]);
    if (!shareResult.rowCount) {
        throw new errors_1.NotFoundError('Share not found');
    }
    const share = shareResult.rows[0];
    // Verify the share belongs to the owner account being accessed (userId is the owner's ID for shared access)
    // Use loose comparison to handle both string and number types
    if (String(share.owner_user_id) !== String(userId)) {
        throw new errors_1.AuthorizationError('Not authorized to make this request');
    }
    // Check if share is still active
    if (share.status === 'revoked' || new Date(share.expires_at) < new Date()) {
        throw new errors_1.ValidationError('This share is no longer active');
    }
    // Parse permissions if it's a string (JSONB from postgres)
    const permissions = typeof share.permissions === 'string'
        ? JSON.parse(share.permissions)
        : share.permissions;
    // Check if already has this permission
    if (permissions[permission]) {
        throw new errors_1.ValidationError('You already have this permission');
    }
    // Check for existing pending request for the same permission
    const existingRequest = await db_1.pool.query(`SELECT * FROM permission_requests 
     WHERE share_id = $1 AND permission = $2 AND status = 'pending'`, [shareId, permission]);
    if (existingRequest.rowCount && existingRequest.rowCount > 0) {
        throw new errors_1.ConflictError('A request for this permission is already pending');
    }
    // Delete any rejected requests for this permission (to allow re-requesting)
    await db_1.pool.query(`DELETE FROM permission_requests 
     WHERE share_id = $1 AND permission = $2 AND status = 'rejected'`, [shareId, permission]);
    // Create the permission request (requested_by stores the owner user id since shared users access the owner's account)
    // The actual requester info comes from the share record
    const requestResult = await db_1.pool.query(`INSERT INTO permission_requests (share_id, requested_by, owner_user_id, permission, status, message)
     VALUES ($1, $2, $3, $4, 'pending', $5)
     RETURNING *`, [shareId, share.owner_user_id, share.owner_user_id, permission, message || null]);
    const request = requestResult.rows[0];
    // Use the shared user's email from the share record
    const requesterEmail = share.shared_with_email;
    // Create notification for the owner
    const notificationResult = await db_1.pool.query(`INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, 'permission_request', $2, $3, $4)
     RETURNING *`, [
        share.owner_user_id,
        'Permission Request',
        `${requesterEmail} is requesting permission to ${formatPermissionName(permission)}.`,
        JSON.stringify({
            requestId: request.id,
            shareId,
            permission,
            requesterEmail,
            message: message || null,
        }),
    ]);
    const notification = notificationResult.rows[0];
    // Emit real-time notification to owner
    const { emitNotification } = await Promise.resolve().then(() => __importStar(require('../../websocket/notificationEmitter')));
    emitNotification(String(share.owner_user_id), {
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
        readAt: notification.read_at,
        createdAt: notification.created_at,
    });
    return {
        request: {
            id: request.id,
            shareId: request.share_id,
            requestedBy: request.requested_by,
            requestedByEmail: requesterEmail,
            requestedByName: null, // Shared users don't have accounts, so no name
            ownerUserId: request.owner_user_id,
            permission: request.permission,
            status: request.status,
            message: request.message,
            responseMessage: request.response_message,
            createdAt: request.created_at,
            respondedAt: request.responded_at,
        },
    };
};
exports.createPermissionRequestService = createPermissionRequestService;
/**
 * Get pending permission requests for the current user (as owner)
 */
const getPermissionRequestsService = async (userId) => {
    const result = await db_1.pool.query(`SELECT pr.*, sa.shared_with_email as requester_email
     FROM permission_requests pr
     JOIN shared_accounts sa ON sa.id = pr.share_id
     WHERE pr.owner_user_id = $1
     ORDER BY pr.created_at DESC`, [userId]);
    const requests = result.rows.map((row) => ({
        id: row.id,
        shareId: row.share_id,
        requestedBy: row.requested_by,
        requestedByEmail: row.requester_email,
        requestedByName: null, // Shared users don't have accounts
        ownerUserId: row.owner_user_id,
        permission: row.permission,
        status: row.status,
        message: row.message,
        responseMessage: row.response_message,
        createdAt: row.created_at,
        respondedAt: row.responded_at,
    }));
    return { requests };
};
exports.getPermissionRequestsService = getPermissionRequestsService;
/**
 * Get permission requests made by the current user (as shared user)
 * Note: userId here is actually the owner's user ID since shared users access the owner's account
 */
const getMyPermissionRequestsService = async (userId, shareId) => {
    // For shared users, we need to get requests by share_id since requested_by is the owner's user id
    // The shareId should be passed from the controller when available
    const result = await db_1.pool.query(`SELECT pr.*, sa.shared_with_email as requester_email
     FROM permission_requests pr
     JOIN shared_accounts sa ON sa.id = pr.share_id
     WHERE pr.owner_user_id = $1${shareId ? ' AND pr.share_id = $2' : ''}
     ORDER BY pr.created_at DESC`, shareId ? [userId, shareId] : [userId]);
    const requests = result.rows.map((row) => ({
        id: row.id,
        shareId: row.share_id,
        requestedBy: row.requested_by,
        requestedByEmail: row.requester_email,
        requestedByName: null,
        ownerUserId: row.owner_user_id,
        permission: row.permission,
        status: row.status,
        message: row.message,
        responseMessage: row.response_message,
        createdAt: row.created_at,
        respondedAt: row.responded_at,
    }));
    return { requests };
};
exports.getMyPermissionRequestsService = getMyPermissionRequestsService;
/**
 * Respond to a permission request (approve or reject)
 */
const respondPermissionRequestService = async (userId, body) => {
    const { requestId, action, message } = body;
    // Get the permission request
    const requestResult = await db_1.pool.query('SELECT * FROM permission_requests WHERE id = $1', [requestId]);
    if (!requestResult.rowCount) {
        throw new errors_1.NotFoundError('Permission request not found');
    }
    const request = requestResult.rows[0];
    // Verify the current user is the owner
    if (String(request.owner_user_id) !== String(userId)) {
        throw new errors_1.AuthorizationError('Not authorized to respond to this request');
    }
    // Check if already responded
    if (request.status !== 'pending') {
        throw new errors_1.ValidationError('This request has already been responded to');
    }
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    // Update the request
    await db_1.pool.query(`UPDATE permission_requests 
     SET status = $1, response_message = $2, responded_at = NOW(), updated_at = NOW()
     WHERE id = $3`, [newStatus, message || null, requestId]);
    // Get share and requester info
    const shareResult = await db_1.pool.query('SELECT * FROM shared_accounts WHERE id = $1', [request.share_id]);
    const share = shareResult.rows[0];
    const ownerResult = await db_1.pool.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    const owner = ownerResult.rows[0];
    // If approved, update the share permissions
    if (action === 'approve') {
        const updatedPermissions = {
            ...share.permissions,
            [request.permission]: true,
        };
        await db_1.pool.query(`UPDATE shared_accounts SET permissions = $1, updated_at = NOW() WHERE id = $2`, [JSON.stringify(updatedPermissions), request.share_id]);
        // Create notification for the shared user (stored with owner's user_id but filtered by shareId for shared users)
        await db_1.pool.query(`INSERT INTO notifications (user_id, type, title, message, metadata)
       VALUES ($1, 'request_approved', $2, $3, $4)`, [
            share.owner_user_id,
            'Permission Request Approved',
            `${owner.full_name || owner.email} approved your request to ${formatPermissionName(request.permission)}.`,
            JSON.stringify({
                requestId,
                shareId: request.share_id,
                permission: request.permission,
                action,
            }),
        ]);
        // Emit permissions update to the shared user via share room
        // This handles both updating permissions in localStorage AND notifying the UI
        const { emitPermissionsUpdated } = await Promise.resolve().then(() => __importStar(require('../../websocket/notificationEmitter')));
        emitPermissionsUpdated(String(share.owner_user_id), {
            shareId: share.id,
            permissions: updatedPermissions,
            message: `Your permission request for "${formatPermissionName(request.permission)}" has been approved.`,
        });
    }
    else {
        // Create notification for the shared user (stored with owner's user_id but filtered by shareId for shared users)
        await db_1.pool.query(`INSERT INTO notifications (user_id, type, title, message, metadata)
       VALUES ($1, 'request_rejected', $2, $3, $4)`, [
            share.owner_user_id,
            'Permission Request Rejected',
            `${owner.full_name || owner.email} rejected your request to ${formatPermissionName(request.permission)}.${message ? ` Reason: ${message}` : ''}`,
            JSON.stringify({
                requestId,
                shareId: request.share_id,
                permission: request.permission,
                action,
                responseMessage: message || null,
            }),
        ]);
        // Only emit share_notification for rejections (approvals are handled by permissions_updated)
        const { emitNotificationToShare } = await Promise.resolve().then(() => __importStar(require('../../websocket/notificationEmitter')));
        console.log('HERE');
        emitNotificationToShare(request.share_id, {
            type: 'request_rejected',
            title: 'Permission Request Rejected',
            message: `${owner.full_name || owner.email} rejected your request to ${formatPermissionName(request.permission)}.${message ? ` Reason: ${message}` : ''}`,
            metadata: JSON.stringify({
                requestId,
                shareId: request.share_id,
                permission: request.permission,
                action,
                responseMessage: message || null,
            }),
        });
    }
    // Delete the original permission_request notification from owner's notifications
    await db_1.pool.query(`DELETE FROM notifications 
     WHERE user_id = $1 
     AND type = 'permission_request' 
     AND (metadata::jsonb)->>'requestId' = $2`, [userId, String(requestId)]);
    return {
        message: action === 'approve'
            ? 'Permission request approved successfully'
            : 'Permission request rejected',
    };
};
exports.respondPermissionRequestService = respondPermissionRequestService;
/**
 * Cancel a pending permission request (by the requester)
 */
const cancelPermissionRequestService = async (userId, requestId, shareId) => {
    // Verify the request exists and belongs to this share
    const result = await db_1.pool.query(`DELETE FROM permission_requests 
     WHERE id = $1 AND share_id = $2 AND status = 'pending'`, [requestId, shareId]);
    if (!result.rowCount) {
        throw new errors_1.NotFoundError('Permission request not found or already responded to');
    }
    return { message: 'Permission request cancelled' };
};
exports.cancelPermissionRequestService = cancelPermissionRequestService;
//# sourceMappingURL=auth.service.js.map