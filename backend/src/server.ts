// src/server.ts
// Load and validate environment variables FIRST
import './config/env';

import app from './app';
import { autoMigrate } from './config/auto-migrate';

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

    // Start server
    app.listen(4000, () => {
      console.log('\n🚀 API running on http://localhost:4000');
      console.log('📚 Docs: http://localhost:4000/docs');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
