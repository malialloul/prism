// src/server.ts
// Load and validate environment variables FIRST
import './config/env';

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

    // Start server
    httpServer.listen(4000, () => {
      console.log('\n🚀 API running on http://localhost:4000');
      console.log('🔌 WebSocket server running on ws://localhost:4000');
      console.log('📚 Docs: http://localhost:4000/docs');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
