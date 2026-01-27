// src/config/auto-migrate.ts
import { pool } from "./db";
import { getRegisteredTables, TableColumn, TableDefinition } from "./schema-registry";

/**
 * Generates CREATE TABLE SQL for a table definition
 */
function generateCreateTableSQL(table: TableDefinition): string {
  const columnDefs = table.columns.map((col) => {
    let def = `"${col.name}" ${col.type}`;

    if (col.primaryKey) {
      def += " PRIMARY KEY";
    }

    if (!col.nullable && !col.primaryKey) {
      def += " NOT NULL";
    }

    if (col.defaultValue) {
      def += ` DEFAULT ${col.defaultValue}`;
    }

    if (col.unique && !col.primaryKey) {
      def += " UNIQUE";
    }

    if (col.references) {
      def += ` REFERENCES "${col.references.table}"("${col.references.column}")`;
    }

    return def;
  });

  return `CREATE TABLE IF NOT EXISTS "${table.tableName}" (\n  ${columnDefs.join(",\n  ")}\n);`;
}

/**
 * Generates ALTER TABLE SQL to add missing columns
 */
function generateAlterTableSQL(
  tableName: string,
  existingColumns: string[],
  tableColumns: TableColumn[]
): string[] {
  const alterStatements: string[] = [];

  for (const col of tableColumns) {
    if (!existingColumns.includes(col.name)) {
      let alterSQL = `ALTER TABLE "${tableName}" ADD COLUMN "${col.name}" ${col.type}`;

      if (!col.nullable && col.defaultValue) {
        alterSQL += ` NOT NULL DEFAULT ${col.defaultValue}`;
      } else if (!col.nullable) {
        // For NOT NULL without default, we need to add with a temporary default
        alterSQL += ` DEFAULT ${getTemporaryDefault(col.type)}`;
        alterStatements.push(alterSQL);
        // Then remove the default
        alterStatements.push(
          `ALTER TABLE "${tableName}" ALTER COLUMN "${col.name}" DROP DEFAULT`
        );
        alterStatements.push(
          `ALTER TABLE "${tableName}" ALTER COLUMN "${col.name}" SET NOT NULL`
        );
        continue;
      }

      if (col.unique && !col.primaryKey) {
        alterSQL += " UNIQUE";
      }

      alterStatements.push(alterSQL + ";");
    }
  }

  return alterStatements;
}

/**
 * Gets a temporary default value for a column type
 */
function getTemporaryDefault(type: string): string {
  const upperType = type.toUpperCase();
  if (upperType.includes("VARCHAR") || upperType.includes("TEXT")) return "''";
  if (upperType.includes("INT") || upperType.includes("DOUBLE") || upperType.includes("NUMERIC")) return "0";
  if (upperType.includes("BOOLEAN")) return "false";
  if (upperType.includes("TIMESTAMP")) return "NOW()";
  if (upperType.includes("UUID")) return "gen_random_uuid()";
  if (upperType.includes("JSONB") || upperType.includes("JSON")) return "'{}'";
  return "NULL";
}

/**
 * Gets existing columns for a table
 */
async function getExistingColumns(tableName: string): Promise<string[]> {
  const result = await pool.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns 
     WHERE table_name = $1 AND table_schema = 'public'`,
    [tableName]
  );
  return result.rows.map((row) => row.column_name);
}

/**
 * Checks if a table exists
 */
async function tableExists(tableName: string): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = $1
    )`,
    [tableName]
  );
  return result.rows[0].exists;
}

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
  errors: { table: string; error: string }[];
  sqlStatements: string[];
}

/**
 * Automatically creates/updates database tables based on registered schemas
 */
/**
 * Sorts tables by their foreign key dependencies
 * Tables with no dependencies come first, then tables that depend on them
 */
