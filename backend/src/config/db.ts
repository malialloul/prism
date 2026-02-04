// src/config/db.ts
import { Pool } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  database: process.env.PG_DATABASE || 'prism',
  password: process.env.PG_PASSWORD || 'your_password',
  port: parseInt(process.env.PG_PORT || '5432'),
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
