// src/modules/ai/ai.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import {
  generateSql,
  saveGeneratedApi,
  getGeneratedApis,
  getGeneratedApi,
  deleteGeneratedApi,
  executeGeneratedApi,
} from './ai.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Generate SQL from natural language
router.post('/generate-sql', generateSql);

// Save a generated API
router.post('/apis', saveGeneratedApi);

// Get all generated APIs for a database
router.get('/databases/:databaseId/apis', getGeneratedApis);

// Get a single generated API
router.get('/apis/:apiId', getGeneratedApi);

// Delete a generated API
router.delete('/apis/:apiId', deleteGeneratedApi);

// Execute a generated API (mounted on /databases route in app.ts)
router.post('/:databaseId/ai-api/:apiSlug', executeGeneratedApi);

export default router;
