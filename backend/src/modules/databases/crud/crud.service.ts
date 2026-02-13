// src/modules/databases/crud/crud.service.ts

import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { pool } from '../../../config/db';
import { config } from '../../../config/env';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { logQueryExecution } from '../queryStats.service';
import type { 
  ListQueryParams, 
  PaginatedResult, 
  CrudRecord, 
  TableRelation,
  FilterCondition 
} from './crud.types';

// Encryption helpers
const ENCRYPTION_KEY = crypto.scryptSync(String(config.jwt.secret), 'salt', 32);

function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Helper to get database connection details
async function getDatabaseConnection(userId: string, databaseId: string) {
  const result = await pool.query(
    `SELECT * FROM database_connections WHERE id = $1 AND user_id = $2`,
    [databaseId, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('Database not found');
  }

  const db = result.rows[0];
  if (db.status !== 'connected') {
    throw new ValidationError('Database is not connected. Please connect first.');
  }

  return {
    engine: db.engine as 'postgres' | 'mysql',
    host: db.host as string,
    port: db.port as number,
    username: db.username as string,
    password: decrypt(db.password_encrypted),
    database: db.database as string,
    ssl: db.ssl as boolean,
  };
}

// Helper to create a PostgreSQL pool
function createPgPool(conn: Awaited<ReturnType<typeof getDatabaseConnection>>) {
  return new Pool({
    host: conn.host,
    port: conn.port,
    user: conn.username,
    password: conn.password,
    database: conn.database,
    ssl: conn.ssl ? { rejectUnauthorized: false } : false,
  });
}

// Helper to create a MySQL connection
async function createMysqlConnection(conn: Awaited<ReturnType<typeof getDatabaseConnection>>) {
  return mysql.createConnection({
    host: conn.host,
    port: conn.port,
    user: conn.username,
    password: conn.password,
    database: conn.database,
    ssl: conn.ssl ? { rejectUnauthorized: false } : undefined,
  });
}

/**
 * Validate and sanitize table/column names to prevent SQL injection
 */
const sanitizeIdentifier = (name: string): string => {
  // Only allow alphanumeric, underscores, and check length
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) || name.length > 128) {
    throw new ValidationError(`Invalid identifier: ${name}`);
  }
  return name;
};

/**
 * Build WHERE clause from filters with advanced operators
 */
