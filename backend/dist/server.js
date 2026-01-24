"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
// Load and validate environment variables FIRST
require("./config/env");
const app_1 = __importDefault(require("./app"));
const auto_migrate_1 = require("./config/auto-migrate");
// Import all schemas to register tables
require("./schemas/auth.schema");
async function startServer() {
    try {
        // Run auto-migration
        console.log('\n🔄 Running database auto-migration...');
        const migrationResult = await (0, auto_migrate_1.autoMigrate)({ verbose: true });
        if (!migrationResult.success) {
            console.error('❌ Migration failed with errors:', migrationResult.errors);
            process.exit(1);
        }
        console.log('✅ Database migration complete\n');
        // Start server
        app_1.default.listen(4000, () => {
            console.log('🚀 API running on http://localhost:4000');
            console.log('📚 Docs: http://localhost:4000/docs');
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map