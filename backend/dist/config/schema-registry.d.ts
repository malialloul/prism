import { ZodObject, ZodRawShape } from "zod";
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
export declare function registerTable<T extends ZodRawShape>(name: string, schema: ZodObject<T>, options?: RegisterTableOptions): ZodObject<T>;
/**
 * Gets all registered table definitions
 */
export declare function getRegisteredTables(): TableDefinition[];
/**
 * Gets a specific table definition by name
 */
export declare function getTableDefinition(tableName: string): TableDefinition | undefined;
/**
 * Clears all registered tables (useful for testing)
 */
export declare function clearRegistry(): void;
//# sourceMappingURL=schema-registry.d.ts.map