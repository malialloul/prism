// src/modules/databases/schema/schema.routes.ts
import { Router } from 'express';
import { authMiddleware, requirePermission, requirePermissions } from '../../../middleware/auth';
import {
  getSchemaObjects,
  getFullSchema,
  getTableDetails,
  executeQuery,
  getTableData,
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
  exportSchema,
  importSql,
  generateSchemaDoc,
  generateSchemaExcel,
} from './schema.controller';

const router = Router();
const publicRouter = Router();

// PUBLIC routes (no authentication required) - exported separately
publicRouter.get('/public/:id/custom-api/:slugOrId', executePublicQuery);
publicRouter.post('/public/:id/custom-api/:slugOrId', executePublicQuery);

// All routes below require authentication
router.use(authMiddleware);

// Schema exploration - no special permission required (basic access)
router.get('/:id/schema', getSchemaObjects);
router.get('/:id/schema/full', getFullSchema);
router.get('/:id/schema/tables/:tableName', getTableDetails);

// Query execution - requires runQuery
router.post('/:id/query', requirePermission('runQuery'), executeQuery);

// Table data browsing - requires viewTableData (for Data tab only)
router.get('/:id/tables/:tableName/data', requirePermission('viewTableData'), getTableData);

// Saved queries / Custom APIs - no special permission to view list
router.get('/:id/queries', getSavedQueries);
router.post('/:id/queries', requirePermission('createApiInQueryBuilder'), saveQuery);
router.delete('/:id/queries/:queryId', requirePermission('createApiInQueryBuilder'), deleteSavedQuery);
router.patch('/:id/queries/:queryId/public', requirePermission('createApiInQueryBuilder'), toggleApiPublic);

// Execute saved query with parameters (Custom API endpoint by slug or ID)
// Requires tryOpenApi permission, plus the SQL validation checks viewTableData/editTableData based on the query
router.get('/:id/custom-api/:slugOrId', requirePermission('tryOpenApi'), executeSavedQuery);
router.post('/:id/custom-api/:slugOrId', requirePermission('tryOpenApi'), executeSavedQuery);

// Table management
router.post('/:id/tables', requirePermission('addColumn'), createTable);
router.delete('/:id/tables/:tableName', requirePermission('deleteTable'), dropTable);

// Column management
router.post('/:id/tables/:tableName/columns', requirePermission('addColumn'), addColumn);
router.patch('/:id/tables/:tableName/columns/:columnName', requirePermission('editColumn'), modifyColumn);
router.delete('/:id/tables/:tableName/columns/:columnName', requirePermission('deleteColumn'), dropColumn);

// Import/Export
router.get('/:id/export', requirePermission('runQuery'), exportSchema);
router.post('/:id/import', requirePermission('runQuery'), importSql);
router.get('/:id/schema/documentation', requirePermission('runQuery'), generateSchemaDoc);
router.get('/:id/schema/excel', requirePermission('runQuery'), generateSchemaExcel);

export const publicSchemaRoutes = publicRouter;
export default router;
