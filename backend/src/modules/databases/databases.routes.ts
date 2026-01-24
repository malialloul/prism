// src/modules/databases/databases.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import {
  testConnection,
  createDatabase,
  connectDatabase,
  getDatabases,
  getDatabase,
  updateDatabase,
  deleteDatabase,
  refreshDatabase,
  disconnectDatabase,
  reconnectDatabase,
} from './databases.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Test connection (before saving)
router.post('/test', testConnection);

// Create new hosted database
router.post('/create', createDatabase);

// Connect new database
router.post('/', connectDatabase);

// Get all databases
router.get('/', getDatabases);

// Get single database
router.get('/:id', getDatabase);

// Update database
router.patch('/:id', updateDatabase);

// Delete database
router.delete('/:id', deleteDatabase);

// Refresh connection status
router.post('/:id/refresh', refreshDatabase);

// Disconnect database
router.post('/:id/disconnect', disconnectDatabase);

// Reconnect database
router.post('/:id/connect', reconnectDatabase);

export default router;
