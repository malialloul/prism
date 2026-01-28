// src/modules/databases/queryStats.service.ts
import { pool } from '../../config/db';
import type { 
  QueryExecutionLogInput, 
  QueryStatsResponse,
  DbQueryExecutionLog 
} from './queryStats.types';

/**
 * Log a query execution for stats tracking
 */
export async function logQueryExecution(input: QueryExecutionLogInput): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO query_execution_logs 
     (user_id, database_id, query_type, execution_time_ms, rows_affected, success, error_message, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING id`,
    [
      input.userId,
      input.databaseId,
      input.queryType,
      input.executionTimeMs,
      input.rowsAffected,
      input.success,
      input.errorMessage || null,
    ]
  );
  return result.rows[0].id;
}

/**
 * Get query statistics for a user
 */
export async function getQueryStats(userId: number, databaseId?: number): Promise<QueryStatsResponse> {
  // Build the WHERE clause
  const whereConditions = ['user_id = $1'];
  const params: number[] = [userId];
  
  if (databaseId) {
    whereConditions.push('database_id = $2');
    params.push(databaseId);
  }
  
  const whereClause = whereConditions.join(' AND ');
  
  // Total queries
  const totalResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM query_execution_logs WHERE ${whereClause}`,
    params
  );
  const totalQueries = parseInt(totalResult.rows[0].count, 10);
  
  // Queries in last hour
  const lastHourParams = databaseId ? [userId, databaseId] : [userId];
  const lastHourResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM query_execution_logs 
     WHERE ${whereClause} AND created_at > NOW() - INTERVAL '1 hour'`,
    lastHourParams
  );
  const queriesLastHour = parseInt(lastHourResult.rows[0].count, 10);
  
  // Queries in last day
  const lastDayResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM query_execution_logs 
     WHERE ${whereClause} AND created_at > NOW() - INTERVAL '1 day'`,
    lastHourParams
  );
  const queriesLastDay = parseInt(lastDayResult.rows[0].count, 10);
  
  // Queries by database
  const byDatabaseResult = await pool.query<{ database_id: number; count: string }>(
    `SELECT database_id, COUNT(*) as count FROM query_execution_logs 
     WHERE user_id = $1 
     GROUP BY database_id`,
    [userId]
  );
  const queriesByDatabase = byDatabaseResult.rows.map(row => ({
    databaseId: row.database_id,
    count: parseInt(row.count, 10),
  }));
  
  // Average execution time
  const avgTimeResult = await pool.query<{ avg: string | null }>(
    `SELECT AVG(execution_time_ms) as avg FROM query_execution_logs WHERE ${whereClause}`,
    lastHourParams
  );
  const avgExecutionTimeMs = avgTimeResult.rows[0].avg 
    ? parseFloat(avgTimeResult.rows[0].avg) 
    : 0;
  
  // Success rate
  const successResult = await pool.query<{ total: string; success: string }>(
    `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE success = true) as success
     FROM query_execution_logs WHERE ${whereClause}`,
    lastHourParams
  );
  const total = parseInt(successResult.rows[0].total, 10);
  const successCount = parseInt(successResult.rows[0].success, 10);
  const successRate = total > 0 ? (successCount / total) * 100 : 100;
  
  // Hourly breakdown for last 24 hours
  const hourlyResult = await pool.query<{ 
    hour: string; 
    queries: string; 
    errors: string; 
    avg_latency: string | null;
  }>(
    `SELECT 
      EXTRACT(HOUR FROM created_at)::int as hour,
      COUNT(*) as queries,
      COUNT(*) FILTER (WHERE success = false) as errors,
      AVG(execution_time_ms) as avg_latency
     FROM query_execution_logs 
     WHERE ${whereClause} AND created_at > NOW() - INTERVAL '24 hours'
     GROUP BY EXTRACT(HOUR FROM created_at)
     ORDER BY hour`,
    lastHourParams
  );
  
  // Create a full 24-hour array with defaults
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    queries: 0,
    errors: 0,
    avgLatencyMs: 0,
  }));
  
  // Fill in actual data
  for (const row of hourlyResult.rows) {
    const hour = parseInt(row.hour, 10);
    hourlyData[hour] = {
      hour,
      queries: parseInt(row.queries, 10),
      errors: parseInt(row.errors, 10),
      avgLatencyMs: row.avg_latency ? Math.round(parseFloat(row.avg_latency)) : 0,
    };
  }
  
  return {
    totalQueries,
    queriesLastHour,
    queriesLastDay,
    queriesByDatabase,
    avgExecutionTimeMs: Math.round(avgExecutionTimeMs * 100) / 100,
    successRate: Math.round(successRate * 100) / 100,
    hourlyData,
  };
}

/**
 * Detect query type from SQL string
 */
export function detectQueryType(sql: string): 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER' {
  const trimmed = sql.trim().toUpperCase();
  if (trimmed.startsWith('SELECT')) return 'SELECT';
  if (trimmed.startsWith('INSERT')) return 'INSERT';
  if (trimmed.startsWith('UPDATE')) return 'UPDATE';
  if (trimmed.startsWith('DELETE')) return 'DELETE';
  return 'OTHER';
}
