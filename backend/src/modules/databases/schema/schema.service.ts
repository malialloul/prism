// src/modules/databases/schema/schema.service.ts
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { pool } from '../../../config/db';
import { config } from '../../../config/env';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import type {
  SchemaObjectDto,
  TableDetailsDto,
  ViewDetailsDto,
  ProcedureDetailsDto,
  FunctionDetailsDto,
  ColumnDto,
  IndexDto,
  ConstraintDto,
  QueryResultDto,
  SavedQueryDto,
  CreateTableDto,
  AddColumnDto,
  ModifyColumnDto,
} from './schema.types';

// Encryption helpers - same as in databases.service.ts
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

// Helper to parse PostgreSQL array (may come as string like "{a,b,c}" or actual array)
function parsePgArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    // Parse PostgreSQL array format: {item1,item2,item3}
    const match = value.match(/^\{(.*)?\}$/);
    if (match) {
      const content = match[1];
      if (!content) return [];
      return content.split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    }
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
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
 * Get all schema objects (tables, views, procedures, functions)
 */
export const getSchemaObjectsService = async (
  userId: string,
  databaseId: string
): Promise<SchemaObjectDto[]> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const objects: SchemaObjectDto[] = [];

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      // Get tables
      const tablesResult = await pgPool.query(`
        SELECT table_name as name, table_schema as schema
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      tablesResult.rows.forEach((row: { name: string; schema: string }) => {
        objects.push({ name: row.name, type: 'table', schema: row.schema });
      });

      // Get views
      const viewsResult = await pgPool.query(`
        SELECT table_name as name, table_schema as schema
        FROM information_schema.views 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      viewsResult.rows.forEach((row: { name: string; schema: string }) => {
        objects.push({ name: row.name, type: 'view', schema: row.schema });
      });

      // Get functions
      const functionsResult = await pgPool.query(`
        SELECT routine_name as name, routine_schema as schema, routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        ORDER BY routine_name
      `);
      functionsResult.rows.forEach((row: { name: string; schema: string; routine_type: string }) => {
        objects.push({ 
          name: row.name, 
          type: row.routine_type === 'PROCEDURE' ? 'procedure' : 'function', 
          schema: row.schema 
        });
      });

      // Get indexes (not on primary keys)
      const indexesResult = await pgPool.query(`
        SELECT DISTINCT indexname as name, schemaname as schema
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname NOT LIKE '%_pkey'
        ORDER BY indexname
      `);
      indexesResult.rows.forEach((row: { name: string; schema: string }) => {
        objects.push({ name: row.name, type: 'index', schema: row.schema });
      });

      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      throw error;
    }
  } else {
    // MySQL
    const mysqlConn = await createMysqlConnection(conn);
    try {
      // Get tables
      const [tables] = await mysqlConn.execute(`
        SELECT table_name as name, table_schema as \`schema\`
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `, [conn.database]);
      (tables as Array<{ name: string; schema: string }>).forEach(row => {
        objects.push({ name: row.name, type: 'table', schema: row.schema });
      });

      // Get views
      const [views] = await mysqlConn.execute(`
        SELECT table_name as name, table_schema as \`schema\`
        FROM information_schema.views 
        WHERE table_schema = ?
        ORDER BY table_name
      `, [conn.database]);
      (views as Array<{ name: string; schema: string }>).forEach(row => {
        objects.push({ name: row.name, type: 'view', schema: row.schema });
      });

      // Get procedures
      const [procedures] = await mysqlConn.execute(`
        SELECT routine_name as name, routine_schema as \`schema\`
        FROM information_schema.routines 
        WHERE routine_schema = ? AND routine_type = 'PROCEDURE'
        ORDER BY routine_name
      `, [conn.database]);
      (procedures as Array<{ name: string; schema: string }>).forEach(row => {
        objects.push({ name: row.name, type: 'procedure', schema: row.schema });
      });

      // Get functions
      const [functions] = await mysqlConn.execute(`
        SELECT routine_name as name, routine_schema as \`schema\`
        FROM information_schema.routines 
        WHERE routine_schema = ? AND routine_type = 'FUNCTION'
        ORDER BY routine_name
      `, [conn.database]);
      (functions as Array<{ name: string; schema: string }>).forEach(row => {
        objects.push({ name: row.name, type: 'function', schema: row.schema });
      });

      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      throw error;
    }
  }

  return objects;
};

