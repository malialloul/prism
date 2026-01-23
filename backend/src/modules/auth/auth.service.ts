import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../../config/db';
import { config } from '../../config/env';
import type {
  SignupDto,
  LoginDto,
  ForgotPasswordDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
  ChangePasswordDto,
  TokenResponseDto,
  MessageResponseDto,
  DbUserDto,
  DbPasswordResetTokenDto,
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
): Promise<TokenResponseDto> => {
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
): Promise<{ message: string }> => {
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
): Promise<{ valid: boolean }> => {
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
): Promise<{ message: string }> => {
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
): Promise<{ message: string }> => {
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
    throw new AuthenticationError('Current password is incorrect');
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