const buildWhereClause = (
  filters: FilterCondition[],
  engine: 'postgres' | 'mysql',
  startParamIndex = 1
): { clause: string; values: unknown[]; nextIndex: number } => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = startParamIndex;

  for (const filter of filters) {
    const { column, operator, value } = filter;
    const sanitizedColumn = sanitizeIdentifier(column);
    const quote = engine === 'postgres' ? '"' : '`';
    const param = engine === 'postgres' ? `$${paramIndex}` : '?';
    
    switch (operator) {
      case 'eq':
        conditions.push(`${quote}${sanitizedColumn}${quote} = ${param}`);
        values.push(value);
        paramIndex++;
        break;
        
      case 'neq':
        conditions.push(`${quote}${sanitizedColumn}${quote} != ${param}`);
        values.push(value);
        paramIndex++;
        break;
        
      case 'gt':
        conditions.push(`${quote}${sanitizedColumn}${quote} > ${param}`);
        values.push(value);
        paramIndex++;
        break;
        
      case 'gte':
        conditions.push(`${quote}${sanitizedColumn}${quote} >= ${param}`);
        values.push(value);
        paramIndex++;
        break;
        
      case 'lt':
        conditions.push(`${quote}${sanitizedColumn}${quote} < ${param}`);
        values.push(value);
        paramIndex++;
        break;
        
      case 'lte':
        conditions.push(`${quote}${sanitizedColumn}${quote} <= ${param}`);
        values.push(value);
        paramIndex++;
        break;
      
      case 'between': {
        const param2 = engine === 'postgres' ? `$${paramIndex + 1}` : '?';
        conditions.push(`${quote}${sanitizedColumn}${quote} BETWEEN ${param} AND ${param2}`);
        values.push(value);
        values.push(filter.value2);
        paramIndex += 2;
        break;
      }
        
      case 'contains':
        if (engine === 'postgres') {
          conditions.push(`${quote}${sanitizedColumn}${quote}::text ILIKE ${param}`);
          values.push(`%${value}%`);
        } else {
          conditions.push(`${quote}${sanitizedColumn}${quote} LIKE ${param}`);
          values.push(`%${value}%`);
        }
        paramIndex++;
        break;
        
      case 'startsWith':
        if (engine === 'postgres') {
          conditions.push(`${quote}${sanitizedColumn}${quote}::text ILIKE ${param}`);
          values.push(`${value}%`);
        } else {
          conditions.push(`${quote}${sanitizedColumn}${quote} LIKE ${param}`);
          values.push(`${value}%`);
        }
        paramIndex++;
        break;
        
      case 'endsWith':
        if (engine === 'postgres') {
          conditions.push(`${quote}${sanitizedColumn}${quote}::text ILIKE ${param}`);
          values.push(`%${value}`);
        } else {
          conditions.push(`${quote}${sanitizedColumn}${quote} LIKE ${param}`);
          values.push(`%${value}`);
        }
        paramIndex++;
        break;
        
      case 'isNull':
        conditions.push(`${quote}${sanitizedColumn}${quote} IS NULL`);
        break;
        
      case 'isNotNull':
        conditions.push(`${quote}${sanitizedColumn}${quote} IS NOT NULL`);
        break;
    }
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
    nextIndex: paramIndex,
  };
};

/**
 * Get primary key column(s) for a table
 */
const getPrimaryKeyColumns = async (
  conn: { engine: 'postgres' | 'mysql'; database: string },
  pool: Pool | mysql.Connection,
  tableName: string
): Promise<string[]> => {
  const sanitizedTable = sanitizeIdentifier(tableName);

  if (conn.engine === 'postgres') {
    const result = await (pool as Pool).query(`
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary
    `, [`public.${sanitizedTable}`]);
    return result.rows.map((r: { column_name: string }) => r.column_name);
  } else {
    const [rows] = await (pool as mysql.Connection).execute(`
      SELECT COLUMN_NAME as column_name
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'
      ORDER BY ORDINAL_POSITION
    `, [conn.database, sanitizedTable]);
    return (rows as Array<{ column_name: string }>).map(r => r.column_name);
  }
};

/**
 * Get all text/varchar columns for search
 */