/**
 * Get table details (columns, indexes, constraints, sample data)
 */
export const getTableDetailsService = async (
  userId: string,
  databaseId: string,
  tableName: string
): Promise<TableDetailsDto> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      // Get columns
      const columnsResult = await pgPool.query(`
        SELECT 
          c.column_name as name,
          c.data_type as type,
          c.is_nullable = 'YES' as nullable,
          c.column_default as default_value,
          CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
          CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
          fk.foreign_table_name,
          fk.foreign_column_name
        FROM information_schema.columns c
        LEFT JOIN (
          SELECT kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY'
        ) pk ON c.column_name = pk.column_name
        LEFT JOIN (
          SELECT 
            kcu.column_name,
            ccu.table_name as foreign_table_name,
            ccu.column_name as foreign_column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
          WHERE tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY'
        ) fk ON c.column_name = fk.column_name
        WHERE c.table_name = $1 AND c.table_schema = 'public'
        ORDER BY c.ordinal_position
      `, [tableName]);

      const columns: ColumnDto[] = columnsResult.rows.map((row: {
        name: string;
        type: string;
        nullable: boolean;
        default_value: string | null;
        is_primary_key: boolean;
        is_foreign_key: boolean;
        foreign_table_name: string | null;
        foreign_column_name: string | null;
      }) => ({
        name: row.name,
        type: row.type,
        nullable: row.nullable,
        defaultValue: row.default_value,
        isPrimaryKey: row.is_primary_key,
        isForeignKey: row.is_foreign_key,
        foreignKeyRef: row.foreign_table_name ? {
          table: row.foreign_table_name,
          column: row.foreign_column_name!,
        } : undefined,
      }));

      // Get indexes
      const indexesResult = await pgPool.query(`
        SELECT 
          i.relname as name,
          array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)) as columns,
          ix.indisunique as is_unique,
          ix.indisprimary as is_primary,
          am.amname as type
        FROM pg_index ix
        JOIN pg_class t ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_am am ON am.oid = i.relam
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE t.relname = $1 AND n.nspname = 'public'
        GROUP BY i.relname, ix.indisunique, ix.indisprimary, am.amname
      `, [tableName]);

      const indexes: IndexDto[] = indexesResult.rows.map((row: {
        name: string;
        columns: unknown;
        is_unique: boolean;
        is_primary: boolean;
        type: string;
      }) => ({
        name: row.name,
        columns: parsePgArray(row.columns),
        isUnique: row.is_unique,
        isPrimary: row.is_primary,
        type: row.type,
      }));

      // Get constraints
      const constraintsResult = await pgPool.query(`
        SELECT 
          tc.constraint_name as name,
          tc.constraint_type as type,
          array_agg(kcu.column_name) as columns,
          ccu.table_name as referenced_table,
          array_agg(ccu.column_name) as referenced_columns,
          cc.check_clause
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name 
          AND tc.constraint_type = 'FOREIGN KEY'
        LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
        WHERE tc.table_name = $1 AND tc.table_schema = 'public'
        GROUP BY tc.constraint_name, tc.constraint_type, ccu.table_name, cc.check_clause
      `, [tableName]);

      const constraints: ConstraintDto[] = constraintsResult.rows.map((row: {
        name: string;
        type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
        columns: unknown;
        referenced_table: string | null;
        referenced_columns: unknown;
        check_clause: string | null;
      }) => ({
        name: row.name,
        type: row.type,
        columns: parsePgArray(row.columns),
        referencedTable: row.referenced_table || undefined,
        referencedColumns: parsePgArray(row.referenced_columns),
        checkClause: row.check_clause || undefined,
      }));

      // Get row count
      const countResult = await pgPool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const rowCount = parseInt(countResult.rows[0].count, 10);

      // Get sample data (first 50 rows)
      const sampleResult = await pgPool.query(`SELECT * FROM "${tableName}" LIMIT 50`);
      const sampleData = sampleResult.rows;

      await pgPool.end();

      return {
        name: tableName,
        schema: 'public',
        columns,
        indexes,
        constraints,
        rowCount,
        sampleData,
      };
    } catch (error) {
      await pgPool.end();
      throw error;
    }
  } else {
    // MySQL
    const mysqlConn = await createMysqlConnection(conn);
    try {
      // Get columns
      const [columnsRows] = await mysqlConn.execute(`
        SELECT 
          c.COLUMN_NAME as name,
          c.DATA_TYPE as type,
          c.IS_NULLABLE = 'YES' as nullable,
          c.COLUMN_DEFAULT as default_value,
          c.COLUMN_KEY = 'PRI' as is_primary_key,
          c.COLUMN_KEY = 'MUL' as is_foreign_key,
          c.EXTRA as extra,
          kcu.REFERENCED_TABLE_NAME as foreign_table,
          kcu.REFERENCED_COLUMN_NAME as foreign_column
        FROM information_schema.columns c
        LEFT JOIN information_schema.key_column_usage kcu 
          ON c.TABLE_SCHEMA = kcu.TABLE_SCHEMA 
          AND c.TABLE_NAME = kcu.TABLE_NAME 
          AND c.COLUMN_NAME = kcu.COLUMN_NAME
          AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        WHERE c.TABLE_SCHEMA = ? AND c.TABLE_NAME = ?
        ORDER BY c.ORDINAL_POSITION
      `, [conn.database, tableName]);

      const columns: ColumnDto[] = (columnsRows as Array<{
        name: string;
        type: string;
        nullable: number;
        default_value: string | null;
        is_primary_key: number;
        is_foreign_key: number;
        extra: string;
        foreign_table: string | null;
        foreign_column: string | null;
      }>).map(row => ({
        name: row.name,
        type: row.type,
        nullable: Boolean(row.nullable),
        defaultValue: row.default_value,
        isPrimaryKey: Boolean(row.is_primary_key),
        isForeignKey: Boolean(row.is_foreign_key),
        extra: row.extra || undefined,
        foreignKeyRef: row.foreign_table ? {
          table: row.foreign_table,
          column: row.foreign_column!,
        } : undefined,
      }));

      // Get indexes
      const [indexRows] = await mysqlConn.execute(`
        SELECT 
          INDEX_NAME as name,
          GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as columns_str,
          NOT NON_UNIQUE as is_unique,
          INDEX_NAME = 'PRIMARY' as is_primary,
          INDEX_TYPE as type
        FROM information_schema.statistics
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        GROUP BY INDEX_NAME, NON_UNIQUE, INDEX_TYPE
      `, [conn.database, tableName]);

      const indexes: IndexDto[] = (indexRows as Array<{
        name: string;
        columns_str: string;
        is_unique: number;
        is_primary: number;
        type: string;
      }>).map(row => ({
        name: row.name,
        columns: row.columns_str.split(','),
        isUnique: Boolean(row.is_unique),
        isPrimary: Boolean(row.is_primary),
        type: row.type,
      }));

      // Get constraints
      const [constraintRows] = await mysqlConn.execute(`
        SELECT 
          tc.CONSTRAINT_NAME as name,
          tc.CONSTRAINT_TYPE as type,
          GROUP_CONCAT(kcu.COLUMN_NAME) as columns_str,
          kcu.REFERENCED_TABLE_NAME as referenced_table,
          GROUP_CONCAT(kcu.REFERENCED_COLUMN_NAME) as referenced_columns_str
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME 
          AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
        WHERE tc.TABLE_SCHEMA = ? AND tc.TABLE_NAME = ?
        GROUP BY tc.CONSTRAINT_NAME, tc.CONSTRAINT_TYPE, kcu.REFERENCED_TABLE_NAME
      `, [conn.database, tableName]);

      const constraints: ConstraintDto[] = (constraintRows as Array<{
        name: string;
        type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
        columns_str: string;
        referenced_table: string | null;
        referenced_columns_str: string | null;
      }>).map(row => ({
        name: row.name,
        type: row.type,
        columns: row.columns_str.split(','),
        referencedTable: row.referenced_table || undefined,
        referencedColumns: row.referenced_columns_str?.split(','),
      }));

      // Get row count
      const [countRows] = await mysqlConn.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      const rowCount = (countRows as Array<{ count: number }>)[0].count;

      // Get sample data
      const [sampleRows] = await mysqlConn.execute(`SELECT * FROM \`${tableName}\` LIMIT 50`);
      const sampleData = sampleRows as Record<string, unknown>[];

      await mysqlConn.end();

      return {
        name: tableName,
        schema: conn.database,
        columns,
        indexes,
        constraints,
        rowCount,
        sampleData,
      };
    } catch (error) {
      await mysqlConn.end();
      throw error;
    }
  }
};

