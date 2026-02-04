// src/config/db.ts
import { Pool } from 'pg';

export const pool = new Pool({
  host: 'ep-cold-feather-aj032r0a-pooler.c-3.us-east-2.aws.neon.tech',
  user: 'neondb_owner',
  database: 'neondb',
  password: 'npg_5IaQoezjlW0N',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});