const getSearchableColumns = async (
  conn: { engine: 'postgres' | 'mysql'; database: string },
  pool: Pool | mysql.Connection,
  tableName: string
): Promise<string[]> => {
  const sanitizedTable = sanitizeIdentifier(tableName);

  if (conn.engine === 'postgres') {
    const result = await (pool as Pool).query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
        AND data_type IN ('character varying', 'varchar', 'text', 'char', 'character')
    `, [sanitizedTable]);
    return result.rows.map((r: { column_name: string }) => r.column_name);
  } else {
    const [rows] = await (pool as mysql.Connection).execute(`
      SELECT COLUMN_NAME as column_name
      FROM information_schema.columns
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        AND DATA_TYPE IN ('varchar', 'text', 'char', 'tinytext', 'mediumtext', 'longtext')
    `, [conn.database, sanitizedTable]);
    return (rows as Array<{ column_name: string }>).map(r => r.column_name);
  }
};

/**
 * List records with pagination, filtering, sorting, and search
 */
export const listRecords = async (
  userId: string,
  databaseId: string,
  tableName: string,
  params: ListQueryParams
): Promise<PaginatedResult<CrudRecord>> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const sanitizedTable = sanitizeIdentifier(tableName);
  
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = params.offset ?? (page - 1) * limit;
  const sortBy = params.sortBy ? sanitizeIdentifier(params.sortBy) : null;
  const sortOrder = params.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      // Build query parts
      let paramIndex = 1;
      const queryParts: string[] = [];
      const values: unknown[] = [];

      // Filters
      if (params.filters && params.filters.length > 0) {
        const filterResult = buildWhereClause(params.filters, 'postgres', paramIndex);
        if (filterResult.clause) {
          queryParts.push(filterResult.clause.replace('WHERE ', ''));
          values.push(...filterResult.values);
          paramIndex = filterResult.nextIndex;
        }
      }

      // Search
      if (params.search) {
        const searchFields = params.searchFields?.length 
          ? params.searchFields.map(sanitizeIdentifier)
          : await getSearchableColumns(conn, pgPool, tableName);
        
        if (searchFields.length > 0) {
          const searchConditions = searchFields.map(f => `"${f}"::text ILIKE $${paramIndex}`);
          queryParts.push(`(${searchConditions.join(' OR ')})`);
          values.push(`%${params.search}%`);
          paramIndex++;
        }
      }

      const whereClause = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';
      const orderClause = sortBy ? `ORDER BY "${sortBy}" ${sortOrder}` : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM "${sanitizedTable}" ${whereClause}`;
      const countResult = await pgPool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].total, 10);

      // Get records
      const dataQuery = `
        SELECT * FROM "${sanitizedTable}" 
        ${whereClause}
        ${orderClause}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      const dataResult = await pgPool.query(dataQuery, [...values, limit, offset]);
      const executionTimeMs = Date.now() - Date.now(); // Approximate, we'll track from start

      await pgPool.end();

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'SELECT',
        executionTimeMs: 0,
        rowsAffected: dataResult.rowCount || 0,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      const totalPages = Math.ceil(total / limit);
      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      await pgPool.end();

      // Log failed query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'SELECT',
        executionTimeMs: 0,
        rowsAffected: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Query failed',
      }).catch(err => console.error('Failed to log query execution:', err));

      throw error;
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      const queryParts: string[] = [];
      const values: unknown[] = [];

      // Filters
      if (params.filters && params.filters.length > 0) {
        const filterResult = buildWhereClause(params.filters, 'mysql', 1);
        if (filterResult.clause) {
          queryParts.push(filterResult.clause.replace('WHERE ', ''));
          values.push(...filterResult.values);
        }
      }

      // Search
      if (params.search) {
        const searchFields = params.searchFields?.length 
          ? params.searchFields.map(sanitizeIdentifier)
          : await getSearchableColumns(conn, mysqlConn, tableName);
        
        if (searchFields.length > 0) {
          const searchConditions = searchFields.map(f => `\`${f}\` LIKE ?`);
          queryParts.push(`(${searchConditions.join(' OR ')})`);
          // Add search value for each field
          searchFields.forEach(() => values.push(`%${params.search}%`));
        }
      }

      const whereClause = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';
      const orderClause = sortBy ? `ORDER BY \`${sortBy}\` ${sortOrder}` : '';

      // Get total count
      const [countRows] = await mysqlConn.query(
        `SELECT COUNT(*) as total FROM \`${sanitizedTable}\` ${whereClause}`,
        values
      );
      const total = (countRows as Array<{ total: number }>)[0].total;

      // Get records - use query() instead of execute() to avoid prepared statement issues with LIMIT/OFFSET
      const [dataRows] = await mysqlConn.query(
        `SELECT * FROM \`${sanitizedTable}\` ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
        [...values, limit, offset]
      );

      await mysqlConn.end();

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'SELECT',
        executionTimeMs: 0,
        rowsAffected: (dataRows as CrudRecord[]).length,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      const totalPages = Math.ceil(total / limit);
      return {
        data: dataRows as CrudRecord[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      await mysqlConn.end();

      // Log failed query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'SELECT',
        executionTimeMs: 0,
        rowsAffected: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Query failed',
      }).catch(err => console.error('Failed to log query execution:', err));

      throw error;
    }
  }
};

/**
 * Get a single record by primary key
 */
export const getRecord = async (
  userId: string,
  databaseId: string,
  tableName: string,
  recordId: string | number
): Promise<CrudRecord> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const sanitizedTable = sanitizeIdentifier(tableName);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      const pkColumns = await getPrimaryKeyColumns(conn, pgPool, tableName);
      if (pkColumns.length === 0) {
        throw new ValidationError(`Table ${tableName} has no primary key`);
      }
      if (pkColumns.length > 1) {
        throw new ValidationError(`Composite primary keys not supported via this endpoint. Use query endpoint.`);
      }

      const result = await pgPool.query(
        `SELECT * FROM "${sanitizedTable}" WHERE "${pkColumns[0]}" = $1 LIMIT 1`,
        [recordId]
      );

      await pgPool.end();

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'SELECT',
        executionTimeMs: 0,
        rowsAffected: result.rowCount || 0,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      if (result.rowCount === 0) {
        throw new NotFoundError(`Record not found`);
      }

      return result.rows[0];
    } catch (error) {
      await pgPool.end();

      // Log failed query execution (only for actual query errors, not NotFoundError)
      if (!(error instanceof NotFoundError)) {
        logQueryExecution({
          userId: parseInt(userId, 10),
          databaseId: parseInt(databaseId, 10),
          queryType: 'SELECT',
          executionTimeMs: 0,
          rowsAffected: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Query failed',
        }).catch(err => console.error('Failed to log query execution:', err));
      }

      throw error;
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      const pkColumns = await getPrimaryKeyColumns(conn, mysqlConn, tableName);
      if (pkColumns.length === 0) {
        throw new ValidationError(`Table ${tableName} has no primary key`);
      }
      if (pkColumns.length > 1) {
        throw new ValidationError(`Composite primary keys not supported via this endpoint. Use query endpoint.`);
      }

      const [rows] = await mysqlConn.execute(
        `SELECT * FROM \`${sanitizedTable}\` WHERE \`${pkColumns[0]}\` = ? LIMIT 1`,
        [recordId]
      );

      await mysqlConn.end();

      const records = rows as CrudRecord[];

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'SELECT',
        executionTimeMs: 0,
        rowsAffected: records.length,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      if (records.length === 0) {
        throw new NotFoundError(`Record not found`);
      }

      return records[0];
    } catch (error) {
      await mysqlConn.end();

      // Log failed query execution (only for actual query errors, not NotFoundError)
      if (!(error instanceof NotFoundError)) {
        logQueryExecution({
          userId: parseInt(userId, 10),
          databaseId: parseInt(databaseId, 10),
          queryType: 'SELECT',
          executionTimeMs: 0,
          rowsAffected: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Query failed',
        }).catch(err => console.error('Failed to log query execution:', err));
      }

      throw error;
    }
  }
};

