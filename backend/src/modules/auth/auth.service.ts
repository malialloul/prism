import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { generateSecret, verify as verifyOtp, generateURI } from 'otplib';
import * as qrcode from 'qrcode';
import { pool } from '../../config/db';
import { config } from '../../config/env';
import type {
  SignupDto,
  LoginDto,
  ForgotPasswordDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
  ChangePasswordDto,
  ChangeEmailDto,
  Setup2FADto,
  Verify2FADto,
  Disable2FADto,
  Login2FADto,
  DeactivateAccountDto,
  DeleteAccountDto,
  TokenResponseDto,
  TwoFactorRequiredDto,
  VerifyCodeResultDto,
  Setup2FAResultDto,
  Verify2FAResultDto,
  TwoFactorStatusDto,
  ChangeEmailResultDto,
  MessageResponseDto,
  DbUserDto,
  DbPasswordResetTokenDto,
  DbBackupCodeDto,
} from './auth.types';
import { ConflictError, AuthenticationError, NotFoundError, ValidationError } from '../../utils/errors';

export const signupService = async (
  body: SignupDto,
): Promise<TokenResponseDto> => {
  const { email, password, fullName } = body;

  const exists = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE email=$1',
    [email],
  );

  if (exists.rowCount && exists.rowCount > 0) {
    throw new ConflictError('An account with this email already exists');
  }

  const hash = await bcrypt.hash(password, 12);

  const userResult = await pool.query<DbUserDto>(
    `INSERT INTO users(email, password_hash, full_name)
     VALUES ($1,$2,$3)
     RETURNING id,email,full_name,password_hash`,
    [email, hash, fullName ?? null],
  );

  const user = userResult.rows[0];

  // Token contains encrypted user details
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      fullName: user.full_name ?? undefined,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

  return { token };
};

export const loginService = async (
  body: LoginDto,
): Promise<TokenResponseDto | TwoFactorRequiredDto> => {
  const { email, password } = body;

  const result = await pool.query<DbUserDto>(
    'SELECT * FROM users WHERE email=$1',
    [email],
  );

  if (!result.rowCount) {
    throw new AuthenticationError('Invalid email or password');
  }

  const user = result.rows[0];

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AuthenticationError('Invalid email or password');

  // Check if account is deactivated and reactivate it
  if (user.deactivated_at) {
    await pool.query(
      'UPDATE users SET deactivated_at = NULL, updated_at = NOW() WHERE id = $1',
      [user.id],
    );
    console.log(`Account reactivated for user: ${user.email}`);
  }

  // Check if 2FA is enabled
  if (user.two_factor_enabled && user.two_factor_secret) {
    // Generate a temporary token for 2FA verification
    const tempToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        purpose: '2fa-verification',
      },
      config.jwt.secret,
      { expiresIn: '5m' }, // Short-lived token for 2FA
    );
    
    return { requires2FA: true, tempToken, email: user.email };
  }

  // Token contains encrypted user details
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      fullName: user.full_name ?? undefined,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

  return { token };
};

/**
 * Generate a 6-digit OTP code
 */
const generateOtpCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Request password reset - sends OTP to email
 */
export const forgotPasswordService = async (
  body: ForgotPasswordDto,
): Promise<MessageResponseDto> => {
  const { email } = body;

  // Find user by email
  const userResult = await pool.query<DbUserDto>(
    'SELECT id, email FROM users WHERE email=$1',
    [email],
  );

  // Always return success to prevent email enumeration
  if (!userResult.rowCount) {
    console.log(`Password reset requested for non-existent email: ${email}`);
    return { message: 'If an account exists with this email, you will receive a reset code.' };
  }

  const user = userResult.rows[0];

  // Invalidate any existing tokens for this user
  await pool.query(
    'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
    [user.id],
  );

  // Generate OTP code
  const otpCode = generateOtpCode();
  console.log(`🔐 Password reset code for ${email}: ${otpCode}`);
  
  // Hash the OTP for storage
  const hashedToken = await bcrypt.hash(otpCode, 10);
  
  // Token expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Store the token
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, hashedToken, expiresAt],
  );

  return { message: 'If an account exists with this email, you will receive a reset code.' };
};

/**
 * Verify reset code is valid
 */