/**
 * Get view details
 */
export const getViewDetailsService = async (
  userId: string,
  databaseId: string,
  viewName: string
): Promise<ViewDetailsDto> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      // Get view definition
      const defResult = await pgPool.query(`
        SELECT definition FROM pg_views WHERE viewname = $1 AND schemaname = 'public'
      `, [viewName]);

      if (defResult.rowCount === 0) {
        throw new NotFoundError('View not found');
      }

      // Get columns
      const columnsResult = await pgPool.query(`
        SELECT column_name as name, data_type as type, is_nullable = 'YES' as nullable
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [viewName]);

      await pgPool.end();

      return {
        name: viewName,
        schema: 'public',
        definition: defResult.rows[0].definition,
        columns: columnsResult.rows.map((row: { name: string; type: string; nullable: boolean }) => ({
          name: row.name,
          type: row.type,
          nullable: row.nullable,
          defaultValue: null,
          isPrimaryKey: false,
          isForeignKey: false,
        })),
      };
    } catch (error) {
      await pgPool.end();
      throw error;
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      // Get view definition
      const [defRows] = await mysqlConn.execute(`
        SELECT VIEW_DEFINITION as definition
        FROM information_schema.views
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      `, [conn.database, viewName]);

      const defResult = defRows as Array<{ definition: string }>;
      if (defResult.length === 0) {
        throw new NotFoundError('View not found');
      }

      // Get columns
      const [columnsRows] = await mysqlConn.execute(`
        SELECT COLUMN_NAME as name, DATA_TYPE as type, IS_NULLABLE = 'YES' as nullable
        FROM information_schema.columns
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [conn.database, viewName]);

      await mysqlConn.end();

      return {
        name: viewName,
        schema: conn.database,
        definition: defResult[0].definition,
        columns: (columnsRows as Array<{ name: string; type: string; nullable: number }>).map(row => ({
          name: row.name,
          type: row.type,
          nullable: Boolean(row.nullable),
          defaultValue: null,
          isPrimaryKey: false,
          isForeignKey: false,
        })),
      };
    } catch (error) {
      await mysqlConn.end();
      throw error;
    }
  }
};

