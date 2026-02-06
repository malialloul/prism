// src/modules/databases/schema/schema.service.ts
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import ExcelJS from 'exceljs';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  HeadingLevel,
  BorderStyle,
} from 'docx';

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

import type { SharePermissions } from '../../auth/auth.types';

/**
 * Validate SQL query against user permissions for shared access users
 * Returns error message if permission is denied, null if allowed
 */
export const validateSqlPermissions = (
  sql: string,
  permissions: SharePermissions | undefined,
  isSharedAccess: boolean
): string | null => {
  // Non-shared users have full access
  if (!isSharedAccess || !permissions) {
    return null;
  }

  const lowerSql = sql.toLowerCase().trim();
  
  // Remove comments and normalize whitespace
  const normalizedSql = lowerSql
    .replace(/--.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\s+/g, ' ')
    .trim();

  // Check for DDL operations that require specific permissions
  
  // CREATE TABLE
  if (/\bcreate\s+table\b/.test(normalizedSql)) {
    if (!permissions.createTable) {
      return 'You do not have permission to create tables. This operation requires the "Create Table" permission.';
    }
  }

  // DROP TABLE
  if (/\bdrop\s+table\b/.test(normalizedSql)) {
    if (!permissions.deleteTable) {
      return 'You do not have permission to delete tables. This operation requires the "Delete Table" permission.';
    }
  }

  // ALTER TABLE - need to check what kind of alteration
  if (/\balter\s+table\b/.test(normalizedSql)) {
    // ADD COLUMN
    if (/\badd\s+(column\s+)?\w+/.test(normalizedSql) && !/\bdrop\b/.test(normalizedSql)) {
      if (!permissions.addColumn) {
        return 'You do not have permission to add columns. This operation requires the "Add Column" permission.';
      }
    }
    // DROP COLUMN
    if (/\bdrop\s+(column\s+)?\w+/.test(normalizedSql)) {
      if (!permissions.deleteColumn) {
        return 'You do not have permission to delete columns. This operation requires the "Delete Column" permission.';
      }
    }
    // MODIFY/ALTER/CHANGE COLUMN (rename, change type, etc.)
    if (/\b(modify|alter\s+column|change|rename)\b/.test(normalizedSql)) {
      if (!permissions.editColumn) {
        return 'You do not have permission to modify columns. This operation requires the "Edit Column" permission.';
      }
    }
  }

  // CREATE INDEX, DROP INDEX (treat as schema modification)
  if (/\bcreate\s+(unique\s+)?index\b/.test(normalizedSql) || /\bdrop\s+index\b/.test(normalizedSql)) {
    if (!permissions.editColumn) {
      return 'You do not have permission to manage indexes. This operation requires the "Edit Column" permission.';
    }
  }

  // TRUNCATE TABLE (data modification)
  if (/\btruncate\s+table\b/.test(normalizedSql)) {
    if (!permissions.editTableData) {
      return 'You do not have permission to truncate tables. This operation requires the "Edit Table Data" permission.';
    }
  }

  // INSERT, UPDATE, DELETE (data modification)
  if (/\b(insert\s+into|update\s+\w+\s+set|delete\s+from)\b/.test(normalizedSql)) {
    if (!permissions.editTableData) {
      return 'You do not have permission to modify table data. This operation requires the "Edit Table Data" permission.';
    }
  }

  // SELECT requires viewTableData permission
  if (/\bselect\b/.test(normalizedSql) && !/\bcreate\b/.test(normalizedSql)) {
    // Exclude CREATE ... AS SELECT statements which need createTable permission (already checked above)
    if (!permissions.viewTableData) {
      return 'You do not have permission to view table data. This operation requires the "View Table Data" permission.';
    }
  }

  return null; // Permission granted
};

/**
 * Execute a SQL query with optional server-side pagination
 */