/**
 * Create a new record
 */
export const createRecord = async (
  userId: string,
  databaseId: string,
  tableName: string,
  data: Record<string, unknown>
): Promise<CrudRecord> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const sanitizedTable = sanitizeIdentifier(tableName);

  if (Object.keys(data).length === 0) {
    throw new ValidationError('No data provided');
  }

  // Sanitize column names
  const columns = Object.keys(data).map(sanitizeIdentifier);
  const values = Object.values(data);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      const columnList = columns.map(c => `"${c}"`).join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

      const result = await pgPool.query(
        `INSERT INTO "${sanitizedTable}" (${columnList}) VALUES (${placeholders}) RETURNING *`,
        values
      );

      await pgPool.end();

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'INSERT',
        executionTimeMs: 0,
        rowsAffected: result.rowCount || 1,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      return result.rows[0];
    } catch (error) {
      await pgPool.end();

      // Log failed query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'INSERT',
        executionTimeMs: 0,
        rowsAffected: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to create record',
      }).catch(err => console.error('Failed to log query execution:', err));

      const message = error instanceof Error ? error.message : 'Failed to create record';
      throw new ValidationError(message);
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      const columnList = columns.map(c => `\`${c}\``).join(', ');
      const placeholders = columns.map(() => '?').join(', ');

      const [insertResult] = await mysqlConn.execute(
        `INSERT INTO \`${sanitizedTable}\` (${columnList}) VALUES (${placeholders})`,
        values
      );

      const insertId = (insertResult as mysql.ResultSetHeader).insertId;

      // Fetch the created record
      const pkColumns = await getPrimaryKeyColumns(conn, mysqlConn, tableName);
      let record: CrudRecord;

      if (insertId && pkColumns.length === 1) {
        const [rows] = await mysqlConn.execute(
          `SELECT * FROM \`${sanitizedTable}\` WHERE \`${pkColumns[0]}\` = ?`,
          [insertId]
        );
        record = (rows as CrudRecord[])[0];
      } else {
        // Can't easily get the record back, return the input data
        record = data as CrudRecord;
      }

      await mysqlConn.end();

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'INSERT',
        executionTimeMs: 0,
        rowsAffected: 1,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      return record;
    } catch (error) {
      await mysqlConn.end();

      // Log failed query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'INSERT',
        executionTimeMs: 0,
        rowsAffected: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to create record',
      }).catch(err => console.error('Failed to log query execution:', err));

      const message = error instanceof Error ? error.message : 'Failed to create record';
      throw new ValidationError(message);
    }
  }
};

