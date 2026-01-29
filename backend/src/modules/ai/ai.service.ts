// src/modules/ai/ai.service.ts
import crypto from 'crypto';
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import { pool } from '../../config/db';
import { config } from '../../config/env';
import { generateAIResponse } from '../../config/ai-provider';
import { NotFoundError, ValidationError } from '../../utils/errors';
import type {
  GenerateSqlRequestDto,
  GeneratedSqlDto,
  SaveGeneratedApiDto,
  GeneratedApiDto,
  DbGeneratedApiDto,
  ExecuteGeneratedApiDto,
} from './ai.types';

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

// Get database connection details
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

// Get database schema for AI context
async function getDatabaseSchema(userId: string, databaseId: string): Promise<string> {
  const conn = await getDatabaseConnection(userId, databaseId);
  
  if (conn.engine === 'postgres') {
    const pgPool = new Pool({
      host: conn.host,
      port: conn.port,
      user: conn.username,
      password: conn.password,
      database: conn.database,
      ssl: conn.ssl ? { rejectUnauthorized: false } : false,
    });

    try {
      // Get tables and columns
      const result = await pgPool.query(`
        SELECT 
          t.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          tc.constraint_type
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
        LEFT JOIN information_schema.key_column_usage kcu ON c.column_name = kcu.column_name AND c.table_name = kcu.table_name
        LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name AND tc.constraint_type = 'PRIMARY KEY'
        WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name, c.ordinal_position
      `);

      await pgPool.end();

      // Format schema for AI
      const tables: Record<string, string[]> = {};
      for (const row of result.rows) {
        if (!tables[row.table_name]) {
          tables[row.table_name] = [];
        }
        const pkFlag = row.constraint_type === 'PRIMARY KEY' ? ' (PK)' : '';
        const nullable = row.is_nullable === 'YES' ? ' NULL' : ' NOT NULL';
        tables[row.table_name].push(`${row.column_name}: ${row.data_type}${nullable}${pkFlag}`);
      }

      let schemaStr = 'Database schema (PostgreSQL):\n';
      for (const [table, columns] of Object.entries(tables)) {
        schemaStr += `\nTable: ${table}\n`;
        schemaStr += columns.map(c => `  - ${c}`).join('\n');
      }

      return schemaStr;
    } catch (error) {
      await pgPool.end();
      throw error;
    }
  } else {
    // MySQL
    const connection = await mysql.createConnection({
      host: conn.host,
      port: conn.port,
      user: conn.username,
      password: conn.password,
      database: conn.database,
      ssl: conn.ssl ? { rejectUnauthorized: false } : undefined,
    });

    try {
      const [rows] = await connection.execute(`
        SELECT 
          t.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          c.column_key
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
        WHERE t.table_schema = ? AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name, c.ordinal_position
      `, [conn.database]);

      await connection.end();

      // Format schema for AI
      const tables: Record<string, string[]> = {};
      for (const row of rows as Array<Record<string, string>>) {
        if (!tables[row.table_name]) {
          tables[row.table_name] = [];
        }
        const pkFlag = row.column_key === 'PRI' ? ' (PK)' : '';
        const nullable = row.is_nullable === 'YES' ? ' NULL' : ' NOT NULL';
        tables[row.table_name].push(`${row.column_name}: ${row.data_type}${nullable}${pkFlag}`);
      }

      let schemaStr = 'Database schema (MySQL):\n';
      for (const [table, columns] of Object.entries(tables)) {
        schemaStr += `\nTable: ${table}\n`;
        schemaStr += columns.map(c => `  - ${c}`).join('\n');
      }

      return schemaStr;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }
}

// Call AI provider (Gemini or Ollama based on configuration)
async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  try {
    return await generateAIResponse(prompt, systemPrompt);
  } catch (error) {
    if (error instanceof Error) {
      throw new ValidationError(error.message);
    }
    throw error;
  }
}

