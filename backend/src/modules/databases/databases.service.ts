// src/modules/databases/databases.service.ts
import crypto from 'crypto';
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import { pool } from '../../config/db';
import { config } from '../../config/env';
import { limits, formatLimit } from '../../config/version';
import { NotFoundError, ValidationError } from '../../utils/errors';
import type {
  CreateDatabaseDto,
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

// Hash password for hosted databases using bcrypt-like approach with scrypt
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// Map database row to DTO
function mapToDto(row: DbDatabaseConnectionDto): DatabaseDto {
  return {
    id: row.id,
    name: row.name,
    engine: row.engine,
    host: row.host,
    port: row.port,
    username: row.username,
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
  body: TestConnectionDto,
  userId?: string
): Promise<TestConnectionResultDto> => {
  const { engine, host, port, username, password, database, ssl } = body;
  
  // Decrypt the password sent from frontend
  const decryptedPassword = decryptTransmission(password);

  // If userId is provided, check if the user is trying to connect to their own hosted database
  // using the display name and resolve to the actual database name
  let actualDatabase = database;
  if (userId) {
    const userIdShort = String(userId).padStart(8, '0').substring(0, 8);
    const sanitizedDbName = database.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const possibleHostedDbName = `db_${userIdShort}_${sanitizedDbName}`.substring(0, 63);
    
    const ownHostedDb = await pool.query(
      'SELECT database FROM database_connections WHERE user_id = $1 AND database = $2 AND is_hosted = true',
      [userId, possibleHostedDbName]
    );
    
    if (ownHostedDb.rowCount && ownHostedDb.rowCount > 0) {
      actualDatabase = ownHostedDb.rows[0].database;
    }
  }

  return testConnectionInternal(engine, host, port, username, decryptedPassword, actualDatabase, ssl);
};

/**
 * Connect a new database for a user
 */
export const connectDatabaseService = async (
  userId: string,
  body: ConnectDatabaseDto
): Promise<DatabaseDto> => {
  const { name, engine, host, port, username, password, database, ssl, autoConnect = true } = body;

  // Check if user already has a connection with the same host, port, and database
  const existing = await pool.query(
    'SELECT 1 FROM database_connections WHERE user_id = $1 AND host = $2 AND port = $3 AND database = $4',
    [userId, host, port, database]
  );
  
  if (existing.rowCount && existing.rowCount > 0) {
    throw new ValidationError(`You already have a connection to this database (${host}:${port}/${database})`);
  }

  // Check if user is trying to connect to their own hosted database using the display name
  // Hosted databases are stored as db_{userId}_{sanitizedName} but shown to users as just the name
  const userIdShort = String(userId).padStart(8, '0').substring(0, 8);
  const sanitizedDbName = database.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const possibleHostedDbName = `db_${userIdShort}_${sanitizedDbName}`.substring(0, 63);
  
  const ownHostedDb = await pool.query(
    'SELECT name FROM database_connections WHERE user_id = $1 AND database = $2 AND is_hosted = true',
    [userId, possibleHostedDbName]
  );
  
  if (ownHostedDb.rowCount && ownHostedDb.rowCount > 0) {
    throw new ValidationError(`Database "${database}" is already connected as a hosted database. You can find it in your database list as "${ownHostedDb.rows[0].name}".`);
  }

  // Security check: Prevent connecting to another user's hosted database
  // Hosted databases follow the pattern: db_{userId}_{name}
  const hostedDbPattern = /^db_(\d{8})_/;
  const match = database.match(hostedDbPattern);
  if (match) {
    const dbOwnerId = match[1];
    if (dbOwnerId !== userIdShort) {
      throw new ValidationError('You cannot connect to a database that belongs to another user');
    }
  }

  // Also check if this database is already registered as a hosted database by another user
  const hostedByOther = await pool.query(
    'SELECT 1 FROM database_connections WHERE database = $1 AND is_hosted = true AND user_id != $2',
    [database, userId]
  );
  
  if (hostedByOther.rowCount && hostedByOther.rowCount > 0) {
    throw new ValidationError('You cannot connect to a database that belongs to another user');
  }

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

  const initialStatus = autoConnect ? 'connected' : 'disconnected';

  // If autoConnect, disconnect all other databases for this user first
  if (autoConnect) {
    await pool.query(
      `UPDATE database_connections 
       SET status = 'disconnected', updated_at = NOW()
       WHERE user_id = $1 AND status = 'connected'`,
      [userId]
    );
  }

  // Encrypt the decrypted password for storage
  const passwordEncrypted = encrypt(decryptedPassword);

  // Check if the database exceeds version limits before saving
  const actualTables = testResult.tables || 0;
  const actualStorageBytes = testResult.storageBytes || 0;
  const actualStorageMB = actualStorageBytes / (1024 * 1024);

  if (limits.maxTablesPerDatabase > 0 && actualTables > limits.maxTablesPerDatabase) {
    throw new ValidationError(
      `This database has ${actualTables} tables which exceeds the limit of ${limits.maxTablesPerDatabase} tables. Please reduce the number of tables before connecting.`
    );
  }

  if (limits.maxStorageMB > 0 && actualStorageMB > limits.maxStorageMB) {
    throw new ValidationError(
      `This database uses ${actualStorageMB.toFixed(1)}MB which exceeds the limit of ${formatLimit('maxStorageMB')}. Please reduce the database size before connecting.`
    );
  }

  // Insert into database
  const result = await pool.query<DbDatabaseConnectionDto>(
    `INSERT INTO database_connections 
     (user_id, name, engine, host, port, username, password_encrypted, database, ssl, status, last_connected_at, tables, storage_bytes, is_hosted)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, $12, false)
     RETURNING *`,
    [userId, name, engine, host, port, username, passwordEncrypted, database, ssl, initialStatus, actualTables, actualStorageBytes]
  );

  return mapToDto(result.rows[0]);
};

/**
 * Create a Neon PostgreSQL project via API with custom database name, username and password
 */
async function createNeonProject(projectName: string, customDbName: string, customUsername: string, userPassword: string): Promise<{ host: string; database: string; username: string; password: string; port: number }> {
  const { apiKey, orgId } = config.neon;
  
  if (!apiKey || !orgId) {
    throw new ValidationError('Neon API is not configured. Please set NEON_API_KEY and NEON_ORG_ID environment variables.');
  }

  // Create project with custom database name and role
  const response = await fetch('https://console.neon.tech/api/v2/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project: {
        name: projectName,
        org_id: orgId,
        pg_version: 16,
        default_endpoint_settings: {
          autoscaling_limit_min_cu: 0.25,
          autoscaling_limit_max_cu: 0.25,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' })) as { message?: string };
    throw new ValidationError(`Failed to create Neon project: ${error.message || response.statusText}`);
  }

  const data = await response.json() as { 
    project?: { id?: string };
    branch?: { id?: string };
    roles?: Array<{ name?: string; branch_id?: string }>;
    connection_uris?: Array<{ connection_uri?: string }> 
  };
  
  // Extract connection details from response
  const connectionUri = data.connection_uris?.[0]?.connection_uri;
  if (!connectionUri) {
    throw new ValidationError('Failed to get connection URI from Neon');
  }

  // Parse the connection URI: postgresql://user:password@host/database
  const url = new URL(connectionUri);
  const projectId = data.project?.id;
  const branchId = data.branch?.id || data.roles?.[0]?.branch_id;
  const defaultRoleName = data.roles?.[0]?.name || url.username;

  if (!projectId || !branchId) {
    throw new ValidationError('Failed to get project or branch ID from Neon');
  }

  // Step 1: Create custom database using Neon API
  const dbResponse = await fetch(
    `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}/databases`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        database: {
          name: customDbName,
          owner_name: defaultRoleName,
        },
      }),
    }
  );

  if (!dbResponse.ok) {
    const dbError = await dbResponse.json().catch(() => ({ message: 'Unknown error' })) as { message?: string };
    console.error('Failed to create custom database:', dbError.message);
    // Continue with default database if custom creation fails
  }

  // Step 2: Create custom role using Neon API
  const roleResponse = await fetch(
    `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}/roles`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: {
          name: customUsername,
        },
      }),
    }
  );

  let finalUsername = customUsername;
  let finalPassword = userPassword;
  const finalDatabase = dbResponse.ok ? customDbName : url.pathname.slice(1);
  const defaultPassword = decodeURIComponent(url.password);

  if (roleResponse.ok) {
    // Step 3: Get the password for the new role (Neon generates it)
    const roleData = await roleResponse.json() as { role?: { name?: string; password?: string } };
    const neonGeneratedPassword = roleData.role?.password;

    // Step 4: Connect with DEFAULT role (owner) to grant privileges to new role
    const adminPool = new Pool({
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      user: defaultRoleName, // Connect as the default owner role
      password: defaultPassword,
      database: finalDatabase,
      ssl: { rejectUnauthorized: false },
    });

    try {
      // Grant privileges to the new user
      await adminPool.query(`GRANT ALL PRIVILEGES ON DATABASE "${finalDatabase}" TO "${customUsername}"`);
      await adminPool.query(`GRANT ALL ON SCHEMA public TO "${customUsername}"`);
      await adminPool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${customUsername}"`);
      await adminPool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "${customUsername}"`);
      await adminPool.end();
      
      // Now connect as the new user to set their password
      if (neonGeneratedPassword) {
        const userPool = new Pool({
          host: url.hostname,
          port: parseInt(url.port || '5432'),
          user: customUsername,
          password: neonGeneratedPassword,
          database: finalDatabase,
          ssl: { rejectUnauthorized: false },
        });

        try {
          // Change to user's chosen password
          await userPool.query(`ALTER ROLE "${customUsername}" WITH PASSWORD '${userPassword.replace(/'/g, "''")}'`);
          await userPool.end();
        } catch (err) {
          await userPool.end();
          console.error('Failed to set custom password:', err);
          // If password change fails, use Neon's generated password
          finalPassword = neonGeneratedPassword;
        }
      }
    } catch (err) {
      await adminPool.end();
      console.error('Failed to grant privileges:', err);
      // If granting fails, use default role instead
      finalUsername = defaultRoleName;
      finalPassword = defaultPassword;
    }
  } else {
    // Role creation failed, fall back to default role with password reset
    console.error('Failed to create custom role, using default');
    
    const passwordResponse = await fetch(
      `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}/roles/${defaultRoleName}/reset_password`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (passwordResponse.ok) {
      const tempData = await passwordResponse.json() as { role?: { password?: string } };
      finalUsername = defaultRoleName;
      finalPassword = tempData.role?.password || decodeURIComponent(url.password);
    } else {
      finalUsername = defaultRoleName;
      finalPassword = decodeURIComponent(url.password);
    }
  }
  
  return {
    host: url.hostname,
    port: parseInt(url.port || '5432'),
    username: finalUsername,
    password: finalPassword,
    database: finalDatabase,
  };
}