/**
 * Get procedure details
 */
export const getProcedureDetailsService = async (
  userId: string,
  databaseId: string,
  procedureName: string
): Promise<ProcedureDetailsDto> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      const result = await pgPool.query(`
        SELECT 
          p.proname as name,
          n.nspname as schema,
          pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = $1 AND n.nspname = 'public' AND p.prokind = 'p'
      `, [procedureName]);

      if (result.rowCount === 0) {
        throw new NotFoundError('Procedure not found');
      }

      // Get parameters
      const paramsResult = await pgPool.query(`
        SELECT 
          p.parameter_name as name,
          p.data_type as type,
          p.parameter_mode as mode
        FROM information_schema.parameters p
        WHERE p.specific_schema = 'public' 
          AND p.specific_name LIKE $1 || '_%'
        ORDER BY p.ordinal_position
      `, [procedureName]);

      await pgPool.end();

      return {
        name: procedureName,
        schema: 'public',
        definition: result.rows[0].definition,
        parameters: paramsResult.rows.map((row: { name: string; type: string; mode: string }) => ({
          name: row.name || '',
          type: row.type,
          mode: row.mode as 'IN' | 'OUT' | 'INOUT',
        })),
      };
    } catch (error) {
      await pgPool.end();
      throw error;
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      const [routineRows] = await mysqlConn.execute(`
        SELECT ROUTINE_NAME as name, ROUTINE_SCHEMA as \`schema\`, ROUTINE_DEFINITION as definition
        FROM information_schema.routines
        WHERE ROUTINE_SCHEMA = ? AND ROUTINE_NAME = ? AND ROUTINE_TYPE = 'PROCEDURE'
      `, [conn.database, procedureName]);

      const routines = routineRows as Array<{ name: string; schema: string; definition: string }>;
      if (routines.length === 0) {
        throw new NotFoundError('Procedure not found');
      }

      // Get parameters
      const [paramRows] = await mysqlConn.execute(`
        SELECT PARAMETER_NAME as name, DATA_TYPE as type, PARAMETER_MODE as mode
        FROM information_schema.parameters
        WHERE SPECIFIC_SCHEMA = ? AND SPECIFIC_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [conn.database, procedureName]);

      await mysqlConn.end();

      return {
        name: procedureName,
        schema: conn.database,
        definition: routines[0].definition || '',
        parameters: (paramRows as Array<{ name: string; type: string; mode: string }>).map(row => ({
          name: row.name || '',
          type: row.type,
          mode: row.mode as 'IN' | 'OUT' | 'INOUT',
        })),
      };
    } catch (error) {
      await mysqlConn.end();
      throw error;
    }
  }
};

/**
 * Get function details
 */
export const getFunctionDetailsService = async (
  userId: string,
  databaseId: string,
  functionName: string
): Promise<FunctionDetailsDto> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      const result = await pgPool.query(`
        SELECT 
          p.proname as name,
          n.nspname as schema,
          pg_get_functiondef(p.oid) as definition,
          pg_get_function_result(p.oid) as return_type
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = $1 AND n.nspname = 'public' AND p.prokind = 'f'
      `, [functionName]);

      if (result.rowCount === 0) {
        throw new NotFoundError('Function not found');
      }

      // Get parameters
      const paramsResult = await pgPool.query(`
        SELECT p.parameter_name as name, p.data_type as type
        FROM information_schema.parameters p
        WHERE p.specific_schema = 'public' 
          AND p.specific_name LIKE $1 || '_%'
          AND p.parameter_mode = 'IN'
        ORDER BY p.ordinal_position
      `, [functionName]);

      await pgPool.end();

      return {
        name: functionName,
        schema: 'public',
        definition: result.rows[0].definition,
        returnType: result.rows[0].return_type,
        parameters: paramsResult.rows.map((row: { name: string; type: string }) => ({
          name: row.name || '',
          type: row.type,
        })),
      };
    } catch (error) {
      await pgPool.end();
      throw error;
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      const [routineRows] = await mysqlConn.execute(`
        SELECT 
          ROUTINE_NAME as name, 
          ROUTINE_SCHEMA as \`schema\`, 
          ROUTINE_DEFINITION as definition,
          DATA_TYPE as return_type
        FROM information_schema.routines
        WHERE ROUTINE_SCHEMA = ? AND ROUTINE_NAME = ? AND ROUTINE_TYPE = 'FUNCTION'
      `, [conn.database, functionName]);

      const routines = routineRows as Array<{ name: string; schema: string; definition: string; return_type: string }>;
      if (routines.length === 0) {
        throw new NotFoundError('Function not found');
      }

      // Get parameters
      const [paramRows] = await mysqlConn.execute(`
        SELECT PARAMETER_NAME as name, DATA_TYPE as type
        FROM information_schema.parameters
        WHERE SPECIFIC_SCHEMA = ? AND SPECIFIC_NAME = ? AND PARAMETER_MODE = 'IN'
        ORDER BY ORDINAL_POSITION
      `, [conn.database, functionName]);

      await mysqlConn.end();

      return {
        name: functionName,
        schema: conn.database,
        definition: routines[0].definition || '',
        returnType: routines[0].return_type,
        parameters: (paramRows as Array<{ name: string; type: string }>).map(row => ({
          name: row.name || '',
          type: row.type,
        })),
      };
    } catch (error) {
      await mysqlConn.end();
      throw error;
    }
  }
};

