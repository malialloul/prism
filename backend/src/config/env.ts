import dotenv from 'dotenv';
import path from 'path';
import type { Secret, SignOptions } from 'jsonwebtoken';

// Determine environment FIRST (before loading env files)
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isDevelopment = nodeEnv === 'development';

// Load environment-specific .env file first, then base .env
// Order: .env.{NODE_ENV}.local > .env.{NODE_ENV} > .env.local > .env
// Later files don't override earlier ones (first value wins)
const envFiles = [
  `.env.${nodeEnv}.local`,  // Highest priority: local env-specific overrides
  `.env.${nodeEnv}`,        // Environment-specific
  '.env.local',             // Local overrides (gitignored)
  '.env',                   // Base config
];

for (const envFile of envFiles) {
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });
}

console.log(`📦 Environment: ${nodeEnv}`);
console.log(`📂 Loaded env files from: ${process.cwd()}`);

// Validate required environment variables (stricter in production)
const requiredEnvVars = ['JWT_SECRET', 'PG_HOST', 'PG_DATABASE'] as const;
const productionRequiredVars = ['TRANSMISSION_KEY'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

if (isProduction) {
  for (const envVar of productionRequiredVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required production environment variable: ${envVar}`);
      process.exit(1);
    }
  }
}

// Export validated config
export const config = {
  env: {
    nodeEnv,
    isProduction,
    isDevelopment,
  },
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
    ssl: process.env.PG_SSL === 'true',
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
  },
  server: {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv,
  },
  transmissionKey: process.env.TRANSMISSION_KEY || 'default-transmission-key-change-in-production',
  neon: {
    apiKey: process.env.NEON_API_KEY || '',
    orgId: process.env.NEON_ORG_ID || '',
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
    callbackBaseUrl: process.env.OAUTH_CALLBACK_BASE_URL || 'http://localhost:4000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  // Feature flags based on environment
  features: {
    enableHostedDatabases: process.env.ENABLE_HOSTED_DBS === 'true' || !isProduction,
    enableMySQLHosted: process.env.ENABLE_MYSQL_HOSTED === 'true',
  },
};
