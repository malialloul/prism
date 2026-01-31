// src/modules/databases/schema/schema.service.ts
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { pool } from '../../../config/db';
import { config } from '../../../config/env';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { logQueryExecution, detectQueryType } from '../queryStats.service';
import type {
  SchemaObjectDto,
  TableDetailsDto,
  ColumnDto,
  IndexDto,
  ConstraintDto,
  QueryResultDto,
  SavedQueryDto,
  CreateTableDto,
  AddColumnDto,
  ModifyColumnDto,
} from './schema.types';

// Internal types for deprecated view/function/procedure features (kept for backward compatibility)
interface ViewDetailsDto {
  name: string;
  schema: string;
  definition: string;
  columns: ColumnDto[];
}

interface ProcedureDetailsDto {
  name: string;
  schema: string;
  definition: string;
  parameters: Array<{ name: string; type: string; mode: string }>;
}

interface FunctionDetailsDto {
  name: string;
  schema: string;
  definition: string;
  returnType: string;
  parameters: Array<{ name: string; type: string }>;
}

interface CreateViewDto {
  name: string;
  definition: string;
}

interface CreateFunctionDto {
  name: string;
  returnType: string;
  parameters: Array<{ name: string; type: string }>;
  body: string;
  language?: string;
  isEdit?: boolean;
}