/**
 * Update a record by primary key
 */
export const updateRecord = async (
  userId: string,
  databaseId: string,
  tableName: string,
  recordId: string | number,
  data: Record<string, unknown>
): Promise<CrudRecord> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const sanitizedTable = sanitizeIdentifier(tableName);

  if (Object.keys(data).length === 0) {
    throw new ValidationError('No data provided');
  }

  const columns = Object.keys(data).map(sanitizeIdentifier);
  const values = Object.values(data);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      const pkColumns = await getPrimaryKeyColumns(conn, pgPool, tableName);
      if (pkColumns.length === 0) {
        throw new ValidationError(`Table ${tableName} has no primary key`);
      }
      if (pkColumns.length > 1) {
        throw new ValidationError(`Composite primary keys not supported via this endpoint`);
      }

      const setClause = columns.map((c, i) => `"${c}" = $${i + 1}`).join(', ');
      const pkParamIndex = columns.length + 1;

      const result = await pgPool.query(
        `UPDATE "${sanitizedTable}" SET ${setClause} WHERE "${pkColumns[0]}" = $${pkParamIndex} RETURNING *`,
        [...values, recordId]
      );

      await pgPool.end();

      if (result.rowCount === 0) {
        throw new NotFoundError(`Record not found`);
      }

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'UPDATE',
        executionTimeMs: 0,
        rowsAffected: result.rowCount || 0,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      return result.rows[0];
    } catch (error) {
      await pgPool.end();

      // Log failed query execution (only for actual query errors)
      if (!(error instanceof NotFoundError) && !(error instanceof ValidationError)) {
        logQueryExecution({
          userId: parseInt(userId, 10),
          databaseId: parseInt(databaseId, 10),
          queryType: 'UPDATE',
          executionTimeMs: 0,
          rowsAffected: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Failed to update record',
        }).catch(err => console.error('Failed to log query execution:', err));
      }

      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      const message = error instanceof Error ? error.message : 'Failed to update record';
      throw new ValidationError(message);
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      const pkColumns = await getPrimaryKeyColumns(conn, mysqlConn, tableName);
      if (pkColumns.length === 0) {
        throw new ValidationError(`Table ${tableName} has no primary key`);
      }
      if (pkColumns.length > 1) {
        throw new ValidationError(`Composite primary keys not supported via this endpoint`);
      }

      const setClause = columns.map(c => `\`${c}\` = ?`).join(', ');

      const [updateResult] = await mysqlConn.execute(
        `UPDATE \`${sanitizedTable}\` SET ${setClause} WHERE \`${pkColumns[0]}\` = ?`,
        [...values, recordId]
      );

      if ((updateResult as mysql.ResultSetHeader).affectedRows === 0) {
        await mysqlConn.end();
        throw new NotFoundError(`Record not found`);
      }

      // Fetch updated record
      const [rows] = await mysqlConn.execute(
        `SELECT * FROM \`${sanitizedTable}\` WHERE \`${pkColumns[0]}\` = ?`,
        [recordId]
      );

      await mysqlConn.end();

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'UPDATE',
        executionTimeMs: 0,
        rowsAffected: (updateResult as mysql.ResultSetHeader).affectedRows,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      return (rows as CrudRecord[])[0];
    } catch (error) {
      await mysqlConn.end();

      // Log failed query execution (only for actual query errors)
      if (!(error instanceof NotFoundError) && !(error instanceof ValidationError)) {
        logQueryExecution({
          userId: parseInt(userId, 10),
          databaseId: parseInt(databaseId, 10),
          queryType: 'UPDATE',
          executionTimeMs: 0,
          rowsAffected: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Failed to update record',
        }).catch(err => console.error('Failed to log query execution:', err));
      }

      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      const message = error instanceof Error ? error.message : 'Failed to update record';
      throw new ValidationError(message);
    }
  }
};