/**
 * Execute a SQL query
 */
export const executeQueryService = async (
  userId: string,
  databaseId: string,
  sql: string
): Promise<QueryResultDto> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const startTime = Date.now();

  // Basic SQL injection prevention - block dangerous commands
  const lowerSql = sql.toLowerCase().trim();
  const dangerousCommands = ['drop database', 'drop schema', 'truncate database'];
  if (dangerousCommands.some(cmd => lowerSql.includes(cmd))) {
    throw new ValidationError('This command is not allowed for safety reasons.');
  }

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      const result = await pgPool.query(sql);
      const executionTimeMs = Date.now() - startTime;
      await pgPool.end();

      // Handle different result types
      if (result.command === 'SELECT') {
        return {
          success: true,
          columns: result.fields.map(f => f.name),
          rows: result.rows,
          rowCount: result.rowCount || 0,
          executionTimeMs,
        };
      } else {
        // DDL commands (CREATE, DROP, ALTER) or DML commands (INSERT, UPDATE, DELETE)
        const isDDL = ['CREATE', 'DROP', 'ALTER', 'TRUNCATE'].includes(result.command || '');
        const message = isDDL
          ? `${result.command} executed successfully.`
          : `Query executed successfully. ${result.rowCount || 0} rows affected.`;
        
        return {
          success: true,
          message,
          affectedRows: result.rowCount || 0,
          executionTimeMs,
        };
      }
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Query execution failed';
      return {
        success: false,
        message,
        executionTimeMs: Date.now() - startTime,
      };
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      const [rows, fields] = await mysqlConn.execute(sql);
      const executionTimeMs = Date.now() - startTime;
      await mysqlConn.end();

      // Check if it's a result set or an affected rows result
      if (Array.isArray(rows) && fields) {
        return {
          success: true,
          columns: (fields as Array<{ name: string }>).map(f => f.name),
          rows: rows as Record<string, unknown>[],
          rowCount: rows.length,
          executionTimeMs,
        };
      } else {
        const resultInfo = rows as { affectedRows?: number; insertId?: number };
        return {
          success: true,
          message: `Query executed successfully. Affected rows: ${resultInfo.affectedRows || 0}`,
          affectedRows: resultInfo.affectedRows || 0,
          executionTimeMs,
        };
      }
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Query execution failed';
      return {
        success: false,
        message,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
};