interface CreateProcedureDto {
  name: string;
  parameters: Array<{ name: string; type: string; mode: string }>;
  body: string;
  language?: string;
  isEdit?: boolean;
}

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
 * Get all schema objects (tables only)
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
      // Get tables only
      const tablesResult = await pgPool.query(`
        SELECT table_name as name, table_schema as schema
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      tablesResult.rows.forEach((row: { name: string; schema: string }) => {
        objects.push({ name: row.name, type: 'table', schema: row.schema });
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
      // Get tables only
      const [tables] = await mysqlConn.execute(`
        SELECT table_name as name, table_schema as \`schema\`
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `, [conn.database]);
      (tables as Array<{ name: string; schema: string }>).forEach(row => {
        objects.push({ name: row.name, type: 'table', schema: row.schema });
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

      // Get parameters with proper type names (including array types like integer[])
      // Use proallargtypes when available (has OUT/INOUT params), otherwise proargtypes
      const paramsResult = await pgPool.query(`
        SELECT 
          COALESCE(p.proargnames[gs.i], '') as name,
          format_type(
            COALESCE(p.proallargtypes[gs.i], p.proargtypes[gs.i-1]), 
            NULL
          ) as type,
          CASE 
            WHEN p.proargmodes IS NULL THEN 'IN'
            WHEN p.proargmodes[gs.i] = 'i' THEN 'IN'
            WHEN p.proargmodes[gs.i] = 'o' THEN 'OUT'
            WHEN p.proargmodes[gs.i] = 'b' THEN 'INOUT'
            ELSE 'IN'
          END as mode
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        CROSS JOIN LATERAL generate_series(
          1, 
          COALESCE(array_length(p.proallargtypes, 1), p.pronargs)
        ) as gs(i)
        WHERE p.proname = $1 AND n.nspname = 'public' AND p.prokind = 'p'
        ORDER BY gs.i
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

      // Get parameters with proper type names (including array types like integer[])
      // For functions, we only want IN parameters (no OUT/INOUT for regular functions)
      const paramsResult = await pgPool.query(`
        SELECT 
          COALESCE(p.proargnames[gs.i], '') as name,
          format_type(p.proargtypes[gs.i-1], NULL) as type
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        CROSS JOIN LATERAL generate_series(1, p.pronargs) as gs(i)
        WHERE p.proname = $1 AND n.nspname = 'public' AND p.prokind = 'f'
        ORDER BY gs.i
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
  const queryType = detectQueryType(sql);
  const userIdNum = parseInt(userId, 10);
  const databaseIdNum = parseInt(databaseId, 10);

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

      // Log the successful query execution
      await logQueryExecution({
        userId: userIdNum,
        databaseId: databaseIdNum,
        queryType,
        executionTimeMs,
        rowsAffected: result.rowCount || 0,
        success: true,
      }).catch(err => console.error('Failed to log query execution:', err));

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
      const executionTimeMs = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Query execution failed';

      // Log the failed query execution
      await logQueryExecution({
        userId: userIdNum,
        databaseId: databaseIdNum,
        queryType,
        executionTimeMs,
        rowsAffected: 0,
        success: false,
        errorMessage: message,
      }).catch(err => console.error('Failed to log query execution:', err));

      return {
        success: false,
        message,
        executionTimeMs,
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
        // Log the successful query execution
        await logQueryExecution({
          userId: userIdNum,
          databaseId: databaseIdNum,
          queryType,
          executionTimeMs,
          rowsAffected: rows.length,
          success: true,
        }).catch(err => console.error('Failed to log query execution:', err));

        return {
          success: true,
          columns: (fields as Array<{ name: string }>).map(f => f.name),
          rows: rows as Record<string, unknown>[],
          rowCount: rows.length,
          executionTimeMs,
        };
      } else {
        const resultInfo = rows as { affectedRows?: number; insertId?: number };

        // Log the successful query execution
        await logQueryExecution({
          userId: userIdNum,
          databaseId: databaseIdNum,
          queryType,
          executionTimeMs,
          rowsAffected: resultInfo.affectedRows || 0,
          success: true,
        }).catch(err => console.error('Failed to log query execution:', err));

        return {
          success: true,
          message: `Query executed successfully. Affected rows: ${resultInfo.affectedRows || 0}`,
          affectedRows: resultInfo.affectedRows || 0,
          executionTimeMs,
        };
      }
    } catch (error) {
      await mysqlConn.end();
      const executionTimeMs = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Query execution failed';

      // Log the failed query execution
      await logQueryExecution({
        userId: userIdNum,
        databaseId: databaseIdNum,
        queryType,
        executionTimeMs,
        rowsAffected: 0,
        success: false,
        errorMessage: message,
      }).catch(err => console.error('Failed to log query execution:', err));

      return {
        success: false,
        message,
        executionTimeMs,
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
    `SELECT id, database_id, name, slug, description, sql, parameters, method, is_public, created_at, updated_at
     FROM saved_queries
     WHERE user_id = $1 AND database_id = $2
     ORDER BY updated_at DESC`,
    [userId, databaseId]
  );

  return result.rows.map((row: any) => ({
    id: row.id,
    databaseId: row.database_id,
    name: row.name,
    description: row.description,
    sql: row.sql,
    parameters: row.parameters ? JSON.parse(row.parameters) : [],
    method: row.method || 'GET',
    isPublic: row.is_public || false,
    endpoint: `/databases/${row.database_id}/api/${row.slug || row.id}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

/**
 * Generate a URL-friendly slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')     // Remove leading/trailing hyphens
    .substring(0, 100);          // Limit length
}

/**
 * Save a query (API)
 */
export const saveQueryService = async (
  userId: string,
  databaseId: string,
  name: string,
  sql: string,
  description?: string,
  parameters?: any[],
  method: string = 'GET',
  isPublic: boolean = false
): Promise<SavedQueryDto> => {
  // Verify database belongs to user
  const dbCheck = await pool.query(
    'SELECT 1 FROM database_connections WHERE id = $1 AND user_id = $2',
    [databaseId, userId]
  );
  if (dbCheck.rowCount === 0) {
    throw new NotFoundError('Database not found');
  }

  // Generate slug from name
  const slug = generateSlug(name);
  
  // Check if slug already exists for this database
  const existingSlug = await pool.query(
    'SELECT id, name FROM saved_queries WHERE database_id = $1 AND slug = $2',
    [databaseId, slug]
  );
  if (existingSlug.rowCount && existingSlug.rowCount > 0) {
    throw new ValidationError(`An API with a similar name already exists: "${existingSlug.rows[0].name}". Please choose a different name.`);
  }

  const parametersJson = parameters ? JSON.stringify(parameters) : null;

  const result = await pool.query(
    `INSERT INTO saved_queries (user_id, database_id, name, slug, description, sql, parameters, method, is_public)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, database_id, name, slug, description, sql, parameters, method, is_public, created_at, updated_at`,
    [userId, databaseId, name, slug, description, sql, parametersJson, method, isPublic]
  );

  // Increment the apis count in database_connections
  await pool.query(
    'UPDATE database_connections SET apis = apis + 1 WHERE id = $1',
    [databaseId]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    databaseId: row.database_id,
    name: row.name,
    description: row.description,
    sql: row.sql,
    parameters: row.parameters ? JSON.parse(row.parameters) : [],
    method: row.method,
    isPublic: row.is_public,
    endpoint: `/databases/${row.database_id}/api/${row.slug}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Execute a saved query with parameters
 * @param queryIdOrSlug - Can be either the numeric ID or the slug
 */
export const executeSavedQueryService = async (
  userId: string,
  databaseId: string,
  queryIdOrSlug: string,
  params: Record<string, any>
): Promise<QueryResultDto> => {
  // Get the saved query - try by slug first, then by ID
  const isNumeric = /^\d+$/.test(queryIdOrSlug);
  
  let queryResult;
  if (isNumeric) {
    // Try to find by ID
    queryResult = await pool.query(
      `SELECT sq.*, dc.engine
       FROM saved_queries sq
       JOIN database_connections dc ON sq.database_id = dc.id
       WHERE sq.id = $1 AND sq.database_id = $2 AND (sq.user_id = $3 OR sq.is_public = true)`,
      [queryIdOrSlug, databaseId, userId]
    );
  }
  
  // If not found by ID or not numeric, try by slug
  if (!queryResult || queryResult.rowCount === 0) {
    queryResult = await pool.query(
      `SELECT sq.*, dc.engine
       FROM saved_queries sq
       JOIN database_connections dc ON sq.database_id = dc.id
       WHERE sq.slug = $1 AND sq.database_id = $2 AND (sq.user_id = $3 OR sq.is_public = true)`,
      [queryIdOrSlug, databaseId, userId]
    );
  }

  if (queryResult.rowCount === 0) {
    throw new NotFoundError('API not found');
  }

  const savedQuery = queryResult.rows[0];
  let sql = savedQuery.sql;
  const parameters: any[] = savedQuery.parameters ? JSON.parse(savedQuery.parameters) : [];

  // Handle pagination only if the SQL contains pagination placeholders
  // This means pagination was enabled when the query was created
  if (sql.includes(':pagesize') || sql.includes(':offset')) {
    // pagecount is 1-indexed, offset = (pagecount - 1) * pagesize
    const pagesize = params['pagesize'] ? parseInt(params['pagesize']) : 100;
    const pagecount = params['pagecount'] ? parseInt(params['pagecount']) : 1;
    const offset = (pagecount - 1) * pagesize;
    
    // Replace pagination placeholders in SQL
    sql = sql.split(':pagesize').join(String(pagesize));
    sql = sql.split(':offset').join(String(offset));
  }

  // Replace other parameters in SQL
  for (const param of parameters) {
    // Skip pagination params as they're already handled
    if (param.name === 'pagesize' || param.name === 'pagecount') {
      continue;
    }
    
    const value = params[param.name];
    if (value === undefined && param.required !== false) {
      throw new ValidationError(`Missing required parameter: ${param.name}`);
    }
    
    if (value !== undefined) {
      // Format value based on operator and type
      let formattedValue: string;
      const colType = (param.columnType || '').toLowerCase();
      const numericTypes = ['int', 'integer', 'smallint', 'bigint', 'decimal', 'numeric', 'float', 'double', 'real', 'serial', 'bigserial'];
      const isNumericType = numericTypes.some(t => colType === t || colType.startsWith(t + '('));
      const isNumericValue = !isNaN(Number(value)) && String(value) !== '';
      
      const escapedValue = String(value).replace(/'/g, "''");
      
      if (param.operator === 'contains') {
        formattedValue = `'%${escapedValue}%'`;
      } else if (param.operator === 'starts_with') {
        formattedValue = `'${escapedValue}%'`;
      } else if (param.operator === 'ends_with') {
        formattedValue = `'%${escapedValue}'`;
      } else if (isNumericType && isNumericValue) {
        formattedValue = String(value);
      } else {
        formattedValue = `'${escapedValue}'`;
      }
      
      // Replace all occurrences of the parameter
      sql = sql.split(`:${param.name}`).join(formattedValue);
    }
  }

  // Execute the query on the user's database
  const conn = await getDatabaseConnection(userId, databaseId);
  const startTime = Date.now();
  
  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      const result = await pgPool.query(sql);
      const executionTimeMs = Date.now() - startTime;
      await pgPool.end();

      return {
        success: true,
        columns: result.fields?.map((f: any) => f.name) || [],
        rows: result.rows || [],
        rowCount: result.rowCount || result.rows?.length || 0,
        executionTimeMs,
      };
    } catch (error: any) {
      await pgPool.end();
      throw new ValidationError(error.message || 'Query execution failed');
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      const [rows, fields] = await mysqlConn.execute(sql);
      const executionTimeMs = Date.now() - startTime;
      await mysqlConn.end();

      if (Array.isArray(rows) && fields) {
        return {
          success: true,
          columns: (fields as Array<{ name: string }>).map(f => f.name),
          rows: rows as Record<string, unknown>[],
          rowCount: rows.length,
          executionTimeMs,
        };
      } else {
        const resultInfo = rows as { affectedRows?: number };
        return {
          success: true,
          message: `Query executed successfully. Affected rows: ${resultInfo.affectedRows || 0}`,
          affectedRows: resultInfo.affectedRows || 0,
          executionTimeMs,
        };
      }
    } catch (error: any) {
      await mysqlConn.end();
      throw new ValidationError(error.message || 'Query execution failed');
    }
  }
};

/**
 * Execute a PUBLIC saved query with parameters (no authentication required)
 */
export const executePublicQueryService = async (
  databaseId: string,
  queryIdOrSlug: string,
  params: Record<string, any>
): Promise<QueryResultDto> => {
  // Get the saved query - only if it's public
  const isNumeric = /^\d+$/.test(queryIdOrSlug);
  
  let queryResult;
  if (isNumeric) {
    queryResult = await pool.query(
      `SELECT sq.*, dc.engine, dc.host, dc.port, dc.username, dc.password_encrypted, dc.database, dc.ssl
       FROM saved_queries sq
       JOIN database_connections dc ON sq.database_id = dc.id
       WHERE sq.id = $1 AND sq.database_id = $2 AND sq.is_public = true`,
      [queryIdOrSlug, databaseId]
    );
  }
  
  if (!queryResult || queryResult.rowCount === 0) {
    queryResult = await pool.query(
      `SELECT sq.*, dc.engine, dc.host, dc.port, dc.username, dc.password_encrypted, dc.database, dc.ssl
       FROM saved_queries sq
       JOIN database_connections dc ON sq.database_id = dc.id
       WHERE sq.slug = $1 AND sq.database_id = $2 AND sq.is_public = true`,
      [queryIdOrSlug, databaseId]
    );
  }

  if (queryResult.rowCount === 0) {
    throw new NotFoundError('Public API not found');
  }

  const savedQuery = queryResult.rows[0];
  let sql = savedQuery.sql;
  const parameters: any[] = savedQuery.parameters ? JSON.parse(savedQuery.parameters) : [];

  // Handle pagination only if the SQL contains pagination placeholders
  if (sql.includes(':pagesize') || sql.includes(':offset')) {
    const pagesize = params['pagesize'] ? parseInt(params['pagesize']) : 100;
    const pagecount = params['pagecount'] ? parseInt(params['pagecount']) : 1;
    const offset = (pagecount - 1) * pagesize;
    
    sql = sql.split(':pagesize').join(String(pagesize));
    sql = sql.split(':offset').join(String(offset));
  }

  // Replace parameters in SQL
  for (const param of parameters) {
    // Skip pagination params as they're already handled
    if (param.name === 'pagesize' || param.name === 'pagecount') {
      continue;
    }
    
    const value = params[param.name];
    if (value === undefined && param.required !== false) {
      throw new ValidationError(`Missing required parameter: ${param.name}`);
    }
    
    if (value !== undefined) {
      let formattedValue: string;
      const colType = (param.columnType || '').toLowerCase();
      const numericTypes = ['int', 'integer', 'smallint', 'bigint', 'decimal', 'numeric', 'float', 'double', 'real', 'serial', 'bigserial'];
      const isNumericType = numericTypes.some(t => colType === t || colType.startsWith(t + '('));
      const isNumericValue = !isNaN(Number(value)) && String(value) !== '';
      
      const escapedValue = String(value).replace(/'/g, "''");
      
      if (param.operator === 'contains') {
        formattedValue = `'%${escapedValue}%'`;
      } else if (param.operator === 'starts_with') {
        formattedValue = `'${escapedValue}%'`;
      } else if (param.operator === 'ends_with') {
        formattedValue = `'%${escapedValue}'`;
      } else if (isNumericType && isNumericValue) {
        formattedValue = String(value);
      } else {
        formattedValue = `'${escapedValue}'`;
      }
      
      sql = sql.split(`:${param.name}`).join(formattedValue);
    }
  }

  // Execute on the database using connection info from the query
  const conn = {
    engine: savedQuery.engine as 'postgres' | 'mysql',
    host: savedQuery.host,
    port: savedQuery.port,
    username: savedQuery.username,
    password: decrypt(savedQuery.password_encrypted),
    database: savedQuery.database,
    ssl: savedQuery.ssl,
  };
  
  const startTime = Date.now();
  
  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      const result = await pgPool.query(sql);
      const executionTimeMs = Date.now() - startTime;
      await pgPool.end();

      return {
        success: true,
        columns: result.fields?.map((f: any) => f.name) || [],
        rows: result.rows || [],
        rowCount: result.rowCount || result.rows?.length || 0,
        executionTimeMs,
      };
    } catch (error: any) {
      await pgPool.end();
      throw new ValidationError(error.message || 'Query execution failed');
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      const [rows, fields] = await mysqlConn.execute(sql);
      const executionTimeMs = Date.now() - startTime;
      await mysqlConn.end();

      if (Array.isArray(rows) && fields) {
        return {
          success: true,
          columns: (fields as Array<{ name: string }>).map(f => f.name),
          rows: rows as Record<string, unknown>[],
          rowCount: rows.length,
          executionTimeMs,
        };
      } else {
        const resultInfo = rows as { affectedRows?: number };
        return {
          success: true,
          message: `Query executed successfully. Affected rows: ${resultInfo.affectedRows || 0}`,
          affectedRows: resultInfo.affectedRows || 0,
          executionTimeMs,
        };
      }
    } catch (error: any) {
      await mysqlConn.end();
      throw new ValidationError(error.message || 'Query execution failed');
    }
  }
};

/**
 * Toggle API public/private status
 */
export const toggleApiPublicService = async (
  userId: string,
  queryId: string,
  isPublic: boolean
): Promise<void> => {
  const result = await pool.query(
    'UPDATE saved_queries SET is_public = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
    [isPublic, queryId, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('API not found');
  }
};

/**
 * Delete a saved query
 */
export const deleteQueryService = async (
  userId: string,
  queryId: string
): Promise<void> => {
  // First get the database_id before deleting
  const queryInfo = await pool.query(
    'SELECT database_id FROM saved_queries WHERE id = $1 AND user_id = $2',
    [queryId, userId]
  );

  if (queryInfo.rowCount === 0) {
    throw new NotFoundError('Query not found');
  }

  const databaseId = queryInfo.rows[0].database_id;

  const result = await pool.query(
    'DELETE FROM saved_queries WHERE id = $1 AND user_id = $2',
    [queryId, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('Query not found');
  }

  // Decrement the apis count in database_connections
  await pool.query(
    'UPDATE database_connections SET apis = GREATEST(apis - 1, 0) WHERE id = $1',
    [databaseId]
  );
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

/**
 * Create a new view
 */
export const createViewService = async (
  userId: string,
  databaseId: string,
  viewData: CreateViewDto
): Promise<void> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const { name, definition } = viewData;

  // Validate that the definition is a SELECT statement
  const normalizedDef = definition.trim().toUpperCase();
  if (!normalizedDef.startsWith('SELECT')) {
    throw new ValidationError('View definition must be a SELECT statement');
  }

  const sql = conn.engine === 'postgres'
    ? `CREATE VIEW "${name}" AS ${definition}`
    : `CREATE VIEW \`${name}\` AS ${definition}`;

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      await pgPool.query(sql);
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to create view';
      throw new ValidationError(message);
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      await mysqlConn.execute(sql);
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to create view';
      throw new ValidationError(message);
    }
  }
};

/**
 * Drop a view
 */
export const dropViewService = async (
  userId: string,
  databaseId: string,
  viewName: string
): Promise<void> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  const sql = conn.engine === 'postgres'
    ? `DROP VIEW "${viewName}"`
    : `DROP VIEW \`${viewName}\``;

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      await pgPool.query(sql);
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to drop view';
      throw new ValidationError(message);
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      await mysqlConn.execute(sql);
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to drop view';
      throw new ValidationError(message);
    }
  }
};

/**
 * Create a new function
 */
export const createFunctionService = async (
  userId: string,
  databaseId: string,
  functionData: CreateFunctionDto
): Promise<void> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const { name, parameters, returnType, body, language, isEdit } = functionData;

  if (conn.engine === 'postgres') {
    // Build parameters list
    const paramsList = parameters.map(p => `${p.name} ${p.type}`).join(', ');
    const lang = language || 'plpgsql';
    
    const pgPool = createPgPool(conn);
    try {
      // If editing, drop ALL existing functions with this name (handles overloaded functions)
      if (isEdit) {
        // Get all existing function signatures and drop them all
        const sigResult = await pgPool.query(`
          SELECT pg_get_function_identity_arguments(p.oid) as args
          FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE p.proname = $1 AND n.nspname = 'public' AND p.prokind = 'f'
        `, [name]);
        
        // Drop all overloaded versions of this function
        for (const row of sigResult.rows) {
          await pgPool.query(`DROP FUNCTION IF EXISTS "public"."${name}"(${row.args})`);
        }
      }

      const sql = `
        CREATE OR REPLACE FUNCTION "${name}"(${paramsList})
        RETURNS ${returnType}
        LANGUAGE ${lang}
        AS $$
        ${body}
        $$;
      `;
      
      await pgPool.query(sql);
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to create function';
      throw new ValidationError(message);
    }
  } else {
    // MySQL - DROP and CREATE (no CREATE OR REPLACE for functions)
    const paramsList = parameters.map(p => `${p.name} ${p.type}`).join(', ');
    
    const mysqlConn = await createMysqlConnection(conn);
    try {
      // Always drop first for MySQL
      await mysqlConn.execute(`DROP FUNCTION IF EXISTS \`${name}\``);
      
      const sql = `
        CREATE FUNCTION \`${name}\`(${paramsList})
        RETURNS ${returnType}
        DETERMINISTIC
        BEGIN
        ${body}
        END
      `;
      
      await mysqlConn.execute(sql);
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to create function';
      throw new ValidationError(message);
    }
  }
};

