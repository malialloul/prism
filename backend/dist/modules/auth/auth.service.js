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
exports.login2FAService = exports.disable2FAService = exports.verify2FAService = exports.setup2FAService = exports.get2FAStatusService = exports.changeEmailService = exports.changePasswordService = exports.resetPasswordService = exports.verifyResetCodeService = exports.forgotPasswordService = exports.loginService = exports.signupService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const otplib_1 = require("otplib");
const qrcode = __importStar(require("qrcode"));
const db_1 = require("../../config/db");
const env_1 = require("../../config/env");
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
//# sourceMappingURL=auth.service.js.map