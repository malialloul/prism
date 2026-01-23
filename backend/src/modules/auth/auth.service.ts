import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db';
import { config } from '../../config/env';
import {
  SignupDto,
  LoginDto,
} from './auth.types';
import { ConflictError, AuthenticationError } from '../../utils/errors';
import type { TokenResponseDto } from './auth.types';

interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  created_at: Date;
  updated_at: Date;
}

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

  const userResult = await pool.query<DbUser>(
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

  const result = await pool.query<DbUser>(
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