export const verifyResetCodeService = async (
  body: VerifyResetCodeDto,
): Promise<VerifyCodeResultDto> => {
  const { email, code } = body;

  // Find user
  const userResult = await pool.query<DbUserDto>(
    'SELECT id FROM users WHERE email=$1',
    [email],
  );

  if (!userResult.rowCount) {
    return { valid: false };
  }

  const user = userResult.rows[0];

  // Find valid token
  const tokenResult = await pool.query<DbPasswordResetTokenDto>(
    `SELECT * FROM password_reset_tokens 
     WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [user.id],
  );

  if (!tokenResult.rowCount) {
    return { valid: false };
  }

  const resetToken = tokenResult.rows[0];

  // Verify the code
  const valid = await bcrypt.compare(code, resetToken.token);
  
  return { valid };
};

/**
 * Reset password with valid code
 */
export const resetPasswordService = async (
  body: ResetPasswordDto,
): Promise<MessageResponseDto> => {
  const { email, code, newPassword } = body;

  // Find user
  const userResult = await pool.query<DbUserDto>(
    'SELECT id FROM users WHERE email=$1',
    [email],
  );

  if (!userResult.rowCount) {
    throw new NotFoundError('Invalid reset request');
  }

  const user = userResult.rows[0];

  // Find valid token
  const tokenResult = await pool.query<DbPasswordResetTokenDto>(
    `SELECT * FROM password_reset_tokens 
     WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [user.id],
  );

  if (!tokenResult.rowCount) {
    throw new ValidationError('Reset code has expired. Please request a new one.');
  }

  const resetToken = tokenResult.rows[0];

  // Verify the code
  const valid = await bcrypt.compare(code, resetToken.token);
  if (!valid) {
    throw new ValidationError('Invalid reset code');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [hashedPassword, user.id],
  );

  // Mark token as used
  await pool.query(
    'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
    [resetToken.id],
  );

  return { message: 'Password reset successfully' };
};

/**
 * Change password for authenticated user
 */
export const changePasswordService = async (
  userId: string,
  body: ChangePasswordDto,
): Promise<MessageResponseDto> => {
  const { currentPassword, newPassword } = body;

  // Find user
  const userResult = await pool.query<DbUserDto>(
    'SELECT id, password_hash FROM users WHERE id = $1',
    [userId],
  );

  if (!userResult.rowCount) {
    throw new NotFoundError('User not found');
  }

  const user = userResult.rows[0];

  // Verify current password
  const validCurrentPassword = await bcrypt.compare(currentPassword, user.password_hash);
  if (!validCurrentPassword) {
    throw new ValidationError('Current password is incorrect');
  }

  // Check if new password is same as current password
  const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
  if (isSamePassword) {
    throw new ValidationError('New password must be different from current password');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [hashedPassword, userId],
  );

  return { message: 'Password changed successfully' };
};

/**
 * Change email for authenticated user
 */
export const changeEmailService = async (
  userId: string,
  body: ChangeEmailDto,
): Promise<ChangeEmailResultDto> => {
  const { newEmail, password } = body;

  // Find user
  const userResult = await pool.query<DbUserDto>(
    'SELECT id, email, password_hash, full_name FROM users WHERE id = $1',
    [userId],
  );

  if (!userResult.rowCount) {
    throw new NotFoundError('User not found');
  }

  const user = userResult.rows[0];

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new ValidationError('Password is incorrect');
  }

  // Check if new email is same as current email
  if (newEmail.toLowerCase() === user.email.toLowerCase()) {
    throw new ValidationError('New email must be different from current email');
  }

  // Check if email already exists
  const existingEmail = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE email = $1 AND id != $2',
    [newEmail.toLowerCase(), userId],
  );

  if (existingEmail.rowCount && existingEmail.rowCount > 0) {
    throw new ConflictError('An account with this email already exists');
  }

  // Update email
  await pool.query(
    'UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2',
    [newEmail.toLowerCase(), userId],
  );

  // Generate new token with updated email
  const token = jwt.sign(
    {
      userId: user.id,
      email: newEmail.toLowerCase(),
      fullName: user.full_name ?? undefined,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

  return { token, message: 'Email changed successfully' };
};

/**
 * Get 2FA status for authenticated user
 */
export const get2FAStatusService = async (
  userId: string,
): Promise<TwoFactorStatusDto> => {
  const userResult = await pool.query<DbUserDto>(
    'SELECT two_factor_enabled FROM users WHERE id = $1',
    [userId],
  );

  if (!userResult.rowCount) {
    throw new NotFoundError('User not found');
  }

  return { enabled: userResult.rows[0].two_factor_enabled };
};

/**
 * Setup 2FA for authenticated user - generates secret and QR code
 */
export const setup2FAService = async (
  userId: string,
  body: Setup2FADto,
): Promise<Setup2FAResultDto> => {
  const { password } = body;

  // Find user
  const userResult = await pool.query<DbUserDto>(
    'SELECT id, email, password_hash, two_factor_enabled FROM users WHERE id = $1',
    [userId],
  );

  if (!userResult.rowCount) {
    throw new NotFoundError('User not found');
  }

  const user = userResult.rows[0];

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new ValidationError('Password is incorrect');
  }

  // Check if 2FA is already enabled
  if (user.two_factor_enabled) {
    throw new ValidationError('Two-factor authentication is already enabled');
  }

  // Generate secret
  const secret = generateSecret();

  // Store secret (not yet enabled)
  await pool.query(
    'UPDATE users SET two_factor_secret = $1, updated_at = NOW() WHERE id = $2',
    [secret, userId],
  );

  // Generate QR code
  const otpauth = generateURI({
    issuer: 'Prism',
    label: user.email,
    secret,
  });
  const qrCode = await qrcode.toDataURL(otpauth);

  return { qrCode, secret };
};

