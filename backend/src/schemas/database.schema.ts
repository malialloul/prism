import { z } from "zod";
import { registerTable } from "../config/schema-registry";

// Database connections table - stores user's connected databases
export const DatabaseConnectionSchema = registerTable(
  "database_connections",
  z.object({
    userId: z.number().int(),
    name: z.string(),
    engine: z.enum(["postgres", "mysql"]),
    host: z.string(),
    port: z.number().int(),
    username: z.string(),
    passwordEncrypted: z.string(), // Encrypted password
    database: z.string(),
    ssl: z.boolean().default(true),
    status: z.enum(["connected", "disconnected", "error"]).default("disconnected"),
    lastConnectedAt: z.date(),
    tables: z.number().int().default(0),
    apis: z.number().int().default(0),
    storageBytes: z.number().int().default(0), // Storage used in bytes
    isHosted: z.boolean().default(false), // Whether this is a hosted database on our servers
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      userId: { references: { table: "users", column: "id" } },
    },
  }
);

// Saved queries table - stores user's saved SQL queries
export const SavedQuerySchema = registerTable(
  "saved_queries",
  z.object({
    userId: z.number().int(),
    databaseId: z.number().int(),
    name: z.string(),
    sql: z.string(),
  }),
  {
    withId: true,
    withTimestamps: true,
    columnOverrides: {
      userId: { references: { table: "users", column: "id" } },
      databaseId: { references: { table: "database_connections", column: "id" } },
      sql: { type: "TEXT" },
    },
  }
);

// Request schemas
export const CreateDatabaseSchema = z.object({
  name: z.string().min(1, "Database name is required"),
  engine: z.enum(["postgres", "mysql"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const ConnectDatabaseSchema = z.object({
  name: z.string().min(1, "Database name is required"),
  engine: z.enum(["postgres", "mysql"]),
  host: z.string().min(1, "Host is required"),
  port: z.number().int().positive(),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  database: z.string().min(1, "Database name is required"),
  ssl: z.boolean().default(true),
});

export const TestConnectionSchema = z.object({
  engine: z.enum(["postgres", "mysql"]),
  host: z.string().min(1, "Host is required"),
  port: z.number().int().positive(),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  database: z.string().min(1, "Database name is required"),
  ssl: z.boolean().default(true),
});

export const UpdateDatabaseSchema = z.object({
  name: z.string().min(1).optional(),
  host: z.string().min(1).optional(),
  port: z.number().int().positive().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  database: z.string().min(1).optional(),
  ssl: z.boolean().optional(),
});

// Response schemas
export const DatabaseResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  engine: z.enum(["postgres", "mysql"]),
  host: z.string(),
  port: z.number().int(),
  database: z.string(),
  ssl: z.boolean(),
  status: z.enum(["connected", "disconnected", "error"]),
  lastConnectedAt: z.date(),
  tables: z.number().int(),
  apis: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DatabaseConnectionDto = z.infer<typeof DatabaseConnectionSchema>;
export type ConnectDatabaseDto = z.infer<typeof ConnectDatabaseSchema>;
export type UpdateDatabaseDto = z.infer<typeof UpdateDatabaseSchema>;
export type DatabaseResponseDto = z.infer<typeof DatabaseResponseSchema>;
