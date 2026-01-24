"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMigrationSQL = exports.autoMigrate = exports.clearRegistry = exports.getTableDefinition = exports.getRegisteredTables = exports.registerTable = exports.pool = exports.config = void 0;
// src/config/index.ts
var env_1 = require("./env");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return env_1.config; } });
var db_1 = require("./db");
Object.defineProperty(exports, "pool", { enumerable: true, get: function () { return db_1.pool; } });
var schema_registry_1 = require("./schema-registry");
Object.defineProperty(exports, "registerTable", { enumerable: true, get: function () { return schema_registry_1.registerTable; } });
Object.defineProperty(exports, "getRegisteredTables", { enumerable: true, get: function () { return schema_registry_1.getRegisteredTables; } });
Object.defineProperty(exports, "getTableDefinition", { enumerable: true, get: function () { return schema_registry_1.getTableDefinition; } });
Object.defineProperty(exports, "clearRegistry", { enumerable: true, get: function () { return schema_registry_1.clearRegistry; } });
var auto_migrate_1 = require("./auto-migrate");
Object.defineProperty(exports, "autoMigrate", { enumerable: true, get: function () { return auto_migrate_1.autoMigrate; } });
Object.defineProperty(exports, "generateMigrationSQL", { enumerable: true, get: function () { return auto_migrate_1.generateMigrationSQL; } });
//# sourceMappingURL=index.js.map