// src/schemas/ai.schema.ts
import { z } from "zod";
import { registerTable } from "../config/schema-registry";

// Generated APIs table - stores AI-generated SQL endpoints
export const GeneratedApiSchema = registerTable(
  "generated_apis",
  z.object({
    userId: z.number().int(),
    databaseId: z.number().int(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    sql: z.string(),
    params: z.string(), // JSON array of parameter names
    operation: z.enum(["SELECT", "INSERT", "UPDATE", "DELETE"]),
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      userId: { references: { table: "users", column: "id" } },
      databaseId: { references: { table: "database_connections", column: "id" } },
      sql: { type: "TEXT" },
      params: { type: "TEXT" },
    },
  }
);

// Request schemas
export const GenerateSqlSchema = z.object({
  databaseId: z.string().min(1, "Database ID is required"),
  prompt: z.string().min(1, "Prompt is required").max(1000, "Prompt too long"),
});

export const SaveGeneratedApiSchema = z.object({
  databaseId: z.string().min(1, "Database ID is required"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").default(""),
  sql: z.string().min(1, "SQL is required"),
  params: z.array(z.string()).default([]),
  operation: z.enum(["SELECT", "INSERT", "UPDATE", "DELETE"]),
});

export const ExecuteGeneratedApiSchema = z.object({
  params: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
});

// Response schemas
export const GeneratedSqlResponseSchema = z.object({
  sql: z.string(),
  params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])),
  operation: z.enum(["SELECT", "INSERT", "UPDATE", "DELETE"]),
  description: z.string(),
  isValid: z.boolean(),
  validationError: z.string().optional(),
});

export const GeneratedApiResponseSchema = z.object({
  id: z.string(),
  databaseId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  sql: z.string(),
  params: z.array(z.string()),
  operation: z.enum(["SELECT", "INSERT", "UPDATE", "DELETE"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});
