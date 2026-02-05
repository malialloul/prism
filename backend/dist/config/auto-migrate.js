"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoMigrate = autoMigrate;
exports.generateMigrationSQL = generateMigrationSQL;
// src/config/auto-migrate.ts
const db_1 = require("./db");
const schema_registry_1 = require("./schema-registry");
/**
 * Generates CREATE TABLE SQL for a table definition
 */
function generateCreateTableSQL(table) {
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
function generateAlterTableSQL(tableName, existingColumns, tableColumns) {
    const alterStatements = [];
    for (const col of tableColumns) {
        if (!existingColumns.includes(col.name)) {
            let alterSQL = `ALTER TABLE "${tableName}" ADD COLUMN "${col.name}" ${col.type}`;
            if (!col.nullable && col.defaultValue) {
                alterSQL += ` NOT NULL DEFAULT ${col.defaultValue}`;
            }
            else if (!col.nullable) {
                // For NOT NULL without default, we need to add with a temporary default
                alterSQL += ` DEFAULT ${getTemporaryDefault(col.type)}`;
                alterStatements.push(alterSQL);
                // Then remove the default
                alterStatements.push(`ALTER TABLE "${tableName}" ALTER COLUMN "${col.name}" DROP DEFAULT`);
                alterStatements.push(`ALTER TABLE "${tableName}" ALTER COLUMN "${col.name}" SET NOT NULL`);
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
function getTemporaryDefault(type) {
    const upperType = type.toUpperCase();
    if (upperType.includes("VARCHAR") || upperType.includes("TEXT"))
        return "''";
    if (upperType.includes("INT") || upperType.includes("DOUBLE") || upperType.includes("NUMERIC"))
        return "0";
    if (upperType.includes("BOOLEAN"))
        return "false";
    if (upperType.includes("TIMESTAMP"))
        return "NOW()";
    if (upperType.includes("UUID"))
        return "gen_random_uuid()";
    if (upperType.includes("JSONB") || upperType.includes("JSON"))
        return "'{}'";
    return "NULL";
}
/**
 * Gets existing columns for a table
 */
async function getExistingColumns(tableName) {
    const result = await db_1.pool.query(`SELECT column_name FROM information_schema.columns 
     WHERE table_name = $1 AND table_schema = 'public'`, [tableName]);
    return result.rows.map((row) => row.column_name);
}
/**
 * Checks if a table exists
 */
async function tableExists(tableName) {
    const result = await db_1.pool.query(`SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = $1
    )`, [tableName]);
    return result.rows[0].exists;
}
/**
 * Automatically creates/updates database tables based on registered schemas
 */
/**
 * Sorts tables by their foreign key dependencies
 * Tables with no dependencies come first, then tables that depend on them
 */
function sortTablesByDependencies(tables) {
    const tableMap = new Map(tables.map((t) => [t.tableName, t]));
    const sorted = [];
    const visited = new Set();
    function visit(tableName, visiting = new Set()) {
        if (visited.has(tableName))
            return;
        if (visiting.has(tableName)) {
            console.warn(`[AutoMigrate] Circular dependency detected for table: ${tableName}`);
            return;
        }
        const table = tableMap.get(tableName);
        if (!table)
            return;
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
async function autoMigrate(options = {}) {
    const { verbose = false, dryRun = false, dropExisting = false } = options;
    const result = {
        success: true,
        tablesCreated: [],
        tablesModified: [],
        errors: [],
        sqlStatements: [],
    };
    let tables = (0, schema_registry_1.getRegisteredTables)();
    if (tables.length === 0) {
        if (verbose)
            console.log("[AutoMigrate] No tables registered");
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
                if (verbose)
                    console.log(`[AutoMigrate] Dropping table: ${table.tableName}`);
                await db_1.pool.query(dropSQL);
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
                    await db_1.pool.query(createSQL);
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
                    await db_1.pool.query(triggerSQL);
                }
                result.sqlStatements.push(triggerSQL);
            }
            else {
                // Table exists - check for missing columns
                const existingColumns = await getExistingColumns(table.tableName);
                const alterStatements = generateAlterTableSQL(table.tableName, existingColumns, table.columns);
                if (alterStatements.length > 0) {
                    if (verbose) {
                        console.log(`[AutoMigrate] Modifying table: ${table.tableName}`);
                    }
                    for (const sql of alterStatements) {
                        result.sqlStatements.push(sql);
                        if (verbose)
                            console.log(sql);
                        if (!dryRun) {
                            await db_1.pool.query(sql);
                        }
                    }
                    result.tablesModified.push(table.tableName);
                }
                else if (verbose) {
                    console.log(`[AutoMigrate] Table ${table.tableName} is up to date`);
                }
            }
        }
        catch (error) {
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
async function generateMigrationSQL() {
    const result = await autoMigrate({ dryRun: true, verbose: false });
    return result.sqlStatements;
}
//# sourceMappingURL=auto-migrate.js.map