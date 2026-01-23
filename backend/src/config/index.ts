// src/config/index.ts
export { pool } from "./db";
export {
  registerTable,
  getRegisteredTables,
  getTableDefinition,
  clearRegistry,
  type TableColumn,
  type TableDefinition,
  type RegisterTableOptions,
} from "./schema-registry";
export {
  autoMigrate,
  generateMigrationSQL,
  type MigrationOptions,
  type MigrationResult,
} from "./auto-migrate";