/**
 * Update records by filters
 */
export const updateRecordsByFilters = async (
  userId: string,
  databaseId: string,
  tableName: string,
  filters: FilterCondition[],
  data: Record<string, unknown>
): Promise<number> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const sanitizedTable = sanitizeIdentifier(tableName);

  if (Object.keys(data).length === 0) {
    throw new ValidationError('No data provided');
  }

  if (!filters || filters.length === 0) {
    throw new ValidationError('At least one filter is required to update records');
  }

  const columns = Object.keys(data).map(sanitizeIdentifier);
  const values = Object.values(data);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      const setClause = columns.map((c, i) => `"${c}" = $${i + 1}`).join(', ');
      const filterResult = buildWhereClause(filters, 'postgres', columns.length + 1);

      const result = await pgPool.query(
        `UPDATE "${sanitizedTable}" SET ${setClause} ${filterResult.clause}`,
        [...values, ...filterResult.values]
      );

      await pgPool.end();

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'UPDATE',
        executionTimeMs: 0,
        rowsAffected: result.rowCount || 0,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      return result.rowCount || 0;
    } catch (error) {
      await pgPool.end();

      // Log failed query execution
      if (!(error instanceof ValidationError)) {
        logQueryExecution({
          userId: parseInt(userId, 10),
          databaseId: parseInt(databaseId, 10),
          queryType: 'UPDATE',
          executionTimeMs: 0,
          rowsAffected: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Failed to update records',
        }).catch(err => console.error('Failed to log query execution:', err));
      }

      if (error instanceof ValidationError) throw error;
      const message = error instanceof Error ? error.message : 'Failed to update records';
      throw new ValidationError(message);
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      const setClause = columns.map(c => `\`${c}\` = ?`).join(', ');
      const filterResult = buildWhereClause(filters, 'mysql', 1);

      const [updateResult] = await mysqlConn.execute(
        `UPDATE \`${sanitizedTable}\` SET ${setClause} ${filterResult.clause}`,
        [...values, ...filterResult.values]
      );

      await mysqlConn.end();

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'UPDATE',
        executionTimeMs: 0,
        rowsAffected: (updateResult as mysql.ResultSetHeader).affectedRows,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      return (updateResult as mysql.ResultSetHeader).affectedRows;
    } catch (error) {
      await mysqlConn.end();

      // Log failed query execution
      if (!(error instanceof ValidationError)) {
        logQueryExecution({
          userId: parseInt(userId, 10),
          databaseId: parseInt(databaseId, 10),
          queryType: 'UPDATE',
          executionTimeMs: 0,
          rowsAffected: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Failed to update records',
        }).catch(err => console.error('Failed to log query execution:', err));
      }

      if (error instanceof ValidationError) throw error;
      const message = error instanceof Error ? error.message : 'Failed to update records';
      throw new ValidationError(message);
    }
  }
};