function sortTablesByDependencies(tables: TableDefinition[]): TableDefinition[] {
  const tableMap = new Map(tables.map((t) => [t.tableName, t]));
  const sorted: TableDefinition[] = [];
  const visited = new Set<string>();

  function visit(tableName: string, visiting = new Set<string>()): void {
    if (visited.has(tableName)) return;
    if (visiting.has(tableName)) {
      console.warn(`[AutoMigrate] Circular dependency detected for table: ${tableName}`);
      return;
    }

    const table = tableMap.get(tableName);
    if (!table) return;

    visiting.add(tableName);

    // Visit all tables that this table depends on
    for (const col of table.columns) {
      if (col.references) {
        visit(col.references.table, visiting);
      }
    }

    visiting.delete(tableName);
    visited.add(tableName);
    sorted.push(table);
  }

  // Visit all tables to build dependency order
  for (const table of tables) {
    visit(table.tableName);
  }

  return sorted;
}

export async function autoMigrate(
  options: MigrationOptions = {}
): Promise<MigrationResult> {
  const { verbose = false, dryRun = false, dropExisting = false } = options;

  const result: MigrationResult = {
    success: true,
    tablesCreated: [],
    tablesModified: [],
    errors: [],
    sqlStatements: [],
  };

  let tables = getRegisteredTables();

  if (tables.length === 0) {
    if (verbose) console.log("[AutoMigrate] No tables registered");
    return result;
  }

  // Sort tables by dependencies (so foreign keys reference existing tables)
  tables = sortTablesByDependencies(tables);

  if (verbose) {
    console.log(`[AutoMigrate] Processing ${tables.length} registered table(s)`);
    console.log(`[AutoMigrate] Table order: ${tables.map((t) => t.tableName).join(" → ")}`);
  }

  for (const table of tables) {
    try {
      const exists = await tableExists(table.tableName);

      if (dropExisting && exists && !dryRun) {
        const dropSQL = `DROP TABLE IF EXISTS "${table.tableName}" CASCADE;`;
        result.sqlStatements.push(dropSQL);
        if (verbose) console.log(`[AutoMigrate] Dropping table: ${table.tableName}`);
        await pool.query(dropSQL);
      }

      if (!exists || dropExisting) {
        // Create new table
        const createSQL = generateCreateTableSQL(table);
        result.sqlStatements.push(createSQL);

        if (verbose) {
          console.log(`[AutoMigrate] Creating table: ${table.tableName}`);
          console.log(createSQL);
        }

        if (!dryRun) {
          await pool.query(createSQL);
        }

        result.tablesCreated.push(table.tableName);

        // Create updated_at trigger
        const triggerSQL = `
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ language 'plpgsql';

          DROP TRIGGER IF EXISTS update_${table.tableName}_updated_at ON "${table.tableName}";
          CREATE TRIGGER update_${table.tableName}_updated_at
            BEFORE UPDATE ON "${table.tableName}"
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `;

        if (!dryRun) {
          await pool.query(triggerSQL);
        }
        result.sqlStatements.push(triggerSQL);
      } else {
        // Table exists - check for missing columns
        const existingColumns = await getExistingColumns(table.tableName);
        const alterStatements = generateAlterTableSQL(
          table.tableName,
          existingColumns,
          table.columns
        );

        if (alterStatements.length > 0) {
          if (verbose) {
            console.log(`[AutoMigrate] Modifying table: ${table.tableName}`);
          }

          for (const sql of alterStatements) {
            result.sqlStatements.push(sql);
            if (verbose) console.log(sql);
            if (!dryRun) {
              await pool.query(sql);
            }
          }

          result.tablesModified.push(table.tableName);
        } else if (verbose) {
          console.log(`[AutoMigrate] Table ${table.tableName} is up to date`);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push({
        table: table.tableName,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`[AutoMigrate] Error processing table ${table.tableName}:`, error);
    }
  }

  if (verbose) {
    console.log("\n[AutoMigrate] Migration complete:");
    console.log(`  - Tables created: ${result.tablesCreated.length}`);
    console.log(`  - Tables modified: ${result.tablesModified.length}`);
    console.log(`  - Errors: ${result.errors.length}`);
  }

  return result;
}

/**
 * Generates migration SQL without executing
 */
export async function generateMigrationSQL(): Promise<string[]> {
  const result = await autoMigrate({ dryRun: true, verbose: false });
  return result.sqlStatements;
}
