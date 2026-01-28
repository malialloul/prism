import { pool } from './src/config/db';

async function main() {
  // Drop tables with UUID types (will be recreated with INTEGER)
  console.log('Dropping tables with UUID columns...');
  
  await pool.query('DROP TABLE IF EXISTS query_execution_logs CASCADE');
  console.log('Dropped query_execution_logs');
  
  await pool.query('DROP TABLE IF EXISTS saved_queries CASCADE');
  console.log('Dropped saved_queries');
  
  await pool.query('DROP TABLE IF EXISTS database_connections CASCADE');
  console.log('Dropped database_connections');
  
  await pool.query('DROP TABLE IF EXISTS backup_codes CASCADE');
  console.log('Dropped backup_codes');
  
  await pool.query('DROP TABLE IF EXISTS password_reset_tokens CASCADE');
  console.log('Dropped password_reset_tokens');

  console.log('\\nDone! Restart the server to recreate tables with INTEGER IDs.');
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
