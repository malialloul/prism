// src/modules/databases/databases.controller.ts
import { Request, Response, NextFunction } from 'express';
import {
  createDatabaseService,
  connectDatabaseService,
  getDatabasesService,
  getDatabaseService,
  updateDatabaseService,
  deleteDatabaseService,
  refreshDatabaseService,
  disconnectDatabaseService,
  reconnectDatabaseService,
  testConnectionService,
} from './databases.service';
import { getQueryStats } from './queryStats.service';
import { CreateDatabaseSchema, ConnectDatabaseSchema, UpdateDatabaseSchema, TestConnectionSchema } from '../../schemas/database.schema';
import { enforceCreateDatabaseLimit } from '../../services/limits.service';

/**
 * POST /databases/test
 * Test database connection
 */
export const testConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const body = TestConnectionSchema.parse(req.body);
    const result = await testConnectionService(body, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/create
 * Create a new hosted database
 */
export const createDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    
    // Check database limit before creating
    const limitResult = await enforceCreateDatabaseLimit(userId);
    
    const body = CreateDatabaseSchema.parse(req.body);
    const database = await createDatabaseService(userId, body);

    res.status(201).json({ 
      message: `Successfully created database ${database.name}`,
      database,
      warning: limitResult.warning,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases
 * Connect a new database
 */
export const connectDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    
    // Check database limit before connecting
    const limitResult = await enforceCreateDatabaseLimit(userId);
    
    const body = ConnectDatabaseSchema.parse(req.body);
    const database = await connectDatabaseService(userId, body);

    res.status(201).json({ 
      message: `Successfully connected to ${database.name}`,
      database,
      warning: limitResult.warning,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases
 * Get all user databases
 */
export const getDatabases = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databases = await getDatabasesService(userId);

    res.status(200).json({ databases });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id
 * Get a single database
 */
export const getDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const database = await getDatabaseService(userId, databaseId);

    res.status(200).json({ database });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /databases/:id
 * Update database connection
 */
export const updateDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const body = UpdateDatabaseSchema.parse(req.body);
    const database = await updateDatabaseService(userId, databaseId, body);

    res.status(200).json({ database });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /databases/:id
 * Delete database connection
 */
export const deleteDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    await deleteDatabaseService(userId, databaseId);

    res.status(200).json({ message: 'Database connection deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/refresh
 * Refresh database connection status
 */
export const refreshDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const database = await refreshDatabaseService(userId, databaseId);

    res.status(200).json({ database });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/disconnect
 * Disconnect database
 */
export const disconnectDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const database = await disconnectDatabaseService(userId, databaseId);

    res.status(200).json({ database, message: 'Database disconnected successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/connect
 * Reconnect database
 */
export const reconnectDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const database = await reconnectDatabaseService(userId, databaseId);

    res.status(200).json({ database, message: 'Database connected successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/stats/queries
 * Get query execution statistics
 */
export const getQueryStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = parseInt(req.user!.userId, 10);
    const databaseIdParam = req.query.databaseId as string | undefined;
    const databaseId = databaseIdParam ? parseInt(databaseIdParam, 10) : undefined;
    const stats = await getQueryStats(userId, databaseId);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
