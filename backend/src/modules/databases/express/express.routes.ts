// src/modules/databases/express/express.routes.ts

import { Router } from 'express';
import { authMiddleware, requirePermission } from '../../../middleware/auth';
import { generateExpressProjectController } from './express.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Generate Express.js project
router.get('/:id/generate-express', requirePermission('createApiInQueryBuilder'), generateExpressProjectController);

export default router;