// Validate SQL syntax and extract operation type
function validateAndParseSql(sql: string, engine: 'postgres' | 'mysql'): { 
  isValid: boolean; 
  error?: string; 
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' 
} {
  const trimmedSql = sql.trim().toUpperCase();
  
  // Check for dangerous operations
  const dangerousPatterns = [
    /DROP\s+(TABLE|DATABASE|INDEX|VIEW|SCHEMA)/i,
    /TRUNCATE/i,
    /ALTER\s+(TABLE|DATABASE)/i,
    /CREATE\s+(TABLE|DATABASE|INDEX|VIEW|SCHEMA)/i,
    /GRANT/i,
    /REVOKE/i,
    /--/,
    /;.*SELECT/i, // Multiple statements
    /UNION\s+ALL\s+SELECT/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      return { isValid: false, error: 'SQL contains dangerous or disallowed operations' };
    }
  }

  // Determine operation type
  let operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | undefined;
  if (trimmedSql.startsWith('SELECT')) {
    operation = 'SELECT';
  } else if (trimmedSql.startsWith('INSERT')) {
    operation = 'INSERT';
  } else if (trimmedSql.startsWith('UPDATE')) {
    operation = 'UPDATE';
  } else if (trimmedSql.startsWith('DELETE')) {
    operation = 'DELETE';
  } else {
    return { isValid: false, error: 'Only SELECT, INSERT, UPDATE, and DELETE operations are allowed' };
  }

  // Check for proper parameter placeholders
  const paramPlaceholder = engine === 'postgres' ? /\$\d+/g : /\?/g;
  const hasParams = paramPlaceholder.test(sql);
  
  // If the query doesn't have parameters but should (has WHERE clause with values)
  const hasWhereClause = /WHERE/i.test(sql);
  if (hasWhereClause && !hasParams) {
    // Check if there are hardcoded values in WHERE clause
    const whereClause = sql.substring(sql.toUpperCase().indexOf('WHERE'));
    const hardcodedPattern = /=\s*['"]?[\w\d]+['"]?/i;
    if (hardcodedPattern.test(whereClause)) {
      return { isValid: false, error: 'SQL should use parameters instead of hardcoded values. Use $1, $2 for PostgreSQL or ? for MySQL.' };
    }
  }

  return { isValid: true, operation };
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Map database row to DTO
function mapToDto(row: DbGeneratedApiDto): GeneratedApiDto {
  return {
    id: row.id,
    databaseId: row.database_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sql: row.sql,
    params: row.params,
    operation: row.operation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Generate SQL from natural language prompt using Ollama
 */
export const generateSqlService = async (
  userId: string,
  body: GenerateSqlRequestDto
): Promise<GeneratedSqlDto> => {
  const { databaseId, prompt } = body;

  // Validate it's a data-related request
  const nonSqlPatterns = [
    /weather/i,
    /joke/i,
    /story/i,
    /poem/i,
    /hello/i,
    /hi\s/i,
    /how are you/i,
    /what is your name/i,
    /who are you/i,
    /help me with/i,
    /explain/i,
    /what is/i,
    /define/i,
  ];

  for (const pattern of nonSqlPatterns) {
    if (pattern.test(prompt) && !/data|query|select|users|orders|table|database|sql|get|find|fetch|insert|update|delete/i.test(prompt)) {
      throw new ValidationError('I can only help with database-related queries. Please ask me to generate SQL queries for your data.');
    }
  }

  // Get database connection info to know the engine
  const conn = await getDatabaseConnection(userId, databaseId);
  const schema = await getDatabaseSchema(userId, databaseId);
  
  const paramStyle = conn.engine === 'postgres' ? '$1, $2, $3, ...' : '?, ?, ?, ...';
  
  // Extract table names from schema for validation
  const tableNames = schema.match(/Table:\s*(\w+)/g)?.map(t => t.replace('Table:', '').trim().toLowerCase()) || [];
  
  // Extract all column names from schema for validation
  const columnMatches = schema.match(/-\s*(\w+):/g) || [];
  const allColumns = columnMatches.map(c => c.replace(/^-\s*/, '').replace(/:$/, '').toLowerCase());
  
  const systemPrompt = `
You are a SQL query generator for ${conn.engine === 'postgres' ? 'PostgreSQL' : 'MySQL'}.

**STRICT SCHEMA ENFORCEMENT - READ CAREFULLY:**
You can ONLY use the exact tables and columns listed below. If the user asks for data that requires a column or table that DOES NOT EXIST in the schema, you MUST respond with:
ERROR: Cannot generate query - the required column/table does not exist in the schema

DO NOT INVENT OR ASSUME columns like "stock", "inventory", "total", "status" etc. unless they are EXPLICITLY listed in the schema below.

AVAILABLE TABLES: ${tableNames.join(', ')}

${schema}

INTERPRET USER INTENT:
- "get", "fetch", "find", "show", "list", "retrieve" → SELECT
- "add", "create", "insert", "new" → INSERT  
- "change", "modify", "update", "edit" → UPDATE
- "remove", "delete" → DELETE

AVAILABLE SQL FEATURES:
- JOINs, Aggregates (COUNT, SUM, AVG, MIN, MAX), GROUP BY, HAVING
- WHERE, ORDER BY, LIMIT, DISTINCT, Aliases

OUTPUT FORMAT (exactly 3 parts):
1. SQL query (ONLY using columns from schema above)
2. JSON array: [] or [param1, param2]
3. Brief description

Use ${paramStyle} for parameters. NO markdown. NO code blocks.

FORBIDDEN: DROP, ALTER, TRUNCATE, CREATE, GRANT, REVOKE

EXAMPLE - When column doesn't exist:
Request: "find products with low stock"
If there is NO "stock" or "quantity" column in products table:
ERROR: Cannot generate query - the "stock" column does not exist in the products table

EXAMPLE - Valid query:
Request: "count orders per user"
SELECT user_id, COUNT(*) as order_count FROM orders GROUP BY user_id
[]
Counts orders for each user
`;


  const aiResponse = await callAI(prompt, systemPrompt);
  console.log('AI Response:', aiResponse);
  
  // Check if AI refused or reported error
  if (aiResponse.toLowerCase().includes('error:') || aiResponse.toLowerCase().includes('does not exist') || aiResponse.toLowerCase().includes('cannot generate')) {
    const errorMsg = aiResponse.includes(':') ? aiResponse.split(':').slice(1).join(':').trim() : aiResponse;
    throw new ValidationError(errorMsg);
  }

  // Parse AI response - clean up markdown first
  let responseText = aiResponse.trim();
  responseText = responseText.replace(/```sql\n?/gi, '').replace(/```\n?/g, '');
  
  // Split into lines
  const allLines = responseText.split('\n');
  
  // Find SQL lines, JSON params line, and description line
  const sqlLines: string[] = [];
  let params: (string | number | boolean | null)[] = [];
  let description = prompt;
  let foundParams = false;
  
  for (const line of allLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check if this is a JSON array (params)
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          params = parsed;
          foundParams = true;
          continue;
        }
      } catch {
        // Not valid JSON, might be part of SQL
      }
    }
    
    // After params, the next non-empty line is the description
    if (foundParams) {
      description = trimmed;
      break;
    }
    
    // Check if this looks like SQL (starts with keyword or continues SQL)
    const isSqlKeyword = /^(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|AND|OR|ON|SET|INTO|VALUES|ORDER|GROUP|HAVING|LIMIT|OFFSET|AS|DISTINCT|CASE|WHEN|THEN|ELSE|END|UNION)/i.test(trimmed);
    const continuesSql = sqlLines.length > 0 && !trimmed.match(/^[A-Z][a-z]+\s+[a-z]/); // Not a sentence
    
    if (isSqlKeyword || continuesSql) {
      sqlLines.push(line);
    }
  }
  
  let sql = sqlLines.join('\n').trim();
  
  // Clean up: ensure it ends with semicolon
  sql = sql.replace(/;?\s*$/, ';');

  if (!sql || !sql.match(/^(SELECT|INSERT|UPDATE|DELETE)/i)) {
    throw new ValidationError('Failed to generate SQL. Please try rephrasing your request.');
  }

  // Validate that SQL only references tables in the schema
  const sqlLower = sql.toLowerCase();
  const referencedTables = sqlLower.match(/(?:from|join|into|update)\s+(\w+)/gi) || [];
  for (const match of referencedTables) {
    const tableName = match.replace(/(?:from|join|into|update)\s+/i, '').trim();
    if (!tableNames.includes(tableName)) {
      throw new ValidationError(`Table "${tableName}" does not exist in the database schema. Available tables: ${tableNames.join(', ')}`);
    }
  }

  // Validate that SQL only references columns in the schema
  // Extract column references - look for table.column or standalone column patterns
  const sqlWithoutStrings = sql.replace(/'[^']*'/g, '').replace(/"[^"]*"/g, ''); // Remove string literals
  
  // Match: table.column or standalone words that could be columns
  const columnPatterns = [
    /(\w+)\.(\w+)/g,  // table.column
    /(?:SELECT|WHERE|AND|OR|ON|SET|BY|,)\s+(\w+)(?:\s|,|=|>|<|!|\))/gi, // column after keywords
  ];
  
  const sqlKeywords = new Set(['select', 'from', 'where', 'join', 'on', 'and', 'or', 'as', 'in', 'is', 'not', 'null', 'like', 'between', 'order', 'by', 'group', 'having', 'limit', 'offset', 'asc', 'desc', 'distinct', 'count', 'sum', 'avg', 'min', 'max', 'inner', 'left', 'right', 'outer', 'full', 'cross', 'insert', 'into', 'values', 'update', 'set', 'delete', 'case', 'when', 'then', 'else', 'end', 'true', 'false', 'using', 'all', 'any', 'exists', 'primary', 'key', 'foreign', 'references', 'default', 'constraint', 'index', 'unique', 'check', 'cascade']);
  
  // Check table.column patterns
  let tableColMatch;
  const tableColRegex = /(\w+)\.(\w+)/g;
  while ((tableColMatch = tableColRegex.exec(sqlWithoutStrings)) !== null) {
    const colName = tableColMatch[2].toLowerCase();
    // Skip if it's a keyword or *
    if (colName !== '*' && !sqlKeywords.has(colName)) {
      if (!allColumns.includes(colName)) {
        throw new ValidationError(`Column "${colName}" does not exist in the database schema. Please check your query or ask for available columns.`);
      }
    }
  }

  // Validate the generated SQL
  const validation = validateAndParseSql(sql, conn.engine);
  
  return {
    sql,
    params,
    operation: validation.operation || 'SELECT',
    description,
    isValid: validation.isValid,
    validationError: validation.error,
  };
};