/**
 * Delete records by filters
 */
export const deleteRecord = async (
  userId: string,
  databaseId: string,
  tableName: string,
  filters: FilterCondition[]
): Promise<number> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const sanitizedTable = sanitizeIdentifier(tableName);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      const filterResult = buildWhereClause(filters, 'postgres', 1);
      
      if (!filterResult.clause) {
        throw new ValidationError('At least one filter is required to delete records');
      }

      const result = await pgPool.query(
        `DELETE FROM "${sanitizedTable}" ${filterResult.clause}`,
        filterResult.values
      );

      await pgPool.end();

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'DELETE',
        executionTimeMs: 0,
        rowsAffected: result.rowCount || 0,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      return result.rowCount || 0;
    } catch (error) {
      await pgPool.end();

      // Log failed query execution
      if (!(error instanceof NotFoundError) && !(error instanceof ValidationError)) {
        logQueryExecution({
          userId: parseInt(userId, 10),
          databaseId: parseInt(databaseId, 10),
          queryType: 'DELETE',
          executionTimeMs: 0,
          rowsAffected: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Failed to delete record',
        }).catch(err => console.error('Failed to log query execution:', err));
      }

      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      const message = error instanceof Error ? error.message : 'Failed to delete record';
      throw new ValidationError(message);
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      const filterResult = buildWhereClause(filters, 'mysql', 1);
      
      if (!filterResult.clause) {
        throw new ValidationError('At least one filter is required to delete records');
      }

      const [deleteResult] = await mysqlConn.execute(
        `DELETE FROM \`${sanitizedTable}\` ${filterResult.clause}`,
        filterResult.values
      );

      await mysqlConn.end();

      // Log successful query execution
      logQueryExecution({
        userId: parseInt(userId, 10),
        databaseId: parseInt(databaseId, 10),
        queryType: 'DELETE',
        executionTimeMs: 0,
        rowsAffected: (deleteResult as mysql.ResultSetHeader).affectedRows,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

      return (deleteResult as mysql.ResultSetHeader).affectedRows;
    } catch (error) {
      await mysqlConn.end();

      // Log failed query execution
      if (!(error instanceof NotFoundError) && !(error instanceof ValidationError)) {
        logQueryExecution({
          userId: parseInt(userId, 10),
          databaseId: parseInt(databaseId, 10),
          queryType: 'DELETE',
          executionTimeMs: 0,
          rowsAffected: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Failed to delete record',
        }).catch(err => console.error('Failed to log query execution:', err));
      }

      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      const message = error instanceof Error ? error.message : 'Failed to delete record';
      throw new ValidationError(message);
    }
  }
};

/**
 * Get table relations (foreign keys)
 */
