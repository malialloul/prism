// src/modules/databases/crud/crud.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth';
import {
  listRecordsHandler,
  getRecordHandler,
  createRecordHandler,
  updateRecordHandler,
  patchRecordHandler,
  deleteRecordHandler,
  getTableRelationsHandler,
  getRelatedRecordsHandler,
} from './crud.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * Dynamic CRUD API Routes
 * 
 * Base URL: /databases/:id/api/:table
 * 
 * Supported operations:
 * - GET    /databases/:id/api/:table                    - List records (with pagination, filtering, sorting, search)
 * - GET    /databases/:id/api/:table/relations          - Get table relations
 * - GET    /databases/:id/api/:table/:recordId          - Get single record by ID
 * - GET    /databases/:id/api/:table/:recordId/:related - Get related records (nested route)
 * - POST   /databases/:id/api/:table                    - Create new record
 * - PUT    /databases/:id/api/:table/:recordId          - Full update record
 * - PATCH  /databases/:id/api/:table/:recordId          - Partial update record
 * - DELETE /databases/:id/api/:table/:recordId          - Delete record
 * 
 * Query Parameters for list endpoints:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 20, max: 100)
 * - offset: Skip N records (alternative to page)
 * - sortBy: Column to sort by
 * - sortOrder: 'asc' or 'desc' (default: 'asc')
 * - search: Text search across searchable columns
 * - searchFields: Columns to search in (comma-separated or array)
 * - [column]: Filter by column value (e.g., ?status=active&category=1)
 * 
 * Examples:
 * - GET /databases/1/api/users?page=1&limit=10&sortBy=created_at&sortOrder=desc
 * - GET /databases/1/api/products?search=laptop&category=electronics
 * - GET /databases/1/api/orders?status=pending&user_id=5
 * - GET /databases/1/api/users/5/orders - Get all orders for user 5
 */

// Get table relations - must be before :recordId to avoid conflict
router.get('/:id/api/:table/relations', getTableRelationsHandler);

// List records with pagination, filtering, sorting, search
router.get('/:id/api/:table', listRecordsHandler);

// Get single record by ID
router.get('/:id/api/:table/:recordId', getRecordHandler);

// Get related records (nested route)
router.get('/:id/api/:table/:recordId/:relatedTable', getRelatedRecordsHandler);

// Create new record
router.post('/:id/api/:table', createRecordHandler);

// Full update record
router.put('/:id/api/:table/:recordId', updateRecordHandler);

// Partial update record
router.patch('/:id/api/:table/:recordId', patchRecordHandler);

// Delete records by filters (no recordId required)
router.delete('/:id/api/:table', deleteRecordHandler);

export default router;
