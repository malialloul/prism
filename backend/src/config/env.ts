import dotenv from 'dotenv';
import type { Secret, SignOptions } from 'jsonwebtoken';

// Load environment variables FIRST
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'PG_HOST', 'PG_DATABASE'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Export validated config
export const config = {
  jwt: {
    secret: process.env.JWT_SECRET! as Secret,
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  },
  postgres: {
    host: process.env.PG_HOST!,
    port: parseInt(process.env.PG_PORT || '5432', 10),
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    database: process.env.PG_DATABASE!,
  },
  server: {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  transmissionKey: process.env.TRANSMISSION_KEY || 'default-transmission-key-change-in-production',
};
