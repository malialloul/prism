// src/modules/databases/schema/schema.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth';
import {
  getSchemaObjects,
  getTableDetails,
  getViewDetails,
  getProcedureDetails,
  getFunctionDetails,
  executeQuery,
  getSavedQueries,
  saveQuery,
  deleteSavedQuery,
  createTable,
  addColumn,
  modifyColumn,
  dropColumn,
  dropTable,
} from './schema.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Schema exploration
router.get('/:id/schema', getSchemaObjects);
router.get('/:id/schema/tables/:tableName', getTableDetails);
router.get('/:id/schema/views/:viewName', getViewDetails);
router.get('/:id/schema/procedures/:procedureName', getProcedureDetails);
router.get('/:id/schema/functions/:functionName', getFunctionDetails);

// Query execution
router.post('/:id/query', executeQuery);

// Saved queries
router.get('/:id/queries', getSavedQueries);
router.post('/:id/queries', saveQuery);
router.delete('/:id/queries/:queryId', deleteSavedQuery);

// Table management
router.post('/:id/tables', createTable);
router.delete('/:id/tables/:tableName', dropTable);

// Column management
router.post('/:id/tables/:tableName/columns', addColumn);
router.patch('/:id/tables/:tableName/columns/:columnName', modifyColumn);
router.delete('/:id/tables/:tableName/columns/:columnName', dropColumn);

export default router;