/**
 * Save a generated SQL as an API endpoint
 */
export const saveGeneratedApiService = async (
  userId: string,
  body: SaveGeneratedApiDto
): Promise<GeneratedApiDto> => {
  const { databaseId, name, description, sql, params, operation } = body;

  // Verify database exists and user owns it
  const dbCheck = await pool.query(
    `SELECT id FROM database_connections WHERE id = $1 AND user_id = $2`,
    [databaseId, userId]
  );

  if (dbCheck.rowCount === 0) {
    throw new NotFoundError('Database not found');
  }

  const slug = generateSlug(name);

  // Check if slug already exists for this database
  const existingCheck = await pool.query(
    `SELECT id FROM generated_apis WHERE database_id = $1 AND slug = $2`,
    [databaseId, slug]
  );

  if ((existingCheck.rowCount ?? 0) > 0) {
    throw new ValidationError('An API with this name already exists for this database');
  }

  const result = await pool.query<DbGeneratedApiDto>(
    `INSERT INTO generated_apis (user_id, database_id, name, slug, description, sql, params, operation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [userId, databaseId, name, slug, description, sql, JSON.stringify(params), operation]
  );

  return mapToDto(result.rows[0]);
};

/**
 * Get all generated APIs for a database
 */
export const getGeneratedApisService = async (
  userId: string,
  databaseId: string
): Promise<GeneratedApiDto[]> => {
  const result = await pool.query<DbGeneratedApiDto>(
    `SELECT * FROM generated_apis WHERE user_id = $1 AND database_id = $2 ORDER BY created_at DESC`,
    [userId, databaseId]
  );

  return result.rows.map(mapToDto);
};

/**
 * Get a single generated API by ID
 */
export const getGeneratedApiService = async (
  userId: string,
  apiId: string
): Promise<GeneratedApiDto> => {
  const result = await pool.query<DbGeneratedApiDto>(
    `SELECT * FROM generated_apis WHERE id = $1 AND user_id = $2`,
    [apiId, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('Generated API not found');
  }

  return mapToDto(result.rows[0]);
};

/**
 * Delete a generated API
 */
export const deleteGeneratedApiService = async (
  userId: string,
  apiId: string
): Promise<void> => {
  const result = await pool.query(
    `DELETE FROM generated_apis WHERE id = $1 AND user_id = $2`,
    [apiId, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('Generated API not found');
  }
};

/**
 * Execute a generated API
 */
export const executeGeneratedApiService = async (
  userId: string,
  databaseId: string,
  apiSlugOrId: string,
  body: ExecuteGeneratedApiDto
): Promise<{ result: unknown[]; rowCount: number; sql: string }> => {
  // Try to find by slug first, then by ID
  let apiResult = await pool.query<DbGeneratedApiDto>(
    `SELECT * FROM generated_apis WHERE database_id = $1 AND user_id = $2 AND slug = $3`,
    [databaseId, userId, apiSlugOrId]
  );

  if (apiResult.rowCount === 0) {
    apiResult = await pool.query<DbGeneratedApiDto>(
      `SELECT * FROM generated_apis WHERE database_id = $1 AND user_id = $2 AND id = $3`,
      [databaseId, userId, apiSlugOrId]
    );
  }

  if (apiResult.rowCount === 0) {
    throw new NotFoundError('Generated API not found');
  }

  const api = apiResult.rows[0];
  const conn = await getDatabaseConnection(userId, databaseId);

  // Build parameter values array from the request body
  const paramValues: (string | number | boolean | null)[] = [];
  
  // Parse params from JSON if it's stored as string
  let paramNames: string[] = [];
  if (typeof api.params === 'string') {
    try {
      paramNames = JSON.parse(api.params);
    } catch {
      paramNames = [];
    }
  } else {
    paramNames = api.params || [];
  }

  for (const paramName of paramNames) {
    if (body.params && paramName in body.params) {
      paramValues.push(body.params[paramName]);
    } else {
      throw new ValidationError(`Missing required parameter: ${paramName}`);
    }
  }

  // Execute the query
  if (conn.engine === 'postgres') {
    const pgPool = new Pool({
      host: conn.host,
      port: conn.port,
      user: conn.username,
      password: conn.password,
      database: conn.database,
      ssl: conn.ssl ? { rejectUnauthorized: false } : false,
    });

    try {
      const result = await pgPool.query(api.sql, paramValues);
      await pgPool.end();

      return {
        result: result.rows,
        rowCount: result.rowCount || 0,
        sql: api.sql,
      };
    } catch (error) {
      await pgPool.end();
      throw error;
    }
  } else {
    const connection = await mysql.createConnection({
      host: conn.host,
      port: conn.port,
      user: conn.username,
      password: conn.password,
      database: conn.database,
      ssl: conn.ssl ? { rejectUnauthorized: false } : undefined,
    });

    try {
      const [rows, fields] = await connection.execute(api.sql, paramValues);
      await connection.end();

      const result = Array.isArray(rows) ? rows : [];
      return {
        result: result as unknown[],
        rowCount: Array.isArray(rows) ? rows.length : 0,
        sql: api.sql,
      };
    } catch (error) {
      await connection.end();
      throw error;
    }
  }
};
