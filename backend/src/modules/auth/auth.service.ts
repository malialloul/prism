import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db';
import {
  SignupRequestDto,
  LoginRequestDto,
  AuthResponseDto,
} from './auth.types';

interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  created_at: Date;
  updated_at: Date;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signupService = async (
  body: SignupRequestDto,
): Promise<AuthResponseDto> => {
  const { email, password, fullName } = body;

  const exists = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE email=$1',
    [email],
  );

  if (exists.rowCount && exists.rowCount > 0) {
    throw new Error('Email already exists');
  }

  const hash = await bcrypt.hash(password, 12);

  const userResult = await pool.query<DbUser>(
    `INSERT INTO users(email, password_hash, full_name)
     VALUES ($1,$2,$3)
     RETURNING id,email,full_name,password_hash`,
    [email, hash, fullName ?? null],
  );

  const user = userResult.rows[0];

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name ?? undefined,
    },
    token,
  };
};

export const loginService = async (
  body: LoginRequestDto,
): Promise<AuthResponseDto> => {
  const { email, password } = body;

  const result = await pool.query<DbUser>(
    'SELECT * FROM users WHERE email=$1',
    [email],
  );

  if (!result.rowCount) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name ?? undefined,
    },
    token,
  };
};