/**
 * Drop a function
 */
export const dropFunctionService = async (
  userId: string,
  databaseId: string,
  functionName: string
): Promise<void> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  if (conn.engine === 'postgres') {
    // In PostgreSQL, we need to find the function signature to drop it
    const pgPool = createPgPool(conn);
    try {
      // Get function argument types to construct proper DROP statement
      const sigResult = await pgPool.query(`
        SELECT pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = $1 AND n.nspname = 'public' AND p.prokind = 'f'
        LIMIT 1
      `, [functionName]);

      if (sigResult.rowCount === 0) {
        throw new NotFoundError('Function not found');
      }

      const args = sigResult.rows[0].args || '';
      await pgPool.query(`DROP FUNCTION "${functionName}"(${args})`);
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to drop function';
      throw new ValidationError(message);
    }
  } else {
    const sql = `DROP FUNCTION \`${functionName}\``;
    const mysqlConn = await createMysqlConnection(conn);
    try {
      await mysqlConn.execute(sql);
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to drop function';
      throw new ValidationError(message);
    }
  }
};

/**
 * Create a new procedure
 */
export const createProcedureService = async (
  userId: string,
  databaseId: string,
  procedureData: CreateProcedureDto
): Promise<void> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const { name, parameters, body, language, isEdit } = procedureData;

  if (conn.engine === 'postgres') {
    // Build parameters list with mode
    const paramsList = parameters.map(p => `${p.mode} ${p.name} ${p.type}`).join(', ');
    const lang = language || 'plpgsql';
    
    const pgPool = createPgPool(conn);
    try {
      // If editing, drop ALL existing procedures with this name (handles overloaded procedures)
      if (isEdit) {
        // Get all existing procedure signatures and drop them all
        const sigResult = await pgPool.query(`
          SELECT pg_get_function_identity_arguments(p.oid) as args
          FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE p.proname = $1 AND n.nspname = 'public' AND p.prokind = 'p'
        `, [name]);
        
        // Drop all overloaded versions of this procedure
        for (const row of sigResult.rows) {
          await pgPool.query(`DROP PROCEDURE IF EXISTS "public"."${name}"(${row.args})`);
        }
      }

      const sql = `
        CREATE OR REPLACE PROCEDURE "${name}"(${paramsList})
        LANGUAGE ${lang}
        AS $$
        ${body}
        $$;
      `;
      
      await pgPool.query(sql);
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to create procedure';
      throw new ValidationError(message);
    }
  } else {
    // MySQL - DROP and CREATE (no CREATE OR REPLACE for procedures)
    const paramsList = parameters.map(p => `${p.mode} ${p.name} ${p.type}`).join(', ');
    
    const mysqlConn = await createMysqlConnection(conn);
    try {
      // Always drop first for MySQL (it doesn't support OR REPLACE for procedures)
      await mysqlConn.execute(`DROP PROCEDURE IF EXISTS \`${name}\``);
      
      const sql = `
        CREATE PROCEDURE \`${name}\`(${paramsList})
        BEGIN
        ${body}
        END
      `;
      
      await mysqlConn.execute(sql);
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to create procedure';
      throw new ValidationError(message);
    }
  }
};

/**
 * Drop a procedure
 */
export const dropProcedureService = async (
  userId: string,
  databaseId: string,
  procedureName: string
): Promise<void> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      // Get procedure argument types to construct proper DROP statement
      const sigResult = await pgPool.query(`
        SELECT pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = $1 AND n.nspname = 'public' AND p.prokind = 'p'
        LIMIT 1
      `, [procedureName]);

      if (sigResult.rowCount === 0) {
        throw new NotFoundError('Procedure not found');
      }

      const args = sigResult.rows[0].args || '';
      await pgPool.query(`DROP PROCEDURE "${procedureName}"(${args})`);
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to drop procedure';
      throw new ValidationError(message);
    }
  } else {
    const sql = `DROP PROCEDURE \`${procedureName}\``;
    const mysqlConn = await createMysqlConnection(conn);
    try {
      await mysqlConn.execute(sql);
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to drop procedure';
      throw new ValidationError(message);
    }
  }
};