export const executeQueryService = async (
  userId: string,
  databaseId: string,
  sql: string,
  permissions?: SharePermissions,
  isSharedAccess: boolean = false,
  paginationOptions?: { page?: number; pageSize?: number }
): Promise<QueryResultDto> => {
  // Validate permissions for shared access users
  const permissionError = validateSqlPermissions(sql, permissions, isSharedAccess);
  if (permissionError) {
    throw new ValidationError(permissionError);
  }

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

  // Check if pagination is requested and query is a SELECT
  const isSelectQuery = lowerSql.startsWith('select');
  const usePagination = paginationOptions && isSelectQuery;
  const page = paginationOptions?.page ?? 0;
  const pageSize = paginationOptions?.pageSize ?? 50;
  const offset = page * pageSize;

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      let totalCount: number | undefined;
      let paginatedSql = sql;

      // For SELECT queries with pagination, wrap query and get count
      if (usePagination) {
        // Get total count first
        const countSql = `SELECT COUNT(*) as count FROM (${sql.replace(/;$/, '')}) AS count_query`;
        const countResult = await pgPool.query(countSql);
        totalCount = parseInt(countResult.rows[0]?.count || '0', 10);

        // Add pagination to original query
        paginatedSql = `${sql.replace(/;$/, '')} LIMIT ${pageSize} OFFSET ${offset}`;
      }

      const result = await pgPool.query(paginatedSql);
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
          totalCount: usePagination ? totalCount : undefined,
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
      let totalCount: number | undefined;
      let paginatedSql = sql;

      // For SELECT queries with pagination, wrap query and get count
      if (usePagination) {
        // Get total count first
        const countSql = `SELECT COUNT(*) as count FROM (${sql.replace(/;$/, '')}) AS count_query`;
        const [countRows] = await mysqlConn.execute(countSql);
        totalCount = parseInt((countRows as Array<{ count: string }>)[0]?.count || '0', 10);

        // Add pagination to original query
        paginatedSql = `${sql.replace(/;$/, '')} LIMIT ${pageSize} OFFSET ${offset}`;
      }

      const [rows, fields] = await mysqlConn.execute(paginatedSql);
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
          totalCount: usePagination ? totalCount : undefined,
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
 * Get table data (for Data tab - uses viewTableData permission, not runQuery)
 * This is a restricted query that only allows SELECT on a specific table
 */
export const getTableDataService = async (
  userId: string,
  databaseId: string,
  tableName: string,
  options: {
    page?: number;
    pageSize?: number;
    sortColumn?: string;
    sortDirection?: 'ASC' | 'DESC';
    search?: string;
  } = {}
): Promise<QueryResultDto> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const startTime = Date.now();
  const { page = 0, pageSize = 50, sortColumn, sortDirection = 'ASC', search } = options;
  const offset = page * pageSize;
  const quote = conn.engine === 'postgres' ? '"' : '`';

  // Validate table name to prevent SQL injection (alphanumeric and underscore only)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    throw new ValidationError('Invalid table name');
  }

  // Build the query
  let sql = `SELECT * FROM ${quote}${tableName}${quote}`;
  let countSql = `SELECT COUNT(*) as count FROM ${quote}${tableName}${quote}`;

  // Add search if provided (search across all text columns)
  if (search) {
    const searchTerm = search.replace(/'/g, "''");
    // We'll need to get columns first to build proper search
    // For now, skip search in the service - frontend handles display filtering
  }

  // Add ORDER BY
  if (sortColumn && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sortColumn)) {
    sql += ` ORDER BY ${quote}${sortColumn}${quote} ${sortDirection === 'DESC' ? 'DESC' : 'ASC'}`;
  }

  // Add pagination
  sql += ` LIMIT ${pageSize} OFFSET ${offset}`;

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      // Get total count
      const countResult = await pgPool.query(countSql);
      const totalCount = parseInt(countResult.rows[0]?.count || '0', 10);

      // Get data
      const result = await pgPool.query(sql);
      const executionTimeMs = Date.now() - startTime;
      await pgPool.end();

      return {
        success: true,
        columns: result.fields.map(f => f.name),
        rows: result.rows,
        rowCount: result.rowCount || 0,
        totalCount,
        executionTimeMs,
      };
    } catch (error) {
      await pgPool.end();
      const message = error instanceof Error ? error.message : 'Failed to fetch table data';
      return {
        success: false,
        message,
        executionTimeMs: Date.now() - startTime,
      };
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      // Get total count
      const [countRows] = await mysqlConn.execute(countSql);
      const totalCount = (countRows as Array<{ count: number }>)[0]?.count || 0;

      // Get data
      const [rows, fields] = await mysqlConn.execute(sql);
      const executionTimeMs = Date.now() - startTime;
      await mysqlConn.end();

      return {
        success: true,
        columns: (fields as Array<{ name: string }>).map(f => f.name),
        rows: rows as Record<string, unknown>[],
        rowCount: (rows as Array<unknown>).length,
        totalCount,
        executionTimeMs,
      };
    } catch (error) {
      await mysqlConn.end();
      const message = error instanceof Error ? error.message : 'Failed to fetch table data';
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
    endpoint: `/databases/${row.database_id}/custom-api/${row.slug || row.id}`,
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
  isPublic: boolean = false,
  permissions?: SharePermissions,
  isSharedAccess: boolean = false
): Promise<SavedQueryDto> => {
  // Validate permissions for shared access users
  // Users should only be able to create APIs for operations they have permission to execute
  const permissionError = validateSqlPermissions(sql, permissions, isSharedAccess);
  if (permissionError) {
    throw new ValidationError(`Cannot create API: ${permissionError}`);
  }

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
    endpoint: `/databases/${row.database_id}/custom-api/${row.slug}`,
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
  params: Record<string, any>,
  permissions?: SharePermissions,
  isSharedAccess: boolean = false
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
  
  // Validate permissions for shared access users
  // The saved query SQL should be checked against permissions
  const permissionError = validateSqlPermissions(sql, permissions, isSharedAccess);
  if (permissionError) {
    throw new ValidationError(permissionError);
  }

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

// ============================================
// Export Schema Service
// ============================================
export const exportSchemaService = async (
  userId: string,
  databaseId: string,
  options: { includeData?: boolean; tables?: string[] } = {}
): Promise<{ sql: string; filename: string }> => {
  const conn = await getDatabaseConnection(userId, databaseId);
  const { includeData = false, tables } = options;
  let sql = '';
  
  // Get database name for filename
  const dbResult = await pool.query(
    `SELECT name FROM database_connections WHERE id = $1 AND user_id = $2`,
    [databaseId, userId]
  );
  const dbName = dbResult.rows[0]?.name || 'database';

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      // Add header comment
      sql += `-- PostgreSQL Database Export\n`;
      sql += `-- Database: ${dbName}\n`;
      sql += `-- Generated: ${new Date().toISOString()}\n`;
      sql += `-- Prism Database Management\n\n`;

      // Get all tables or filter by specified tables
      let tableQuery = `
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
      `;
      if (tables && tables.length > 0) {
        tableQuery += ` AND tablename = ANY($1)`;
      }
      tableQuery += ` ORDER BY tablename`;
      
      const tablesResult = tables && tables.length > 0 
        ? await pgPool.query(tableQuery, [tables])
        : await pgPool.query(tableQuery);

      // Collect all sequences needed for the tables
      const sequencesToCreate = new Set<string>();
      
      // First pass: identify sequences used by tables
      for (const row of tablesResult.rows) {
        const tableName = row.tablename;
        const seqResult = await pgPool.query(`
          SELECT column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' 
            AND table_name = $1 
            AND column_default LIKE 'nextval(%'
        `, [tableName]);
        
        for (const seqRow of seqResult.rows) {
          // Extract sequence name from nextval('sequence_name'::regclass)
          const match = seqRow.column_default.match(/nextval\('([^']+)'::regclass\)/);
          if (match) {
            sequencesToCreate.add(match[1]);
          }
        }
      }

      // Create sequences first
      if (sequencesToCreate.size > 0) {
        sql += `-- Sequences\n`;
        for (const seqName of sequencesToCreate) {
          try {
            // Get sequence details
            const seqDetails = await pgPool.query(`
              SELECT start_value, increment_by, max_value, min_value, cache_size, cycle
              FROM pg_sequences
              WHERE schemaname = 'public' AND sequencename = $1
            `, [seqName]);
            
            sql += `DROP SEQUENCE IF EXISTS "${seqName}" CASCADE;\n`;
            if (seqDetails.rowCount && seqDetails.rowCount > 0) {
              const seq = seqDetails.rows[0];
              sql += `CREATE SEQUENCE "${seqName}" INCREMENT ${seq.increment_by} START ${seq.start_value} MINVALUE ${seq.min_value} MAXVALUE ${seq.max_value} CACHE ${seq.cache_size}${seq.cycle ? ' CYCLE' : ''};\n`;
            } else {
              // Fallback if sequence details not found
              sql += `CREATE SEQUENCE "${seqName}";\n`;
            }
          } catch {
            // If we can't get details, create with defaults
            sql += `DROP SEQUENCE IF EXISTS "${seqName}" CASCADE;\n`;
            sql += `CREATE SEQUENCE "${seqName}";\n`;
          }
        }
        sql += `\n`;
      }

      for (const row of tablesResult.rows) {
        const tableName = row.tablename;
        
        // Get CREATE TABLE statement
        const columnsResult = await pgPool.query(`
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            is_nullable,
            column_default,
            udt_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);

        sql += `-- Table: ${tableName}\n`;
        sql += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
        sql += `CREATE TABLE "${tableName}" (\n`;

        const columnDefs: string[] = [];
        for (const col of columnsResult.rows) {
          let colDef = `  "${col.column_name}" `;
          
          // Build data type
          if (col.udt_name === 'int4') {
            colDef += 'INTEGER';
          } else if (col.udt_name === 'int8') {
            colDef += 'BIGINT';
          } else if (col.udt_name === 'int2') {
            colDef += 'SMALLINT';
          } else if (col.udt_name === 'float4') {
            colDef += 'REAL';
          } else if (col.udt_name === 'float8') {
            colDef += 'DOUBLE PRECISION';
          } else if (col.udt_name === 'bool') {
            colDef += 'BOOLEAN';
          } else if (col.udt_name === 'varchar') {
            colDef += col.character_maximum_length 
              ? `VARCHAR(${col.character_maximum_length})`
              : 'VARCHAR';
          } else if (col.udt_name === 'text') {
            colDef += 'TEXT';
          } else if (col.udt_name === 'timestamp') {
            colDef += 'TIMESTAMP';
          } else if (col.udt_name === 'timestamptz') {
            colDef += 'TIMESTAMP WITH TIME ZONE';
          } else if (col.udt_name === 'date') {
            colDef += 'DATE';
          } else if (col.udt_name === 'numeric') {
            colDef += col.numeric_precision 
              ? `NUMERIC(${col.numeric_precision}, ${col.numeric_scale || 0})`
              : 'NUMERIC';
          } else if (col.udt_name === 'uuid') {
            colDef += 'UUID';
          } else if (col.udt_name === 'json') {
            colDef += 'JSON';
          } else if (col.udt_name === 'jsonb') {
            colDef += 'JSONB';
          } else if (col.data_type === 'ARRAY') {
            colDef += col.udt_name.replace('_', '') + '[]';
          } else {
            colDef += col.data_type.toUpperCase();
          }

          if (col.is_nullable === 'NO') {
            colDef += ' NOT NULL';
          }

          if (col.column_default) {
            colDef += ` DEFAULT ${col.column_default}`;
          }

          columnDefs.push(colDef);
        }

        // Get primary key
        const pkResult = await pgPool.query(`
          SELECT a.attname
          FROM pg_index i
          JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
          WHERE i.indrelid = $1::regclass AND i.indisprimary
        `, [tableName]);

        if (pkResult.rowCount && pkResult.rowCount > 0) {
          const pkColumns = pkResult.rows.map(r => `"${r.attname}"`).join(', ');
          columnDefs.push(`  PRIMARY KEY (${pkColumns})`);
        }

        sql += columnDefs.join(',\n');
        sql += '\n);\n\n';

        // Get indexes (excluding primary key)
        const indexResult = await pgPool.query(`
          SELECT indexname, indexdef
          FROM pg_indexes
          WHERE schemaname = 'public' AND tablename = $1
          AND indexname NOT LIKE '%_pkey'
        `, [tableName]);

        for (const idx of indexResult.rows) {
          sql += `${idx.indexdef};\n`;
        }
        if (indexResult.rowCount && indexResult.rowCount > 0) {
          sql += '\n';
        }

        // Include data if requested
        if (includeData) {
          const dataResult = await pgPool.query(`SELECT * FROM "${tableName}"`);
          if (dataResult.rowCount && dataResult.rowCount > 0) {
            const columns = Object.keys(dataResult.rows[0]);
            sql += `-- Data for ${tableName}\n`;
            
            for (const row of dataResult.rows) {
              const values = columns.map(col => {
                const val = row[col];
                if (val === null) return 'NULL';
                if (typeof val === 'number') return val;
                if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                if (val instanceof Date) return `'${val.toISOString()}'`;
                if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                return `'${String(val).replace(/'/g, "''")}'`;
              });
              sql += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
            }
            sql += '\n';
            
            // Reset sequences to max value after data import
            const seqColsResult = await pgPool.query(`
              SELECT column_name, column_default
              FROM information_schema.columns
              WHERE table_schema = 'public' 
                AND table_name = $1 
                AND column_default LIKE 'nextval(%'
            `, [tableName]);
            
            for (const seqCol of seqColsResult.rows) {
              const match = seqCol.column_default.match(/nextval\('([^']+)'::regclass\)/);
              if (match) {
                const seqName = match[1];
                sql += `SELECT setval('${seqName}', COALESCE((SELECT MAX("${seqCol.column_name}") FROM "${tableName}"), 1), true);\n`;
              }
            }
            sql += '\n';
          }
        }
      }

      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      throw error;
    }
  } else {
    // MySQL export
    const mysqlConn = await createMysqlConnection(conn);
    try {
      sql += `-- MySQL Database Export\n`;
      sql += `-- Database: ${dbName}\n`;
      sql += `-- Generated: ${new Date().toISOString()}\n`;
      sql += `-- Prism Database Management\n\n`;
      sql += `SET FOREIGN_KEY_CHECKS=0;\n\n`;

      // Get all tables
      let tableQuery = `SHOW TABLES`;
      const [tablesResult] = await mysqlConn.query(tableQuery);
      let tableList = (tablesResult as any[]).map(r => Object.values(r)[0] as string);
      
      if (tables && tables.length > 0) {
        tableList = tableList.filter(t => tables.includes(t));
      }

      for (const tableName of tableList) {
        // Get CREATE TABLE statement
        const [createResult] = await mysqlConn.query(`SHOW CREATE TABLE \`${tableName}\``);
        const createStatement = (createResult as any[])[0]['Create Table'];
        
        sql += `-- Table: ${tableName}\n`;
        sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
        sql += `${createStatement};\n\n`;

        // Include data if requested
        if (includeData) {
          const [dataResult] = await mysqlConn.query(`SELECT * FROM \`${tableName}\``);
          const rows = dataResult as any[];
          if (rows.length > 0) {
            const columns = Object.keys(rows[0]);
            sql += `-- Data for ${tableName}\n`;
            
            for (const row of rows) {
              const values = columns.map(col => {
                const val = row[col];
                if (val === null) return 'NULL';
                if (typeof val === 'number') return val;
                if (typeof val === 'boolean') return val ? '1' : '0';
                if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
              });
              sql += `INSERT INTO \`${tableName}\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES (${values.join(', ')});\n`;
            }
            sql += '\n';
          }
        }
      }

      sql += `SET FOREIGN_KEY_CHECKS=1;\n`;
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      throw error;
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${dbName}_${includeData ? 'full' : 'schema'}_${timestamp}.sql`;

  return { sql, filename };
};

// ============================================
// Import SQL Service
// ============================================

// Helper to detect SQL dialect
function detectSqlDialect(sql: string): 'mysql' | 'postgres' | 'unknown' {
  const mysqlIndicators = [
    /`\w+`/,                          // Backtick quoted identifiers
    /AUTO_INCREMENT/i,                 // MySQL auto increment
    /ENGINE\s*=\s*InnoDB/i,           // MySQL engine
    /UNSIGNED/i,                       // MySQL unsigned
    /SET FOREIGN_KEY_CHECKS/i,        // MySQL specific
    /COLLATE\s+utf8/i,                // MySQL collation
  ];
  
  const postgresIndicators = [
    /"\w+"/,                           // Double-quoted identifiers (but also standard SQL)
    /SERIAL\s+(PRIMARY\s+KEY)?/i,     // PostgreSQL serial
    /RETURNING\s+/i,                   // PostgreSQL returning clause
    /::[\w\[\]]+/,                     // PostgreSQL type casting
    /WITH\s+TIME\s+ZONE/i,            // PostgreSQL timestamp with time zone
    /JSONB/i,                          // PostgreSQL JSONB type
  ];
  
  let mysqlScore = 0;
  let postgresScore = 0;
  
  for (const pattern of mysqlIndicators) {
    if (pattern.test(sql)) mysqlScore++;
  }
  
  for (const pattern of postgresIndicators) {
    if (pattern.test(sql)) postgresScore++;
  }
  
  // Backticks are a strong MySQL indicator
  if (/`\w+`/.test(sql)) mysqlScore += 3;
  
  if (mysqlScore > postgresScore && mysqlScore >= 2) return 'mysql';
  if (postgresScore > mysqlScore && postgresScore >= 2) return 'postgres';
  
  return 'unknown';
}

export const importSqlService = async (
  userId: string,
  databaseId: string,
  sql: string,
  permissions?: SharePermissions,
  isSharedAccess: boolean = false
): Promise<{ success: boolean; message: string; executedStatements: number; errors: string[] }> => {
  // Validate permissions for shared access users
  // Import SQL can contain DDL/DML, so we need to check each statement
  const permissionError = validateSqlPermissions(sql, permissions, isSharedAccess);
  if (permissionError) {
    return {
      success: false,
      message: `Permission denied: ${permissionError}`,
      executedStatements: 0,
      errors: [permissionError],
    };
  }

  const conn = await getDatabaseConnection(userId, databaseId);
  const errors: string[] = [];
  let executedStatements = 0;

  // Detect SQL dialect and check compatibility
  const detectedDialect = detectSqlDialect(sql);
  
  if (detectedDialect === 'mysql' && conn.engine === 'postgres') {
    return {
      success: false,
      message: 'Cannot import MySQL SQL into a PostgreSQL database. The SQL file contains MySQL-specific syntax (backticks, AUTO_INCREMENT, etc.).',
      executedStatements: 0,
      errors: ['Incompatible SQL dialect: MySQL SQL cannot be imported into PostgreSQL. Please export from a PostgreSQL database or convert the SQL syntax.'],
    };
  }
  
  if (detectedDialect === 'postgres' && conn.engine === 'mysql') {
    return {
      success: false,
      message: 'Cannot import PostgreSQL SQL into a MySQL database. The SQL file contains PostgreSQL-specific syntax (SERIAL, ::casting, etc.).',
      executedStatements: 0,
      errors: ['Incompatible SQL dialect: PostgreSQL SQL cannot be imported into MySQL. Please export from a MySQL database or convert the SQL syntax.'],
    };
  }

  // For PostgreSQL, pre-process to find and create missing sequences
  let processedSql = sql;
  if (conn.engine === 'postgres') {
    // Find all sequences referenced via nextval('sequence_name'::regclass)
    const seqMatches = sql.matchAll(/nextval\('([^']+)'::regclass\)/g);
    const sequencesToCreate = new Set<string>();
    for (const match of seqMatches) {
      sequencesToCreate.add(match[1]);
    }
    
    // Generate CREATE SEQUENCE statements for any sequences referenced
    if (sequencesToCreate.size > 0) {
      const seqStatements: string[] = [];
      for (const seqName of sequencesToCreate) {
        seqStatements.push(`DROP SEQUENCE IF EXISTS "${seqName}" CASCADE`);
        seqStatements.push(`CREATE SEQUENCE IF NOT EXISTS "${seqName}"`);
      }
      // Prepend sequence creation to the SQL
      processedSql = seqStatements.join(';\n') + ';\n\n' + sql;
    }
  }

  // Split SQL into statements (basic splitting, handles most cases)
  const statements = processedSql
    .replace(/--.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .split(/;(?=(?:[^']*'[^']*')*[^']*$)/g) // Split by semicolons not inside quotes
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);
    try {
      for (const statement of statements) {
        try {
          await pgPool.query(statement);
          executedStatements++;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          // Skip sequence errors since we auto-create them
          if (message.includes('already exists') && statement.includes('CREATE SEQUENCE')) {
            executedStatements++;
            continue;
          }
          errors.push(`Statement failed: ${statement.substring(0, 100)}... Error: ${message}`);
        }
      }
      await pgPool.end();
    } catch (error) {
      await pgPool.end();
      throw error;
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);
    try {
      for (const statement of statements) {
        try {
          await mysqlConn.execute(statement);
          executedStatements++;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Statement failed: ${statement.substring(0, 100)}... Error: ${message}`);
        }
      }
      await mysqlConn.end();
    } catch (error) {
      await mysqlConn.end();
      throw error;
    }
  }

  return {
    success: errors.length === 0,
    message: errors.length === 0 
      ? `Successfully executed ${executedStatements} statements`
      : `Executed ${executedStatements} statements with ${errors.length} errors`,
    executedStatements,
    errors,
  };
};

