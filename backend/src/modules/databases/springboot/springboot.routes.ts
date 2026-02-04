// src/modules/databases/springboot/springboot.routes.ts

import { Router } from 'express';
import { authMiddleware, requirePermission } from '../../../middleware/auth';
import { generateSpringBootProjectController } from './springboot.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Generate Spring Boot project
router.get('/:id/generate-spring-boot', requirePermission('createApiInQueryBuilder'), generateSpringBootProjectController);

export default router;
