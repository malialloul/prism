// src/config/db.ts
import { Pool } from 'pg';

export const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  database: 'prism',
  password: 'postgres',
  port: 5432,
});