/**
 * Verify 2FA code and enable 2FA
 */
export const verify2FAService = async (
  userId: string,
  body: Verify2FADto,
): Promise<Verify2FAResultDto> => {
  const { code } = body;

  // Find user
  const userResult = await pool.query<DbUserDto>(
    'SELECT id, two_factor_secret, two_factor_enabled FROM users WHERE id = $1',
    [userId],
  );

  if (!userResult.rowCount) {
    throw new NotFoundError('User not found');
  }

  const user = userResult.rows[0];

  if (!user.two_factor_secret) {
    throw new ValidationError('Please setup 2FA first');
  }

  if (user.two_factor_enabled) {
    throw new ValidationError('Two-factor authentication is already enabled');
  }

  // Verify the code (must be from authenticator app during setup)
  const totpResult = await verifyOtp({ token: code, secret: user.two_factor_secret });
  console.log('DEBUG verify2FA - code:', code, 'totpResult:', totpResult, 'type:', typeof totpResult, 'JSON:', JSON.stringify(totpResult));
  
  // otplib v13 may return an object with .valid property or boolean
  const isValid = typeof totpResult === 'boolean' ? totpResult : (totpResult as any)?.valid;
  if (!isValid) {
    throw new ValidationError('Invalid verification code');
  }

  // Enable 2FA
  await pool.query(
    'UPDATE users SET two_factor_enabled = true, updated_at = NOW() WHERE id = $1',
    [userId],
  );

  // Delete any existing backup codes for this user
  await pool.query('DELETE FROM backup_codes WHERE user_id = $1', [userId]);

  // Generate backup codes (6-digit numbers)
  const backupCodes = Array.from({ length: 8 }, () => 
    crypto.randomInt(100000, 999999).toString()
  );

  // Hash and store backup codes
  for (const code of backupCodes) {
    const codeHash = await bcrypt.hash(code, 10);
    await pool.query(
      'INSERT INTO backup_codes (user_id, code_hash) VALUES ($1, $2)',
      [userId, codeHash],
    );
  }

  return { backupCodes };
};

/**
 * Disable 2FA for authenticated user
 */
export const disable2FAService = async (
  userId: string,
  body: Disable2FADto,
): Promise<MessageResponseDto> => {
  const { password, code } = body;

  // Find user
  const userResult = await pool.query<DbUserDto>(
    'SELECT id, password_hash, two_factor_secret, two_factor_enabled FROM users WHERE id = $1',
    [userId],
  );

  if (!userResult.rowCount) {
    throw new NotFoundError('User not found');
  }

  const user = userResult.rows[0];

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new ValidationError('Password is incorrect');
  }

  if (!user.two_factor_enabled || !user.two_factor_secret) {
    throw new ValidationError('Two-factor authentication is not enabled');
  }

  // First try TOTP verification
  const totpResult = await verifyOtp({ token: code, secret: user.two_factor_secret });
  // otplib v13 returns object with .valid property
  let isValid = typeof totpResult === 'boolean' ? totpResult : (totpResult as any)?.valid;

  // If TOTP fails, check if it's a backup code
  if (!isValid) {
    const backupCodes = await pool.query<DbBackupCodeDto>(
      'SELECT * FROM backup_codes WHERE user_id = $1 AND used_at IS NULL',
      [userId],
    );

    for (const backupCode of backupCodes.rows) {
      const matches = await bcrypt.compare(code, backupCode.code_hash);
      if (matches) {
        // Mark backup code as used
        await pool.query(
          'UPDATE backup_codes SET used_at = NOW() WHERE id = $1',
          [backupCode.id],
        );
        isValid = true;
        break;
      }
    }
  }

  if (!isValid) {
    throw new ValidationError('Invalid verification code');
  }

  // Disable 2FA
  await pool.query(
    'UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL, updated_at = NOW() WHERE id = $1',
    [userId],
  );

  // Delete backup codes
  await pool.query('DELETE FROM backup_codes WHERE user_id = $1', [userId]);

  return { message: 'Two-factor authentication disabled successfully' };
};

