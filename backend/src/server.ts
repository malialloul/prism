// src/server.ts
// Load and validate environment variables FIRST
import { config } from './config/env';

import { createServer } from 'http';
import app from './app';
import { autoMigrate } from './config/auto-migrate';
import { initializeWebSocket } from './websocket';

// Import all schemas to register tables
import './schemas/auth.schema';
import './schemas/database.schema';
import './schemas/queryStats.schema';

async function startServer() {
  try {
    // Run auto-migration
    console.log('\n🔄 Running database auto-migration...');
    const migrationResult = await autoMigrate({ verbose: true });

    if (!migrationResult.success) {
      console.error('❌ Migration failed with errors:', migrationResult.errors);
      process.exit(1);
    }

    console.log('✅ Database migration complete');

    // Create HTTP server and initialize WebSocket
    const httpServer = createServer(app);
    initializeWebSocket(httpServer);

    const { port } = config.server;
    const host = config.env.isProduction ? '0.0.0.0' : 'localhost';

    // Start server
    httpServer.listen(port, host, () => {
      console.log(`\n🚀 API running on http://${host}:${port}`);
      console.log(`🔌 WebSocket server running on ws://${host}:${port}`);
      console.log(`📚 Docs: http://${host}:${port}/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