// ============================================
// Schema Document Creator
// ============================================

class SchemaDocumentCreator {
  private tables: Array<{
    name: string;
    columns: ColumnDto[];
    rowCount: number;
  }>;

  private dbName: string;
  private dbEngine: string;

  constructor(
    tables: Array<{
      name: string;
      columns: ColumnDto[];
      rowCount: number;
    }>,
    dbName: string,
    dbEngine: string
  ) {
    this.tables = tables;
    this.dbName = dbName;
    this.dbEngine = dbEngine === 'postgres' ? 'PostgreSQL' : 'MySQL';
  }

  public create(): Document {
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(new Paragraph({
      text: "Database Schema Documentation",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }));

    // Spacing
    children.push(new Paragraph(""));

    // Metadata Table
    children.push(this.createMetadataTable());

    // Spacing
    children.push(new Paragraph(""));
    children.push(new Paragraph(""));

    // Tables
    for (const table of this.tables) {
      // Table Name Header
      children.push(new Paragraph({
        text: table.name,
        heading: HeadingLevel.HEADING_1,
      }));

      // Row count info
      children.push(new Paragraph({
        children: [
          new TextRun({
            text: `Row Count: ${table.rowCount}`,
            italics: true,
            size: 20,
          }),
        ],
      }));

      children.push(new Paragraph(""));

      // Columns Table with borders
      children.push(this.createColumnsTable(table.columns));

      // Spacing between tables
      children.push(new Paragraph(""));
      children.push(new Paragraph(""));
    }

    // Footer
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Generated by Prism Database Management",
          italics: true,
          size: 18,
          color: "666666",
        }),
      ],
    }));

    const document = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    return document;
  }

  private createMetadataTable(): Table {
    const borderStyle = {
      style: BorderStyle.SINGLE,
      size: 1,
      color: "CCCCCC",
    };

    return new Table({
      width: { size: 50, type: WidthType.PERCENTAGE },
      borders: {
        top: borderStyle,
        bottom: borderStyle,
        left: borderStyle,
        right: borderStyle,
        insideHorizontal: borderStyle,
        insideVertical: borderStyle,
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "F0F0F0" },
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph({
                children: [new TextRun({ text: "Database", bold: true })],
              })],
            }),
            new TableCell({
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph(this.dbName)],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "F0F0F0" },
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph({
                children: [new TextRun({ text: "Engine", bold: true })],
              })],
            }),
            new TableCell({
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph(this.dbEngine)],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "F0F0F0" },
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph({
                children: [new TextRun({ text: "Generated", bold: true })],
              })],
            }),
            new TableCell({
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph(new Date().toLocaleString())],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "F0F0F0" },
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph({
                children: [new TextRun({ text: "Total Tables", bold: true })],
              })],
            }),
            new TableCell({
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph(String(this.tables.length))],
            }),
          ],
        }),
      ],
    });
  }

  private createColumnsTable(columns: ColumnDto[]): Table {
    const borderStyle = {
      style: BorderStyle.SINGLE,
      size: 1,
      color: "999999",
    };

    const rows: TableRow[] = [];

    // Header row with background
    rows.push(
      new TableRow({
        children: [
          this.createHeaderCell("Column Name"),
          this.createHeaderCell("Data Type"),
          this.createHeaderCell("Nullable"),
          this.createHeaderCell("Default Value"),
          this.createHeaderCell("Key"),
        ],
      })
    );

    // Data rows with alternating colors
    columns.forEach((col, index) => {
      const isAlternate = index % 2 === 1;
      const nullable = col.nullable ? "Yes" : "No";
      const defaultVal = col.defaultValue ? String(col.defaultValue) : "-";

      rows.push(
        new TableRow({
          children: [
            this.createDataCell(col.name, isAlternate, true),
            this.createDataCell(col.type, isAlternate),
            this.createDataCell(nullable, isAlternate),
            this.createDataCell(defaultVal, isAlternate),
            this.createKeyCell(col.isPrimaryKey, col.isForeignKey, isAlternate),
          ],
        })
      );
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: borderStyle,
        bottom: borderStyle,
        left: borderStyle,
        right: borderStyle,
        insideHorizontal: borderStyle,
        insideVertical: borderStyle,
      },
      rows,
    });
  }

  private createHeaderCell(text: string): TableCell {
    return new TableCell({
      shading: { fill: "4472C4" },
      margins: {
        top: 80,
        bottom: 80,
        left: 120,
        right: 120,
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text,
              bold: true,
              color: "FFFFFF",
              size: 22,
            }),
          ],
        }),
      ],
    });
  }

  private createDataCell(text: string, isAlternate: boolean, isBold: boolean = false): TableCell {
    return new TableCell({
      shading: isAlternate ? { fill: "F2F2F2" } : undefined,
      margins: {
        top: 60,
        bottom: 60,
        left: 120,
        right: 120,
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: isBold,
              size: 20,
            }),
          ],
        }),
      ],
    });
  }

  private createKeyCell(isPK: boolean, isFK: boolean, isAlternate: boolean): TableCell {
    const parts: TextRun[] = [];
    
    if (isPK) {
      parts.push(new TextRun({
        text: "PK",
        bold: true,
        color: "C65911",
        size: 20,
      }));
    }
    
    if (isPK && isFK) {
      parts.push(new TextRun({
        text: " / ",
        size: 20,
      }));
    }
    
    if (isFK) {
      parts.push(new TextRun({
        text: "FK",
        bold: true,
        color: "2E75B6",
        size: 20,
      }));
    }
    
    if (!isPK && !isFK) {
      parts.push(new TextRun({
        text: "-",
        size: 20,
        color: "999999",
      }));
    }

    return new TableCell({
      shading: isAlternate ? { fill: "F2F2F2" } : undefined,
      margins: {
        top: 60,
        bottom: 60,
        left: 120,
        right: 120,
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: parts,
        }),
      ],
    });
  }
}

