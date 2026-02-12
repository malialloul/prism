import { Router } from 'express';
import { submitContact, getContacts, updateStatus } from './contact.controller';

const router = Router();

// Public endpoints - accessible without authentication
router.post('/', submitContact);
router.get('/', getContacts);
router.patch('/:id/status', updateStatus);

export default router;
