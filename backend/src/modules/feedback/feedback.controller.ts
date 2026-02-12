import { Request, Response, NextFunction } from 'express';
import * as feedbackService from './feedback.service';
import type { CreateFeedbackDto, UpdateFeedbackDto } from './feedback.types';

export const createFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;
    const data: CreateFeedbackDto = req.body;

    if (!data.type || !data.title || !data.description) {
      res.status(400).json({ error: 'Type, title, and description are required' });
      return;
    }

    const feedback = await feedbackService.createFeedback(
      parseInt(user.userId),
      user.email,
      user.fullName || user.email,
      data
    );

    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

export const getMyFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;
    const feedback = await feedbackService.getUserFeedback(parseInt(user.userId));
    res.json({ feedback });
  } catch (error) {
    next(error);
  }
};

export const getAllFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!feedbackService.isAdmin(user.email)) {
      res.status(403).json({ error: 'Access denied. Admin only.' });
      return;
    }

    const {
      page = '1',
      limit = '10',
      status,
      type,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const result = await feedbackService.getAllFeedback({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as string | undefined,
      type: type as string | undefined,
      priority: priority as string | undefined,
      search: search as string | undefined,
      sortBy: sortBy as 'createdAt' | 'updatedAt' | 'status' | 'type' | 'priority',
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getFeedbackStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!feedbackService.isAdmin(user.email)) {
      res.status(403).json({ error: 'Access denied. Admin only.' });
      return;
    }

    const stats = await feedbackService.getFeedbackStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const updateFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;
    const id = parseInt(req.params.id as string);
    const data: UpdateFeedbackDto = req.body;

    // Check if admin or owner of feedback
    const existingFeedback = await feedbackService.getFeedbackById(id);
    if (!existingFeedback) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    const isOwner = existingFeedback.userId === parseInt(user.userId);
    const isAdminUser = feedbackService.isAdmin(user.email);

    if (!isAdminUser && !isOwner) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    // Non-admin users can only update title and description, not status
    if (!isAdminUser && (data.status || data.adminNotes)) {
      res.status(403).json({ error: 'Only admins can update status and notes.' });
      return;
    }

    const feedback = await feedbackService.updateFeedback(id, data);
    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

export const deleteFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;
    const id = parseInt(req.params.id as string);

    // Check if admin or owner of feedback
    const existingFeedback = await feedbackService.getFeedbackById(id);
    if (!existingFeedback) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    const isOwner = existingFeedback.userId === parseInt(user.userId);
    const isAdminUser = feedbackService.isAdmin(user.email);

    if (!isAdminUser && !isOwner) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const deleted = await feedbackService.deleteFeedback(id);
    if (!deleted) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const checkIsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;
    res.json({ isAdmin: feedbackService.isAdmin(user.email) });
  } catch (error) {
    next(error);
  }
};