/**
 * Generate a Word document with schema documentation
 */

export const generateSchemaDocService = async (
  userId: string,
  databaseId: string
): Promise<{ buffer: Buffer; filename: string }> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  const dbResult = await pool.query(
    `SELECT name FROM database_connections WHERE id = $1 AND user_id = $2`,
    [databaseId, userId]
  );
  const dbName = dbResult.rows[0]?.name || 'Database';

  const tables: Array<{
    name: string;
    columns: ColumnDto[];
    rowCount: number;
  }> = [];

  // Collect metadata
  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);

    try {
      const tablesResult = await pgPool.query(`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);

      for (const { tablename } of tablesResult.rows) {
        const columnsResult = await pgPool.query(
          `
          SELECT column_name, data_type, is_nullable, column_default, udt_name
          FROM information_schema.columns
          WHERE table_schema='public' AND table_name=$1
          ORDER BY ordinal_position
        `,
          [tablename]
        );

        // Get primary key columns
        const pkResult = await pgPool.query(
          `
          SELECT kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = $1
        `,
          [tablename]
        );
        const pkColumns = new Set(pkResult.rows.map(r => r.column_name));

        // Get foreign key columns
        const fkResult = await pgPool.query(
          `
          SELECT kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = $1
        `,
          [tablename]
        );
        const fkColumns = new Set(fkResult.rows.map(r => r.column_name));

        const countResult = await pgPool.query(
          `SELECT COUNT(*) FROM "${tablename}"`
        );

        const columns: ColumnDto[] = columnsResult.rows.map(col => ({
          name: col.column_name,
          type: col.udt_name.toUpperCase(),
          nullable: col.is_nullable === 'YES',
          defaultValue: col.column_default,
          isPrimaryKey: pkColumns.has(col.column_name),
          isForeignKey: fkColumns.has(col.column_name),
        }));

        tables.push({
          name: tablename,
          columns,
          rowCount: Number(countResult.rows[0].count),
        });
      }
    } finally {
      await pgPool.end();
    }
  } else {
    const mysql = await createMysqlConnection(conn);

    try {
      const [rows] = await mysql.query(`SHOW TABLES`);
      const tableNames: string[] = (rows as any[]).map(
        r => String(Object.values(r)[0])
      );

      for (const tableName of tableNames) {
        const [cols] = await mysql.query(
          `
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?
        `,
          [tableName]
        );

        // Get foreign key columns
        const [fkRows] = await mysql.query(
          `
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
          WHERE TABLE_SCHEMA=DATABASE() 
            AND TABLE_NAME=?
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `,
          [tableName]
        );
        const fkColumns = new Set((fkRows as any[]).map(r => r.COLUMN_NAME));

        const columns: ColumnDto[] = (cols as any[]).map(c => ({
          name: c.COLUMN_NAME,
          type: c.DATA_TYPE.toUpperCase(),
          nullable: c.IS_NULLABLE === 'YES',
          defaultValue: c.COLUMN_DEFAULT,
          isPrimaryKey: c.COLUMN_KEY === 'PRI',
          isForeignKey: fkColumns.has(c.COLUMN_NAME),
        }));

        const [count] = await mysql.query(
          `SELECT COUNT(*) as count FROM \`${tableName}\``
        );

        tables.push({
          name: tableName,
          columns,
          rowCount: (count as any)[0].count,
        });
      }
    } finally {
      await mysql.end();
    }
  }

  // Create document using SchemaDocumentCreator
  const creator = new SchemaDocumentCreator(tables, dbName, conn.engine);
  const doc = creator.create();

  const buffer = await Packer.toBuffer(doc);
  const filename = `${dbName.replace(/[^a-zA-Z0-9]/g, '_')}_schema.docx`;

  return { buffer, filename };
};

