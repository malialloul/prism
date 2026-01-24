// src/modules/databases/databases.service.ts
import crypto from 'crypto';
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import { pool } from '../../config/db';
import { config } from '../../config/env';
import { NotFoundError, ValidationError } from '../../utils/errors';
import type {
  ConnectDatabaseDto,
  UpdateDatabaseDto,
  DatabaseDto,
  TestConnectionDto,
  TestConnectionResultDto,
  DbDatabaseConnectionDto,
} from './databases.types';

// Encryption helpers for storing database passwords
const ENCRYPTION_KEY = crypto.scryptSync(String(config.jwt.secret), 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Transmission decryption - decrypts passwords sent from frontend
const TRANSMISSION_KEY = config.transmissionKey;

function decryptTransmission(encryptedBase64: string): string {
  try {
    // Decode base64
    const combined = Buffer.from(encryptedBase64, 'base64');
    
    // Extract IV (first 12 bytes) and encrypted data
    const iv = combined.subarray(0, 12);
    const encrypted = combined.subarray(12);
    
    // Derive key using PBKDF2 (same as frontend)
    const key = crypto.pbkdf2Sync(TRANSMISSION_KEY, 'prism-salt', 100000, 32, 'sha256');
    
    // Decrypt using AES-GCM
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    
    // AES-GCM includes auth tag in the last 16 bytes
    const authTag = encrypted.subarray(encrypted.length - 16);
    const ciphertext = encrypted.subarray(0, encrypted.length - 16);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch {
    // If decryption fails, assume password was sent in plain text (for backward compatibility)
    return encryptedBase64;
  }
}

// Map database row to DTO
function mapToDto(row: DbDatabaseConnectionDto): DatabaseDto {
  return {
    id: row.id,
    name: row.name,
    engine: row.engine,
    host: row.host,
    port: row.port,
    database: row.database,
    ssl: row.ssl,
    status: row.status,
    lastConnectedAt: row.last_connected_at,
    tables: row.tables,
    apis: row.apis,
    storageBytes: row.storage_bytes,
    isHosted: row.is_hosted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Internal helper to test database connection with plain password
 */
const testConnectionInternal = async (
  engine: string,
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,
  ssl: boolean
): Promise<TestConnectionResultDto> => {
  try {
    if (engine === 'postgres') {
      const testPool = new Pool({
        host,
        port,
        user: username,
        password,
        database,
        ssl: ssl ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 10000,
      });

      const client = await testPool.connect();
      
      // Count tables
      const tablesResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `);
      const tables = parseInt(tablesResult.rows[0].count, 10);

      // Get database size
      const sizeResult = await client.query(`
        SELECT pg_database_size(current_database()) as size
      `);
      const storageBytes = parseInt(sizeResult.rows[0].size, 10);
      
      client.release();
      await testPool.end();

      return {
        success: true,
        message: 'Connection successful',
        tables,
        storageBytes,
      };
    } else {
      // MySQL connection
      const connection = await mysql.createConnection({
        host,
        port,
        user: username,
        password,
        database,
        ssl: ssl ? { rejectUnauthorized: false } : undefined,
        connectTimeout: 10000,
      });

      // Count tables
      const [rows] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_type = 'BASE TABLE'
      `, [database]);
      const tables = (rows as Array<{ count: number }>)[0].count;

      // Get database size
      const [sizeRows] = await connection.execute(`
        SELECT SUM(data_length + index_length) as size
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [database]);
      const storageBytes = parseInt((sizeRows as Array<{ size: string | null }>)[0].size || '0', 10);

      await connection.end();

      return {
        success: true,
        message: 'Connection successful',
        tables,
        storageBytes,
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    return {
      success: false,
      message: `Connection failed: ${message}`,
    };
  }
};

/**
 * Test database connection without saving (for API calls with encrypted password)
 */
export const testConnectionService = async (
  body: TestConnectionDto
): Promise<TestConnectionResultDto> => {
  const { engine, host, port, username, password, database, ssl } = body;
  
  // Decrypt the password sent from frontend
  const decryptedPassword = decryptTransmission(password);

  return testConnectionInternal(engine, host, port, username, decryptedPassword, database, ssl);
};

/**
 * Connect a new database for a user
 */
export const connectDatabaseService = async (
  userId: string,
  body: ConnectDatabaseDto
): Promise<DatabaseDto> => {
  const { name, engine, host, port, username, password, database, ssl } = body;

  // Decrypt the password sent from frontend
  const decryptedPassword = decryptTransmission(password);

  // Test connection first with decrypted password
  const testResult = await testConnectionInternal(
    engine,
    host,
    port,
    username,
    decryptedPassword,
    database,
    ssl
  );

  if (!testResult.success) {
    throw new ValidationError(testResult.message);
  }

  // Encrypt the decrypted password for storage
  const passwordEncrypted = encrypt(decryptedPassword);

  // Insert into database
  const result = await pool.query<DbDatabaseConnectionDto>(
    `INSERT INTO database_connections 
     (user_id, name, engine, host, port, username, password_encrypted, database, ssl, status, last_connected_at, tables, storage_bytes, is_hosted)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'connected', NOW(), $10, $11, false)
     RETURNING *`,
    [userId, name, engine, host, port, username, passwordEncrypted, database, ssl, testResult.tables || 0, testResult.storageBytes || 0]
  );

  return mapToDto(result.rows[0]);
};

/**
 * Get all databases for a user
 */
export const getDatabasesService = async (userId: string): Promise<DatabaseDto[]> => {
  const result = await pool.query<DbDatabaseConnectionDto>(
    'SELECT * FROM database_connections WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  return result.rows.map(mapToDto);
};

/**
 * Get a single database by ID
 */
export const getDatabaseService = async (
  userId: string,
  databaseId: string
): Promise<DatabaseDto> => {
  const result = await pool.query<DbDatabaseConnectionDto>(
    'SELECT * FROM database_connections WHERE id = $1 AND user_id = $2',
    [databaseId, userId]
  );

  if (!result.rowCount) {
    throw new NotFoundError('Database connection not found');
  }

  return mapToDto(result.rows[0]);
};

/**
 * Update database connection
 */
export const updateDatabaseService = async (
  userId: string,
  databaseId: string,
  body: UpdateDatabaseDto
): Promise<DatabaseDto> => {
  // First get the existing database
  const existing = await pool.query<DbDatabaseConnectionDto>(
    'SELECT * FROM database_connections WHERE id = $1 AND user_id = $2',
    [databaseId, userId]
  );

  if (!existing.rowCount) {
    throw new NotFoundError('Database connection not found');
  }

  const current = existing.rows[0];

  // Build update fields
  const updates: string[] = [];
  const values: (string | number | boolean)[] = [];
  let paramIndex = 1;

  if (body.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(body.name);
  }
  if (body.host !== undefined) {
    updates.push(`host = $${paramIndex++}`);
    values.push(body.host);
  }
  if (body.port !== undefined) {
    updates.push(`port = $${paramIndex++}`);
    values.push(body.port);
  }
  if (body.username !== undefined) {
    updates.push(`username = $${paramIndex++}`);
    values.push(body.username);
  }
  if (body.password !== undefined) {
    updates.push(`password_encrypted = $${paramIndex++}`);
    values.push(encrypt(body.password));
  }
  if (body.database !== undefined) {
    updates.push(`database = $${paramIndex++}`);
    values.push(body.database);
  }
  if (body.ssl !== undefined) {
    updates.push(`ssl = $${paramIndex++}`);
    values.push(body.ssl);
  }

  if (updates.length === 0) {
    return mapToDto(current);
  }

  updates.push(`updated_at = NOW()`);
  values.push(databaseId, userId);

  const result = await pool.query<DbDatabaseConnectionDto>(
    `UPDATE database_connections 
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
     RETURNING *`,
    values
  );

  return mapToDto(result.rows[0]);
};

/**
 * Delete database connection
 */
export const deleteDatabaseService = async (
  userId: string,
  databaseId: string
): Promise<void> => {
  const result = await pool.query(
    'DELETE FROM database_connections WHERE id = $1 AND user_id = $2',
    [databaseId, userId]
  );

  if (!result.rowCount) {
    throw new NotFoundError('Database connection not found');
  }
};

/**
 * Refresh database connection (test connection and update stats)
 */
export const refreshDatabaseService = async (
  userId: string,
  databaseId: string
): Promise<DatabaseDto> => {
  const existing = await pool.query<DbDatabaseConnectionDto>(
    'SELECT * FROM database_connections WHERE id = $1 AND user_id = $2',
    [databaseId, userId]
  );

  if (!existing.rowCount) {
    throw new NotFoundError('Database connection not found');
  }

  const db = existing.rows[0];
  const password = decrypt(db.password_encrypted);

  // Test connection and get updated stats
  const testResult = await testConnectionInternal(
    db.engine,
    db.host,
    db.port,
    db.username,
    password,
    db.database,
    db.ssl
  );

  if (!testResult.success) {
    // Update status to error if connection fails
    await pool.query(
      `UPDATE database_connections SET status = 'error', updated_at = NOW() WHERE id = $1`,
      [databaseId]
    );
    throw new ValidationError(testResult.message);
  }

  const result = await pool.query<DbDatabaseConnectionDto>(
    `UPDATE database_connections 
     SET last_connected_at = NOW(), tables = $1, storage_bytes = $2, updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [testResult.tables ?? db.tables, testResult.storageBytes ?? db.storage_bytes, databaseId, userId]
  );

  return mapToDto(result.rows[0]);
};

/**
 * Disconnect database (update status to disconnected)
 */
export const disconnectDatabaseService = async (
  userId: string,
  databaseId: string
): Promise<DatabaseDto> => {
  const result = await pool.query<DbDatabaseConnectionDto>(
    `UPDATE database_connections 
     SET status = 'disconnected', updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [databaseId, userId]
  );

  if (!result.rowCount) {
    throw new NotFoundError('Database connection not found');
  }

  return mapToDto(result.rows[0]);
};

/**
 * Reconnect database (test connection and update status)
 */
export const reconnectDatabaseService = async (
  userId: string,
  databaseId: string
): Promise<DatabaseDto> => {
  const existing = await pool.query<DbDatabaseConnectionDto>(
    'SELECT * FROM database_connections WHERE id = $1 AND user_id = $2',
    [databaseId, userId]
  );

  if (!existing.rowCount) {
    throw new NotFoundError('Database connection not found');
  }

  const db = existing.rows[0];
  const password = decrypt(db.password_encrypted);

  // Test connection
  const testResult = await testConnectionInternal(
    db.engine,
    db.host,
    db.port,
    db.username,
    password,
    db.database,
    db.ssl
  );

  if (!testResult.success) {
    throw new ValidationError(testResult.message);
  }

  const result = await pool.query<DbDatabaseConnectionDto>(
    `UPDATE database_connections 
     SET status = 'connected', last_connected_at = NOW(), tables = $1, storage_bytes = $2, updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [testResult.tables ?? db.tables, testResult.storageBytes ?? db.storage_bytes, databaseId, userId]
  );

  return mapToDto(result.rows[0]);
};