/**
 * Create a new hosted database for a user
 */
export const createDatabaseService = async (
  userId: string,
  body: CreateDatabaseDto
): Promise<DatabaseDto> => {
  const { name, engine, username: customUsername, password, autoConnect = true } = body;

  // Check if user already has a database with this name
  const existing = await pool.query(
    'SELECT 1 FROM database_connections WHERE user_id = $1 AND name = $2',
    [userId, name]
  );
  
  if (existing.rowCount && existing.rowCount > 0) {
    throw new ValidationError(`You already have a database named "${name}"`);
  }

  // Decrypt the password sent from frontend
  const decryptedPassword = decryptTransmission(password);

  // For hosted databases, we generate unique connection details
  const userIdShort = String(userId).padStart(8, '0').substring(0, 8);
  const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const projectName = `prism_${userIdShort}_${sanitizedName}`;
  const customDbName = sanitizedName; // Use sanitized name as database name

  let host: string;
  let port: number;
  let username: string;
  let database: string;
  let finalPassword: string;

  // Provision the database on the hosted infrastructure
  if (engine === 'postgres') {
    // In development, use local PostgreSQL server; in production, use Neon API
    if (config.env.isDevelopment) {
      // Use local PostgreSQL server
      host = config.postgres.host;
      port = config.postgres.port;
      username = customUsername;
      // Use unique database name with user ID prefix to avoid conflicts between users
      database = `db_${userIdShort}_${sanitizedName}`.substring(0, 63);
      finalPassword = decryptedPassword;

      // Connect to local PostgreSQL admin server to create database and user
      const adminPool = new Pool({
        host: config.postgres.host,
        port: config.postgres.port,
        user: config.postgres.user,
        password: config.postgres.password,
        database: 'postgres', // Connect to default database for admin operations
        ssl: config.postgres.ssl ? { rejectUnauthorized: false } : false,
      });

      try {
        // Create the database if it doesn't exist
        const dbExists = await adminPool.query(
          `SELECT 1 FROM pg_database WHERE datname = $1`,
          [database]
        );
        if (dbExists.rowCount === 0) {
          await adminPool.query(`CREATE DATABASE "${database}"`);
        }

        // Create the user if it doesn't exist
        const userExists = await adminPool.query(
          `SELECT 1 FROM pg_roles WHERE rolname = $1`,
          [username]
        );
        if (userExists.rowCount === 0) {
          await adminPool.query(`CREATE USER "${username}" WITH PASSWORD '${decryptedPassword.replace(/'/g, "''")}'`);
        } else {
          // Update password if user exists
          await adminPool.query(`ALTER USER "${username}" WITH PASSWORD '${decryptedPassword.replace(/'/g, "''")}'`);
        }

        // Grant privileges
        await adminPool.query(`GRANT ALL PRIVILEGES ON DATABASE "${database}" TO "${username}"`);
        
        await adminPool.end();

        // Connect to the new database to grant schema privileges
        const dbPool = new Pool({
          host: config.postgres.host,
          port: config.postgres.port,
          user: config.postgres.user,
          password: config.postgres.password,
          database: database,
          ssl: config.postgres.ssl ? { rejectUnauthorized: false } : false,
        });
        
        await dbPool.query(`GRANT ALL ON SCHEMA public TO "${username}"`);
        await dbPool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${username}"`);
        await dbPool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "${username}"`);
        await dbPool.end();
      } catch (err) {
        await adminPool.end();
        const message = err instanceof Error ? err.message : 'Unknown error';
        throw new ValidationError(`Failed to create local PostgreSQL database: ${message}`);
      }
    } else {
      // Production: Use Neon API to create a new project with user's credentials
      const neonProject = await createNeonProject(projectName, customDbName, customUsername, decryptedPassword);
      host = neonProject.host;
      port = neonProject.port;
      username = neonProject.username;
      database = neonProject.database;
      finalPassword = neonProject.password;
    }
  } else {
    // MySQL - check if we have MySQL configured
    if (!config.mysql.host || config.mysql.host === 'localhost') {
      throw new ValidationError('MySQL hosted databases are not available. Please use "Connect Existing Database" to connect your own MySQL database.');
    }
    
    // Set MySQL variables - use custom username
    host = config.mysql.host;
    port = config.mysql.port;
    username = customUsername;
    database = `db_${userIdShort}_${sanitizedName}`.substring(0, 64);
    finalPassword = decryptedPassword;
    
    // Connect to MySQL admin server
    let adminConnection;
    try {
      adminConnection = await mysql.createConnection({
        host: config.mysql.host,
        port: config.mysql.port,
        user: config.mysql.user,
        password: config.mysql.password,
      });
    } catch (connError) {
      const message = connError instanceof Error ? connError.message : 'Unknown error';
      throw new ValidationError(`Cannot connect to MySQL server. Make sure MySQL is running and configured correctly. Error: ${message}`);
    }

    try {
      // Create the database if it doesn't exist
      await adminConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
      
      // Check if user exists
      const [users] = await adminConnection.execute(
        `SELECT 1 FROM mysql.user WHERE user = ? AND host = '%'`,
        [username]
      );
      
      if ((users as Array<unknown>).length === 0) {
        // Create the user with the provided password
        await adminConnection.execute(
          `CREATE USER '${username}'@'%' IDENTIFIED BY '${finalPassword.replace(/'/g, "''")}'`
        );
      } else {
        // Update the password for existing user
        await adminConnection.execute(
          `ALTER USER '${username}'@'%' IDENTIFIED BY '${finalPassword.replace(/'/g, "''")}'`
        );
      }
      
      // Grant all privileges on the database to the user
      await adminConnection.execute(
        `GRANT ALL PRIVILEGES ON \`${database}\`.* TO '${username}'@'%'`
      );
      
      await adminConnection.execute('FLUSH PRIVILEGES');
      await adminConnection.end();
    } catch (error) {
      await adminConnection.end();
      const message = error instanceof Error ? error.message : 'Failed to create database';
      throw new ValidationError(`Failed to provision MySQL database: ${message}`);
    }
  }

  // Encrypt the password for storage (so we can connect to it later)
  const passwordEncrypted = encrypt(finalPassword);

  // Insert into database - use SSL only for Neon PostgreSQL (production), not for local dev
  const useSSL = engine === 'postgres' && !config.env.isDevelopment;
  const initialStatus = autoConnect ? 'connected' : 'disconnected';
  
  // If autoConnect, disconnect all other databases first
  if (autoConnect) {
    await pool.query(
      `UPDATE database_connections 
       SET status = 'disconnected', updated_at = NOW()
       WHERE user_id = $1 AND status = 'connected'`,
      [userId]
    );
  }
  
  const result = await pool.query<DbDatabaseConnectionDto>(
    `INSERT INTO database_connections 
     (user_id, name, engine, host, port, username, password_encrypted, database, ssl, status, last_connected_at, tables, storage_bytes, is_hosted)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), 0, 0, true)
     RETURNING *`,
    [userId, name, engine, host, port, username, passwordEncrypted, database, useSSL, initialStatus]
  );

  return mapToDto(result.rows[0]);
};