/**
 * Generate an Excel workbook with table data - each table's data in a separate sheet
 */
export const generateSchemaExcelService = async (
  userId: string,
  databaseId: string
): Promise<{ buffer: Buffer; filename: string }> => {
  const conn = await getDatabaseConnection(userId, databaseId);

  const dbResult = await pool.query(
    `SELECT name FROM database_connections WHERE id = $1 AND user_id = $2`,
    [databaseId, userId]
  );
  const dbName = dbResult.rows[0]?.name || 'Database';

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Prism Database Management';
  workbook.created = new Date();

  // Style definitions
  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  const headerFont: Partial<ExcelJS.Font> = {
    bold: true,
    color: { argb: 'FFFFFFFF' },
    size: 11,
  };
  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF999999' } },
    left: { style: 'thin', color: { argb: 'FF999999' } },
    bottom: { style: 'thin', color: { argb: 'FF999999' } },
    right: { style: 'thin', color: { argb: 'FF999999' } },
  };

  // Helper to sanitize sheet names (max 31 chars, no special chars)
  const sanitizeSheetName = (name: string): string => {
    return name
      .replace(/[\[\]\*\?\/\\:]/g, '_')
      .substring(0, 31);
  };

  // Track table info for summary
  const tableInfo: Array<{ name: string; sheetName: string; rowCount: number; columnCount: number }> = [];

  if (conn.engine === 'postgres') {
    const pgPool = createPgPool(conn);

    try {
      const tablesResult = await pgPool.query(`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);

      for (const { tablename } of tablesResult.rows) {
        // Get all data from the table
        const dataResult = await pgPool.query(`SELECT * FROM "${tablename}" LIMIT 50000`);
        
        if (dataResult.rows.length === 0 && dataResult.fields.length === 0) {
          continue; // Skip empty tables with no columns
        }

        const sheetName = sanitizeSheetName(tablename);
        const sheet = workbook.addWorksheet(sheetName);

        // Get column names from the result fields
        const columnNames = dataResult.fields.map(f => f.name);

        // Header row
        const headerRow = sheet.getRow(1);
        headerRow.values = columnNames;
        headerRow.eachCell((cell: ExcelJS.Cell) => {
          cell.fill = headerFill;
          cell.font = headerFont;
          cell.border = borderStyle;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        headerRow.height = 22;

        // Data rows
        dataResult.rows.forEach((row, rowIndex) => {
          const excelRow = sheet.getRow(rowIndex + 2);
          const values = columnNames.map(col => {
            const value = row[col];
            // Handle special types
            if (value === null || value === undefined) {
              return '';
            }
            if (value instanceof Date) {
              return value.toISOString();
            }
            if (typeof value === 'object') {
              return JSON.stringify(value);
            }
            return value;
          });
          excelRow.values = values;

          // Apply styles
          excelRow.eachCell((cell: ExcelJS.Cell) => {
            cell.border = borderStyle;
            cell.alignment = { vertical: 'middle' };
            
            // Alternate row colors
            if (rowIndex % 2 === 1) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF2F2F2' },
              };
            }
          });
        });

        // Auto-fit column widths (estimate based on content)
        columnNames.forEach((colName, index) => {
          let maxLength = colName.length;
          dataResult.rows.slice(0, 100).forEach(row => {
            const value = row[colName];
            const len = value ? String(value).length : 0;
            if (len > maxLength) maxLength = len;
          });
          sheet.getColumn(index + 1).width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

        // Enable auto-filter for sorting on each column
        if (columnNames.length > 0) {
          const lastColumn = String.fromCharCode(64 + Math.min(columnNames.length, 26));
          const lastRow = dataResult.rows.length + 1;
          sheet.autoFilter = {
            from: 'A1',
            to: `${lastColumn}${lastRow}`,
          };
        }

        tableInfo.push({
          name: tablename,
          sheetName,
          rowCount: dataResult.rows.length,
          columnCount: columnNames.length,
        });
      }
    } finally {
      await pgPool.end();
    }
  } else {
    const mysqlConn = await createMysqlConnection(conn);

    try {
      const [rows] = await mysqlConn.query(`SHOW TABLES`);
      const mysqlTableNames: string[] = (rows as any[]).map(
        r => String(Object.values(r)[0])
      );

      for (const tableName of mysqlTableNames) {
        // Get all data from the table
        const [dataRows, fields] = await mysqlConn.query(`SELECT * FROM \`${tableName}\` LIMIT 50000`);
        
        const data = dataRows as any[];
        const fieldDefs = fields as any[];

        if (data.length === 0 && fieldDefs.length === 0) {
          continue; // Skip empty tables with no columns
        }

        const sheetName = sanitizeSheetName(tableName);
        const sheet = workbook.addWorksheet(sheetName);

        // Get column names
        const columnNames = fieldDefs.map((f: any) => f.name);

        // Header row
        const headerRow = sheet.getRow(1);
        headerRow.values = columnNames;
        headerRow.eachCell((cell: ExcelJS.Cell) => {
          cell.fill = headerFill;
          cell.font = headerFont;
          cell.border = borderStyle;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        headerRow.height = 22;

        // Data rows
        data.forEach((row, rowIndex) => {
          const excelRow = sheet.getRow(rowIndex + 2);
          const values = columnNames.map(col => {
            const value = row[col];
            // Handle special types
            if (value === null || value === undefined) {
              return '';
            }
            if (value instanceof Date) {
              return value.toISOString();
            }
            if (typeof value === 'object') {
              return JSON.stringify(value);
            }
            return value;
          });
          excelRow.values = values;

          // Apply styles
          excelRow.eachCell((cell: ExcelJS.Cell) => {
            cell.border = borderStyle;
            cell.alignment = { vertical: 'middle' };
            
            // Alternate row colors
            if (rowIndex % 2 === 1) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF2F2F2' },
              };
            }
          });
        });

        // Auto-fit column widths (estimate based on content)
        columnNames.forEach((colName, index) => {
          let maxLength = colName.length;
          data.slice(0, 100).forEach(row => {
            const value = row[colName];
            const len = value ? String(value).length : 0;
            if (len > maxLength) maxLength = len;
          });
          sheet.getColumn(index + 1).width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

        // Enable auto-filter for sorting on each column
        if (columnNames.length > 0) {
          const lastColumn = String.fromCharCode(64 + Math.min(columnNames.length, 26));
          const lastRow = data.length + 1;
          sheet.autoFilter = {
            from: 'A1',
            to: `${lastColumn}${lastRow}`,
          };
        }

        tableInfo.push({
          name: tableName,
          sheetName,
          rowCount: data.length,
          columnCount: columnNames.length,
        });
      }
    } finally {
      await mysqlConn.end();
    }
  }

  // Add Summary sheet at the beginning
  const summarySheet = workbook.addWorksheet('Summary', {
    properties: { tabColor: { argb: 'FF4472C4' } },
  });
  
  // Move summary to first position by removing and re-adding other sheets
  // Actually exceljs doesn't support moving, so we need to recreate
  // For now, Summary will be at the end - that's fine

  // Summary title
  summarySheet.mergeCells('A1:D1');
  const summaryTitle = summarySheet.getCell('A1');
  summaryTitle.value = 'Database Data Export Summary';
  summaryTitle.font = { bold: true, size: 16 };
  summarySheet.getCell('A1').alignment = { horizontal: 'center' };

  // Metadata
  summarySheet.getCell('A3').value = 'Database:';
  summarySheet.getCell('A3').font = { bold: true };
  summarySheet.getCell('B3').value = dbName;

  summarySheet.getCell('A4').value = 'Engine:';
  summarySheet.getCell('A4').font = { bold: true };
  summarySheet.getCell('B4').value = conn.engine === 'postgres' ? 'PostgreSQL' : 'MySQL';

  summarySheet.getCell('A5').value = 'Exported:';
  summarySheet.getCell('A5').font = { bold: true };
  summarySheet.getCell('B5').value = new Date().toLocaleString();

  summarySheet.getCell('A6').value = 'Total Tables:';
  summarySheet.getCell('A6').font = { bold: true };
  summarySheet.getCell('B6').value = tableInfo.length;

  // Table list header
  summarySheet.getRow(8).values = ['#', 'Table Name', 'Rows', 'Columns', 'Go to Sheet'];
  summarySheet.getRow(8).eachCell((cell: ExcelJS.Cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.border = borderStyle;
    cell.alignment = { horizontal: 'center' };
  });

  // List all tables with hyperlinks
  tableInfo.forEach((info, index) => {
    const row = summarySheet.getRow(9 + index);
    row.getCell(1).value = index + 1;
    row.getCell(2).value = info.name;
    row.getCell(3).value = info.rowCount;
    row.getCell(4).value = info.columnCount;
    row.getCell(5).value = { text: 'View →', hyperlink: `#'${info.sheetName}'!A1` };
    row.getCell(5).font = { color: { argb: 'FF0066CC' }, underline: true };
    
    row.eachCell((cell: ExcelJS.Cell) => {
      cell.border = borderStyle;
    });
  });

  // Set column widths for summary
  summarySheet.columns = [
    { width: 6 },  // #
    { width: 30 }, // Table Name
    { width: 10 }, // Rows
    { width: 10 }, // Columns
    { width: 12 }, // Link
  ];

  // Generate buffer
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const filename = `${dbName.replace(/[^a-zA-Z0-9]/g, '_')}_data_export.xlsx`;

  return { buffer, filename };
};