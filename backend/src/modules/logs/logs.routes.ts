// src/modules/logs/logs.routes.ts

import { Router } from 'express';
import { logErrorHandler } from './logs.controller';

const router = Router();

router.post('/error', logErrorHandler);

export default router;
