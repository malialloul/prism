// src/config/schema-registry.ts
import { z, ZodObject, ZodRawShape, ZodTypeAny } from "zod";

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  unique?: boolean;
  defaultValue?: string;
  references?: {
    table: string;
    column: string;
  };
}

export interface TableDefinition {
  tableName: string;
  columns: TableColumn[];
  schema: ZodObject<ZodRawShape>;
}

const tableRegistry: Map<string, TableDefinition> = new Map();

/**
 * Maps Zod types to PostgreSQL column types
 */
function zodTypeToPostgres(zodType: ZodTypeAny, fieldName: string): string {
  const typeName = zodType._def.typeName;

  // Handle optional/nullable wrappers
  if (typeName === "ZodOptional" || typeName === "ZodNullable") {
    return zodTypeToPostgres(zodType._def.innerType, fieldName);
  }

  // Handle default wrappers
  if (typeName === "ZodDefault") {
    return zodTypeToPostgres(zodType._def.innerType, fieldName);
  }

  switch (typeName) {
    case "ZodString":
      // Check for specific string formats
      const checks = zodType._def.checks || [];
      for (const check of checks) {
        if (check.kind === "email") return "VARCHAR(255)";
        if (check.kind === "uuid") return "UUID";
        if (check.kind === "url") return "TEXT";
        if (check.kind === "max" && check.value <= 255)
          return `VARCHAR(${check.value})`;
      }
      return "TEXT";

    case "ZodNumber":
      const numChecks = zodType._def.checks || [];
      const isInt = numChecks.some((c: { kind: string }) => c.kind === "int");
      return isInt ? "INTEGER" : "DOUBLE PRECISION";

    case "ZodBoolean":
      return "BOOLEAN";

    case "ZodDate":
      return "TIMESTAMP WITH TIME ZONE";

    case "ZodEnum":
      const values = zodType._def.values as string[];
      return `VARCHAR(${Math.max(...values.map((v) => v.length), 50)})`;

    case "ZodArray":
      return "JSONB";

    case "ZodObject":
      return "JSONB";

    case "ZodBigInt":
      return "BIGINT";

    default:
      return "TEXT";
  }
}

/**
 * Checks if a Zod type is optional or nullable
 */
function isNullable(zodType: ZodTypeAny): boolean {
  const typeName = zodType._def.typeName;
  return typeName === "ZodOptional" || typeName === "ZodNullable";
}

/**
 * Gets the default value for a Zod type if it has one
 */
function getDefaultValue(zodType: ZodTypeAny): string | undefined {
  if (zodType._def.typeName === "ZodDefault") {
    const defaultVal = zodType._def.defaultValue();
    if (typeof defaultVal === "string") return `'${defaultVal}'`;
    if (typeof defaultVal === "number") return String(defaultVal);
    if (typeof defaultVal === "boolean") return String(defaultVal);
    if (defaultVal instanceof Date) return `'${defaultVal.toISOString()}'`;
  }
  return undefined;
}

export interface RegisterTableOptions {
  /** Custom table name (defaults to lowercase schema name) */
  tableName?: string;
  /** Add automatic id column */
  withId?: boolean;
  /** Add automatic timestamps (created_at, updated_at) */
  withTimestamps?: boolean;
  /** Column overrides for specific fields */
  columnOverrides?: Record<string, Partial<TableColumn>>;
  /** Fields to exclude from table creation */
  excludeFields?: string[];
}

/**
 * Registers a Zod schema as a database table
 */
export function registerTable<T extends ZodRawShape>(
  name: string,
  schema: ZodObject<T>,
  options: RegisterTableOptions = {}
): ZodObject<T> {
  const {
    tableName = name.toLowerCase().replace(/schema$/i, ""),
    withId = true,
    withTimestamps = true,
    columnOverrides = {},
    excludeFields = [],
  } = options;

  const columns: TableColumn[] = [];

  // Add automatic ID column (SERIAL = auto-incrementing INTEGER)
  if (withId) {
    columns.push({
      name: "id",
      type: "SERIAL",
      nullable: false,
      primaryKey: true,
    });
  }

  // Process schema fields
  const shape = schema.shape;
  for (const [fieldName, zodType] of Object.entries(shape)) {
    if (excludeFields.includes(fieldName)) continue;

    // Convert camelCase to snake_case for column names
    const columnName = fieldName.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );

    const override = columnOverrides[fieldName] || {};

    columns.push({
      name: columnName,
      type: zodTypeToPostgres(zodType as ZodTypeAny, fieldName),
      nullable: isNullable(zodType as ZodTypeAny),
      defaultValue: getDefaultValue(zodType as ZodTypeAny),
      ...override,
    });
  }

  // Add automatic timestamps
  if (withTimestamps) {
    columns.push({
      name: "created_at",
      type: "TIMESTAMP WITH TIME ZONE",
      nullable: false,
      defaultValue: "NOW()",
    });
    columns.push({
      name: "updated_at",
      type: "TIMESTAMP WITH TIME ZONE",
      nullable: false,
      defaultValue: "NOW()",
    });
  }

  tableRegistry.set(tableName, {
    tableName,
    columns,
    schema,
  });

  return schema;
}

/**
 * Gets all registered table definitions
 */
export function getRegisteredTables(): TableDefinition[] {
  return Array.from(tableRegistry.values());
}

/**
 * Gets a specific table definition by name
 */
export function getTableDefinition(
  tableName: string
): TableDefinition | undefined {
  return tableRegistry.get(tableName);
}

/**
 * Clears all registered tables (useful for testing)
 */
export function clearRegistry(): void {
  tableRegistry.clear();
}
