"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
// Load and validate environment variables FIRST
const env_1 = require("./config/env");
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const auto_migrate_1 = require("./config/auto-migrate");
const websocket_1 = require("./websocket");
// Import all schemas to register tables
require("./schemas/auth.schema");
require("./schemas/database.schema");
require("./schemas/queryStats.schema");
async function startServer() {
    try {
        // Run auto-migration
        console.log('\n🔄 Running database auto-migration...');
        const migrationResult = await (0, auto_migrate_1.autoMigrate)({ verbose: true });
        if (!migrationResult.success) {
            console.error('❌ Migration failed with errors:', migrationResult.errors);
            process.exit(1);
        }
        console.log('✅ Database migration complete');
        // Create HTTP server and initialize WebSocket
        const httpServer = (0, http_1.createServer)(app_1.default);
        (0, websocket_1.initializeWebSocket)(httpServer);
        const { port } = env_1.config.server;
        const host = env_1.config.env.isProduction ? '0.0.0.0' : 'localhost';
        // Start server
        httpServer.listen(port, host, () => {
            console.log(`\n🚀 API running on http://${host}:${port}`);
            console.log(`🔌 WebSocket server running on ws://${host}:${port}`);
            console.log(`📚 Docs: http://${host}:${port}/docs`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map