/**
 * Verify 2FA code during login
 */
export const login2FAService = async (
  body: Login2FADto,
): Promise<TokenResponseDto> => {
  const { email, code, tempToken } = body;

  // Verify temp token
  let decoded: { userId: string; email: string; purpose: string };
  try {
    decoded = jwt.verify(tempToken, config.jwt.secret) as typeof decoded;
  } catch {
    throw new AuthenticationError('Invalid or expired session. Please login again.');
  }

  if (decoded.purpose !== '2fa-verification' || decoded.email !== email) {
    throw new AuthenticationError('Invalid session. Please login again.');
  }

  // Find user
  const userResult = await pool.query<DbUserDto>(
    'SELECT id, email, full_name, two_factor_secret, two_factor_enabled FROM users WHERE id = $1',
    [decoded.userId],
  );

  if (!userResult.rowCount) {
    throw new NotFoundError('User not found');
  }

  const user = userResult.rows[0];

  if (!user.two_factor_enabled || !user.two_factor_secret) {
    throw new ValidationError('Two-factor authentication is not enabled');
  }

  // First try TOTP verification
  console.log('DEBUG login2FA - code:', code, 'secret:', user.two_factor_secret);
  const totpResult = await verifyOtp({ token: code, secret: user.two_factor_secret });
  console.log('DEBUG login2FA - totpResult:', totpResult, 'type:', typeof totpResult);

  // otplib v13 returns object with .valid property
  let isValid = typeof totpResult === 'boolean' ? totpResult : (totpResult as any)?.valid;

  // If TOTP fails, check if it's a backup code
  if (!isValid) {
    const backupCodes = await pool.query<DbBackupCodeDto>(
      'SELECT * FROM backup_codes WHERE user_id = $1 AND used_at IS NULL',
      [user.id],
    );

    for (const backupCode of backupCodes.rows) {
      const matches = await bcrypt.compare(code, backupCode.code_hash);
      if (matches) {
        // Mark backup code as used
        await pool.query(
          'UPDATE backup_codes SET used_at = NOW() WHERE id = $1',
          [backupCode.id],
        );
        isValid = true;
        console.log('DEBUG login2FA - used backup code');
        break;
      }
    }
  }

  if (!isValid) {
    throw new ValidationError('Invalid verification code');
  }

  // Generate full auth token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      fullName: user.full_name ?? undefined,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

  return { token };
};

/**
 * Deactivate account for authenticated user
 */
export const deactivateAccountService = async (
  userId: string,
  body: DeactivateAccountDto,
): Promise<MessageResponseDto> => {
  const { password } = body;

  // Find user
  const userResult = await pool.query<DbUserDto>(
    'SELECT id, password_hash, deactivated_at FROM users WHERE id = $1',
    [userId],
  );

  if (!userResult.rowCount) {
    throw new NotFoundError('User not found');
  }

  const user = userResult.rows[0];

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new ValidationError('Password is incorrect');
  }

  // Check if already deactivated
  if (user.deactivated_at) {
    throw new ValidationError('Account is already deactivated');
  }

  // Deactivate the account
  await pool.query(
    'UPDATE users SET deactivated_at = NOW(), updated_at = NOW() WHERE id = $1',
    [userId],
  );

  return { message: 'Account deactivated successfully. You can reactivate by logging in again.' };
};

/**
 * Reactivate a deactivated account during login
 */
export const reactivateAccountService = async (
  userId: string,
): Promise<void> => {
  await pool.query(
    'UPDATE users SET deactivated_at = NULL, updated_at = NOW() WHERE id = $1',
    [userId],
  );
};

/**
 * Delete account permanently for authenticated user
 */
export const deleteAccountService = async (
  userId: string,
  body: DeleteAccountDto,
): Promise<MessageResponseDto> => {
  const { password, confirmation } = body;

  // Verify confirmation text
  if (confirmation !== 'DELETE') {
    throw new ValidationError('Please type DELETE to confirm account deletion');
  }

  // Find user
  const userResult = await pool.query<DbUserDto>(
    'SELECT id, password_hash FROM users WHERE id = $1',
    [userId],
  );

  if (!userResult.rowCount) {
    throw new NotFoundError('User not found');
  }

  const user = userResult.rows[0];

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new ValidationError('Password is incorrect');
  }

  // Delete related data first (foreign key constraints)
  await pool.query('DELETE FROM backup_codes WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);

  // Delete the user
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);

  return { message: 'Account deleted permanently' };
};