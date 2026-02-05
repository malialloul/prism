export interface MigrationOptions {
    /** Log SQL statements to console */
    verbose?: boolean;
    /** Only generate SQL without executing */
    dryRun?: boolean;
    /** Drop existing tables and recreate (DANGEROUS - only for development) */
    dropExisting?: boolean;
}
export interface MigrationResult {
    success: boolean;
    tablesCreated: string[];
    tablesModified: string[];
    errors: {
        table: string;
        error: string;
    }[];
    sqlStatements: string[];
}
export declare function autoMigrate(options?: MigrationOptions): Promise<MigrationResult>;
/**
 * Generates migration SQL without executing
 */
export declare function generateMigrationSQL(): Promise<string[]>;
//# sourceMappingURL=auto-migrate.d.ts.map