/**
 * Get all databases for a user
 */
export const getDatabasesService = async (userId: string): Promise<DatabaseDto[]> => {
  // First, sync the apis count with actual saved_queries for this user
  await pool.query(`
    UPDATE database_connections dc
    SET apis = (
      SELECT COUNT(*) FROM saved_queries sq 
      WHERE sq.database_id = dc.id AND sq.user_id = $1
    )
    WHERE dc.user_id = $1
  `, [userId]);

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
  // First get the database details
  const existing = await pool.query<DbDatabaseConnectionDto>(
    'SELECT * FROM database_connections WHERE id = $1 AND user_id = $2',
    [databaseId, userId]
  );

  if (!existing.rowCount) {
    throw new NotFoundError('Database connection not found');
  }

  const db = existing.rows[0];

  // If it's a hosted database, drop the database and user from the server
  if (db.is_hosted) {
    if (db.engine === 'postgres') {
      const adminPool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'postgres',
      });

      try {
        // Terminate all connections to the database
        await adminPool.query(`
          SELECT pg_terminate_backend(pg_stat_activity.pid)
          FROM pg_stat_activity
          WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid()
        `, [db.database]);
        
        // Drop the database
        await adminPool.query(`DROP DATABASE IF EXISTS "${db.database}"`);
        
        // Drop the user
        await adminPool.query(`DROP USER IF EXISTS "${db.username}"`);
        
        await adminPool.end();
      } catch (error) {
        await adminPool.end();
        // Log error but don't fail the delete - the connection record should still be removed
        console.error('Failed to drop PostgreSQL database/user:', error);
      }
    } else {
      // MySQL
      const adminConnection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'mysql',
      });

      try {
        // Drop the database
        await adminConnection.execute(`DROP DATABASE IF EXISTS \`${db.database}\``);
        
        // Drop the user
        await adminConnection.execute(`DROP USER IF EXISTS '${db.username}'@'%'`);
        
        await adminConnection.end();
      } catch (error) {
        await adminConnection.end();
        // Log error but don't fail the delete
        console.error('Failed to drop MySQL database/user:', error);
      }
    }
  }

  // Delete saved queries for this database first (foreign key constraint)
  await pool.query(
    'DELETE FROM saved_queries WHERE database_id = $1 AND user_id = $2',
    [databaseId, userId]
  );

  // Delete query execution logs for this database (foreign key constraint)
  await pool.query(
    'DELETE FROM query_execution_logs WHERE database_id = $1',
    [databaseId]
  );

  // Delete the connection record
  await pool.query(
    'DELETE FROM database_connections WHERE id = $1 AND user_id = $2',
    [databaseId, userId]
  );
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
 * Automatically disconnects all other databases for the user
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

  // Disconnect all other databases for this user first
  await pool.query(
    `UPDATE database_connections 
     SET status = 'disconnected', updated_at = NOW()
     WHERE user_id = $1 AND id != $2 AND status = 'connected'`,
    [userId, databaseId]
  );

  const result = await pool.query<DbDatabaseConnectionDto>(
    `UPDATE database_connections 
     SET status = 'connected', last_connected_at = NOW(), tables = $1, storage_bytes = $2, updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [testResult.tables ?? db.tables, testResult.storageBytes ?? db.storage_bytes, databaseId, userId]
  );

  return mapToDto(result.rows[0]);
};
