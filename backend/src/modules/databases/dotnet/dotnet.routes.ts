// src/modules/databases/dotnet/dotnet.routes.ts

import { Router } from 'express';
import { authMiddleware, requirePermission } from '../../../middleware/auth';
import { generateDotNetProjectController } from './dotnet.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Generate .NET project
router.get('/:id/generate-dotnet', requirePermission('createApiInQueryBuilder'), generateDotNetProjectController);

export default router;
