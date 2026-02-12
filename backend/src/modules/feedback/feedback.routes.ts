import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as feedbackController from './feedback.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// User routes
router.post('/', feedbackController.createFeedback);
router.get('/my', feedbackController.getMyFeedback);
router.get('/check-admin', feedbackController.checkIsAdmin);

// Admin routes
router.get('/all', feedbackController.getAllFeedback);
router.get('/stats', feedbackController.getFeedbackStats);
router.patch('/:id', feedbackController.updateFeedback);
router.delete('/:id', feedbackController.deleteFeedback);

export default router;
