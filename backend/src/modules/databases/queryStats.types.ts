// src/modules/databases/queryStats.types.ts

export interface QueryExecutionLogInput {
  userId: number;
  databaseId: number;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER';
  executionTimeMs: number;
  rowsAffected: number;
  success: boolean;
  errorMessage?: string;
}

export interface QueryStatsResponse {
  totalQueries: number;
  queriesLastHour: number;
  queriesLastDay: number;
  queriesByDatabase: Array<{
    databaseId: number;
    count: number;
  }>;
  avgExecutionTimeMs: number;
  successRate: number;
  // Hourly breakdown for charts (last 24 hours)
  hourlyData: Array<{
    hour: number; // 0-23
    queries: number;
    errors: number;
    avgLatencyMs: number;
  }>;
}

export interface DbQueryExecutionLog {
  id: number;
  user_id: number;
  database_id: number;
  query_type: string;
  execution_time_ms: number;
  rows_affected: number;
  success: boolean;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}