export const getTableRelations = async (
  userId: string,
  databaseId: string,
  tableName: string
): Promise<TableRelation[]> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const sanitizedTable = sanitizeIdentifier(tableName);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      // Get foreign keys FROM this table (many-to-one)
      const outgoingResult = await pgPool.query(`
        SELECT
          tc.table_name as "table",
          kcu.column_name as "column",
          ccu.table_name as "referencedTable",
          ccu.column_name as "referencedColumn"
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_schema = 'public'
          AND tc.table_name = $1
      `, [sanitizedTable]);

      // Get foreign keys TO this table (one-to-many)
      const incomingResult = await pgPool.query(`
        SELECT
          tc.table_name as "table",
          kcu.column_name as "column",
          ccu.table_name as "referencedTable",
          ccu.column_name as "referencedColumn"
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_schema = 'public'
          AND ccu.table_name = $1
      `, [sanitizedTable]);

      await pgPool.end();

      const relations: TableRelation[] = [
        ...outgoingResult.rows.map((r: { table: string; column: string; referencedTable: string; referencedColumn: string }) => ({
          table: r.table,
          column: r.column,
          referencedTable: r.referencedTable,
          referencedColumn: r.referencedColumn,
          type: 'many-to-one' as const,
        })),
        ...incomingResult.rows.map((r: { table: string; column: string; referencedTable: string; referencedColumn: string }) => ({
          table: r.table,
          column: r.column,
          referencedTable: r.referencedTable,
          referencedColumn: r.referencedColumn,
          type: 'one-to-many' as const,
        })),
      ];

      return relations;
    } catch (error) {
      await pgPool.end();
      throw error;
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      // Get foreign keys FROM this table
      const [outgoingRows] = await mysqlConn.execute(`
        SELECT
          TABLE_NAME as \`table\`,
          COLUMN_NAME as \`column\`,
          REFERENCED_TABLE_NAME as referencedTable,
          REFERENCED_COLUMN_NAME as referencedColumn
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [conn.database, sanitizedTable]);

      // Get foreign keys TO this table
      const [incomingRows] = await mysqlConn.execute(`
        SELECT
          TABLE_NAME as \`table\`,
          COLUMN_NAME as \`column\`,
          REFERENCED_TABLE_NAME as referencedTable,
          REFERENCED_COLUMN_NAME as referencedColumn
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME = ?
      `, [conn.database, sanitizedTable]);

      await mysqlConn.end();

      const relations: TableRelation[] = [
        ...(outgoingRows as Array<{ table: string; column: string; referencedTable: string; referencedColumn: string }>).map(r => ({
          table: r.table,
          column: r.column,
          referencedTable: r.referencedTable,
          referencedColumn: r.referencedColumn,
          type: 'many-to-one' as const,
        })),
        ...(incomingRows as Array<{ table: string; column: string; referencedTable: string; referencedColumn: string }>).map(r => ({
          table: r.table,
          column: r.column,
          referencedTable: r.referencedTable,
          referencedColumn: r.referencedColumn,
          type: 'one-to-many' as const,
        })),
      ];

      return relations;
    } catch (error) {
      await mysqlConn.end();
      throw error;
    }
  }
};

/**
 * Get related records (for nested routes like /users/:id/orders)
 */
export const getRelatedRecords = async (
  userId: string,
  databaseId: string,
  parentTable: string,
  parentId: string | number,
  relatedTable: string,
  params: ListQueryParams
): Promise<PaginatedResult<CrudRecord>> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const sanitizedParentTable = sanitizeIdentifier(parentTable);
  const sanitizedRelatedTable = sanitizeIdentifier(relatedTable);

  // Find the relation between these tables
  const relations = await getTableRelations(userId, databaseId, parentTable);
  
  // Look for a relation from relatedTable to parentTable (one-to-many from parent's perspective)
  const relation = relations.find(
    r => r.table === relatedTable && r.referencedTable === parentTable
  );

  if (!relation) {
    throw new ValidationError(`No relation found between ${parentTable} and ${relatedTable}`);
  }

  // Add the foreign key filter to params
  const existingFilters = params.filters || [];
  const enhancedParams: ListQueryParams = {
    ...params,
    filters: [
      ...existingFilters,
      { column: relation.column, operator: 'eq', value: parentId },
    ],
  };

  return listRecords(userId, databaseId, relatedTable, enhancedParams);
};
