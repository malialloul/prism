// src/modules/databases/databases.routes.ts
import { Router } from 'express';
import { authMiddleware, requirePermission } from '../../middleware/auth';
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
  getQueryStatistics,
} from './databases.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Query statistics - MUST be before /:id routes to avoid conflict
router.get('/stats/queries', getQueryStatistics);

// Test connection (before saving)
router.post('/test', requirePermission('connectDatabase'), testConnection);

// Create new hosted database
router.post('/create', requirePermission('createDatabase'), createDatabase);

// Connect new database
router.post('/', requirePermission('connectDatabase'), connectDatabase);

// Get all databases - no special permission required (basic access)
router.get('/', getDatabases);

// Get single database
router.get('/:id', getDatabase);

// Update database - requires connectDatabase permission
router.patch('/:id', requirePermission('connectDatabase'), updateDatabase);

// Delete database
router.delete('/:id', requirePermission('createDatabase'), deleteDatabase);

// Refresh connection status - no special permission required
router.post('/:id/refresh', refreshDatabase);

// Disconnect database
router.post('/:id/disconnect', requirePermission('connectDatabase'), disconnectDatabase);

// Reconnect database
router.post('/:id/connect', requirePermission('connectDatabase'), reconnectDatabase);

export default router;
