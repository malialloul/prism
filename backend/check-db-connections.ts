import { pool } from './src/config/db';

async function checkConnections() {
  try {
    const result = await pool.query(
      `SELECT id, user_id, name, engine, status FROM database_connections LIMIT 10;`
    );
    console.log('Database Connections:');
    console.table(result.rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkConnections();
