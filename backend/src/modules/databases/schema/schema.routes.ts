// src/modules/databases/schema/schema.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth';
import {
  getSchemaObjects,
  getFullSchema,
  getTableDetails,
  executeQuery,
  getSavedQueries,
  saveQuery,
  deleteSavedQuery,
  executeSavedQuery,
  executePublicQuery,
  toggleApiPublic,
  createTable,
  addColumn,
  modifyColumn,
  dropColumn,
  dropTable,
} from './schema.controller';

const router = Router();
const publicRouter = Router();

// PUBLIC routes (no authentication required) - exported separately
publicRouter.get('/public/:id/api/:slugOrId', executePublicQuery);
publicRouter.post('/public/:id/api/:slugOrId', executePublicQuery);

// All routes below require authentication
router.use(authMiddleware);

// Schema exploration
router.get('/:id/schema', getSchemaObjects);
router.get('/:id/schema/full', getFullSchema);
router.get('/:id/schema/tables/:tableName', getTableDetails);

// Query execution
router.post('/:id/query', executeQuery);

// Saved queries / Custom APIs
router.get('/:id/queries', getSavedQueries);
router.post('/:id/queries', saveQuery);
router.delete('/:id/queries/:queryId', deleteSavedQuery);
router.patch('/:id/queries/:queryId/public', toggleApiPublic);

// Execute saved query with parameters (Custom API endpoint by slug or ID)
router.get('/:id/api/:slugOrId', executeSavedQuery);
router.post('/:id/api/:slugOrId', executeSavedQuery);

// Table management
router.post('/:id/tables', createTable);
router.delete('/:id/tables/:tableName', dropTable);

// Column management
router.post('/:id/tables/:tableName/columns', addColumn);
router.patch('/:id/tables/:tableName/columns/:columnName', modifyColumn);
router.delete('/:id/tables/:tableName/columns/:columnName', dropColumn);

export const publicSchemaRoutes = publicRouter;
export default router;
