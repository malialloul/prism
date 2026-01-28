import { z } from "zod";
import { registerTable } from "../config/schema-registry";

// Query execution logs table - tracks all executed queries for stats
export const QueryExecutionLogSchema = registerTable(
  "query_execution_logs",
  z.object({
    userId: z.number().int(),
    databaseId: z.number().int(),
    queryType: z.enum(["SELECT", "INSERT", "UPDATE", "DELETE", "OTHER"]),
    executionTimeMs: z.number().int(),
    rowsAffected: z.number().int().default(0),
    success: z.boolean().default(true),
    errorMessage: z.string().optional(),
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      userId: { references: { table: "users", column: "id" } },
      databaseId: { references: { table: "database_connections", column: "id" } },
      errorMessage: { type: "TEXT", nullable: true },
    },
  }
);

// Query stats response schema
export const QueryStatsResponseSchema = z.object({
  totalQueries: z.number().int(),
  queriesLastHour: z.number().int(),
  queriesLastDay: z.number().int(),
  queriesByDatabase: z.array(z.object({
    databaseId: z.string().uuid(),
    count: z.number().int(),
  })),
  avgExecutionTimeMs: z.number(),
  successRate: z.number(),
});

export type QueryExecutionLogDto = z.infer<typeof QueryExecutionLogSchema>;
export type QueryStatsResponseDto = z.infer<typeof QueryStatsResponseSchema>;