/**
 * Get saved queries for a database
 */
export const getSavedQueriesService = async (
  userId: string,
  databaseId: string
): Promise<SavedQueryDto[]> => {
  const result = await pool.query(
    `SELECT id, database_id, name, sql, created_at, updated_at
     FROM saved_queries
     WHERE user_id = $1 AND database_id = $2
     ORDER BY updated_at DESC`,
    [userId, databaseId]
  );

  return result.rows.map((row: {
    id: string;
    database_id: string;
    name: string;
    sql: string;
    created_at: Date;
    updated_at: Date;
  }) => ({
    id: row.id,
    databaseId: row.database_id,
    name: row.name,
    sql: row.sql,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

/**
 * Save a query
 */
export const saveQueryService = async (
  userId: string,
  databaseId: string,
  name: string,
  sql: string
): Promise<SavedQueryDto> => {
  // Verify database belongs to user
  const dbCheck = await pool.query(
    'SELECT 1 FROM database_connections WHERE id = $1 AND user_id = $2',
    [databaseId, userId]
  );
  if (dbCheck.rowCount === 0) {
    throw new NotFoundError('Database not found');
  }

  const result = await pool.query(
    `INSERT INTO saved_queries (user_id, database_id, name, sql)
     VALUES ($1, $2, $3, $4)
     RETURNING id, database_id, name, sql, created_at, updated_at`,
    [userId, databaseId, name, sql]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    databaseId: row.database_id,
    name: row.name,
    sql: row.sql,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Delete a saved query
 */
export const deleteQueryService = async (
  userId: string,
  queryId: string
): Promise<void> => {
  const result = await pool.query(
    'DELETE FROM saved_queries WHERE id = $1 AND user_id = $2',
    [queryId, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('Query not found');
  }
};

/**
 * Create a new table
 */
export const createTableService = async (
  userId: string,
  databaseId: string,
  tableData: CreateTableDto
): Promise<void> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const { name, columns } = tableData;

  // Build CREATE TABLE SQL
  const columnDefs = columns.map(col => {
    let def = '';
    if (conn.engine === 'postgres') {
      def = `"${col.name}" ${col.type}`;
      if (col.autoIncrement) {
        def = `"${col.name}" SERIAL`;
      }
      if (!col.nullable) def += ' NOT NULL';
      if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
      if (col.isPrimaryKey) def += ' PRIMARY KEY';
    } else {
      def = `\`${col.name}\` ${col.type}`;
      if (!col.nullable) def += ' NOT NULL';
      if (col.autoIncrement) def += ' AUTO_INCREMENT';
      if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
      if (col.isPrimaryKey) def += ' PRIMARY KEY';
    }
    return def;
  });

  const sql = conn.engine === 'postgres'
    ? `CREATE TABLE "${name}" (${columnDefs.join(', ')})`
    : `CREATE TABLE \`${name}\` (${columnDefs.join(', ')})`;

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      await pgPool.query(sql);
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to create table';
      throw new ValidationError(message);
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      await mysqlConn.execute(sql);
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to create table';
      throw new ValidationError(message);
    }
  }
};

/**
 * Add a column to an existing table
 */
export const addColumnService = async (
  userId: string,
  databaseId: string,
  tableName: string,
  column: AddColumnDto
): Promise<void> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  let sql: string;
  if (conn.engine === 'postgres') {
    sql = `ALTER TABLE "${tableName}" ADD COLUMN "${column.name}" ${column.type}`;
    if (!column.nullable) sql += ' NOT NULL';
    if (column.defaultValue) sql += ` DEFAULT ${column.defaultValue}`;
  } else {
    sql = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${column.name}\` ${column.type}`;
    if (!column.nullable) sql += ' NOT NULL';
    if (column.defaultValue) sql += ` DEFAULT ${column.defaultValue}`;
    if (column.afterColumn) sql += ` AFTER \`${column.afterColumn}\``;
  }

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      await pgPool.query(sql);
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to add column';
      throw new ValidationError(message);
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      await mysqlConn.execute(sql);
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to add column';
      throw new ValidationError(message);
    }
  }
};

/**
 * Modify an existing column
 */
export const modifyColumnService = async (
  userId: string,
  databaseId: string,
  tableName: string,
  column: ModifyColumnDto
): Promise<void> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      // PostgreSQL requires separate statements for each modification
      if (column.newName && column.newName !== column.name) {
        await pgPool.query(`ALTER TABLE "${tableName}" RENAME COLUMN "${column.name}" TO "${column.newName}"`);
      }
      const colName = column.newName || column.name;
      if (column.type) {
        await pgPool.query(`ALTER TABLE "${tableName}" ALTER COLUMN "${colName}" TYPE ${column.type}`);
      }
      if (column.nullable !== undefined) {
        if (column.nullable) {
          await pgPool.query(`ALTER TABLE "${tableName}" ALTER COLUMN "${colName}" DROP NOT NULL`);
        } else {
          await pgPool.query(`ALTER TABLE "${tableName}" ALTER COLUMN "${colName}" SET NOT NULL`);
        }
      }
      if (column.defaultValue !== undefined) {
        if (column.defaultValue) {
          await pgPool.query(`ALTER TABLE "${tableName}" ALTER COLUMN "${colName}" SET DEFAULT ${column.defaultValue}`);
        } else {
          await pgPool.query(`ALTER TABLE "${tableName}" ALTER COLUMN "${colName}" DROP DEFAULT`);
        }
      }
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to modify column';
      throw new ValidationError(message);
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      // MySQL uses MODIFY or CHANGE
      if (column.newName && column.newName !== column.name) {
        // CHANGE for renaming
        let sql = `ALTER TABLE \`${tableName}\` CHANGE \`${column.name}\` \`${column.newName}\``;
        if (column.type) sql += ` ${column.type}`;
        if (column.nullable === false) sql += ' NOT NULL';
        if (column.defaultValue) sql += ` DEFAULT ${column.defaultValue}`;
        await mysqlConn.execute(sql);
      } else if (column.type || column.nullable !== undefined || column.defaultValue !== undefined) {
        let sql = `ALTER TABLE \`${tableName}\` MODIFY \`${column.name}\``;
        if (column.type) sql += ` ${column.type}`;
        if (column.nullable === false) sql += ' NOT NULL';
        if (column.defaultValue) sql += ` DEFAULT ${column.defaultValue}`;
        await mysqlConn.execute(sql);
      }
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to modify column';
      throw new ValidationError(message);
    }
  }
};

/**
 * Drop a column from a table
 */
export const dropColumnService = async (
  userId: string,
  databaseId: string,
  tableName: string,
  columnName: string
): Promise<void> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  const sql = conn.engine === 'postgres'
    ? `ALTER TABLE "${tableName}" DROP COLUMN "${columnName}"`
    : `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``;

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      await pgPool.query(sql);
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to drop column';
      throw new ValidationError(message);
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      await mysqlConn.execute(sql);
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to drop column';
      throw new ValidationError(message);
    }
  }
};

/**
 * Drop a table
 */
export const dropTableService = async (
  userId: string,
  databaseId: string,
  tableName: string
): Promise<void> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  const sql = conn.engine === 'postgres'
    ? `DROP TABLE "${tableName}"`
    : `DROP TABLE \`${tableName}\``;

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      await pgPool.query(sql);
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to drop table';
      throw new ValidationError(message);
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      await mysqlConn.execute(sql);
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to drop table';
      throw new ValidationError(message);
    }
  }
};
