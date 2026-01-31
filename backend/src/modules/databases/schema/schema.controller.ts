// src/modules/databases/schema/schema.controller.ts
import { Request, Response, NextFunction } from 'express';
import {
  getSchemaObjectsService,
  getTableDetailsService,
  getViewDetailsService,
  getProcedureDetailsService,
  getFunctionDetailsService,
  executeQueryService,
  getSavedQueriesService,
  saveQueryService,
  deleteQueryService,
  executeSavedQueryService,
  executePublicQueryService,
  toggleApiPublicService,
  createTableService,
  addColumnService,
  modifyColumnService,
  dropColumnService,
  dropTableService,
  createViewService,
  dropViewService,
  createFunctionService,
  dropFunctionService,
  createProcedureService,
  dropProcedureService,
} from './schema.service';

/**
 * GET /databases/:id/schema
 * Get all schema objects for a database
 */
export const getSchemaObjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const objects = await getSchemaObjectsService(userId, databaseId);

    res.status(200).json({ objects });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/schema/tables/:tableName
 * Get table details
 */
export const getTableDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const tableName = req.params.tableName as string;
    const table = await getTableDetailsService(userId, databaseId, tableName);

    res.status(200).json({ table });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/schema/views/:viewName
 * Get view details
 */
export const getViewDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const viewName = req.params.viewName as string;
    const view = await getViewDetailsService(userId, databaseId, viewName);

    res.status(200).json({ view });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/schema/procedures/:procedureName
 * Get procedure details
 */
export const getProcedureDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const procedureName = req.params.procedureName as string;
    const procedure = await getProcedureDetailsService(userId, databaseId, procedureName);

    res.status(200).json({ procedure });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/schema/functions/:functionName
 * Get function details
 */
export const getFunctionDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const functionName = req.params.functionName as string;
    const func = await getFunctionDetailsService(userId, databaseId, functionName);

    res.status(200).json({ function: func });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/query
 * Execute a SQL query
 */
export const executeQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const { sql } = req.body;

    if (!sql || typeof sql !== 'string') {
      res.status(400).json({ message: 'SQL query is required' });
      return;
    }

    const result = await executeQueryService(userId, databaseId, sql);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/queries
 * Get saved queries for a database
 */
export const getSavedQueries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const queries = await getSavedQueriesService(userId, databaseId);

    res.status(200).json({ queries });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/queries
 * Save a query
 */
export const saveQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const { name, sql, description, parameters, method, isPublic } = req.body;

    if (!name || !sql) {
      res.status(400).json({ message: 'Name and SQL are required' });
      return;
    }

    const query = await saveQueryService(
      userId, 
      databaseId, 
      name, 
      sql,
      description,
      parameters,
      method || 'GET',
      isPublic || false
    );

    res.status(201).json({ 
      message: 'API saved successfully',
      query 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /databases/:id/queries/:queryId
 * Delete a saved query
 */
export const deleteSavedQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const queryId = req.params.queryId as string;

    await deleteQueryService(userId, queryId);

    res.status(200).json({ message: 'Query deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET/POST /databases/:id/api/:slugOrId
 * Execute a saved query/API with parameters
 * Parameters can be passed via query string (GET) or body (POST)
 */
export const executeSavedQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const slugOrId = req.params.slugOrId as string;
    
    // Get parameters from query string (GET) or body (POST)
    const params = req.method === 'GET' ? req.query : req.body;
    
    const result = await executeSavedQueryService(userId, databaseId, slugOrId, params as Record<string, any>);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET/POST /public/databases/:id/api/:slugOrId
 * Execute a PUBLIC saved query/API without authentication
 */
export const executePublicQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const databaseId = req.params.id as string;
    const slugOrId = req.params.slugOrId as string;
    
    // Get parameters from query string (GET) or body (POST)
    const params = req.method === 'GET' ? req.query : req.body;
    
    const result = await executePublicQueryService(databaseId, slugOrId, params as Record<string, any>);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /databases/:id/queries/:queryId/public
 * Toggle API public/private status
 */
export const toggleApiPublic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const queryId = req.params.queryId as string;
    const { isPublic } = req.body;

    if (typeof isPublic !== 'boolean') {
      res.status(400).json({ message: 'isPublic must be a boolean' });
      return;
    }

    await toggleApiPublicService(userId, queryId, isPublic);

    res.status(200).json({ 
      message: isPublic ? 'API is now public' : 'API is now private',
      isPublic 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/tables
 * Create a new table
 */
export const createTable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const { name, columns } = req.body;

    if (!name || !columns || !Array.isArray(columns) || columns.length === 0) {
      res.status(400).json({ message: 'Table name and columns are required' });
      return;
    }

    await createTableService(userId, databaseId, { name, columns });

    res.status(201).json({ message: `Table "${name}" created successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/tables/:tableName/columns
 * Add a column to an existing table
 */
export const addColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const tableName = req.params.tableName as string;
    const column = req.body;

    if (!column.name || !column.type) {
      res.status(400).json({ message: 'Column name and type are required' });
      return;
    }

    await addColumnService(userId, databaseId, tableName, column);

    res.status(201).json({ message: `Column "${column.name}" added successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /databases/:id/tables/:tableName/columns/:columnName
 * Modify an existing column
 */
export const modifyColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const tableName = req.params.tableName as string;
    const columnName = req.params.columnName as string;
    const modifications = req.body;

    await modifyColumnService(userId, databaseId, tableName, { name: columnName, ...modifications });

    res.status(200).json({ message: `Column "${columnName}" modified successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /databases/:id/tables/:tableName/columns/:columnName
 * Drop a column from a table
 */
export const dropColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const tableName = req.params.tableName as string;
    const columnName = req.params.columnName as string;

    await dropColumnService(userId, databaseId, tableName, columnName);

    res.status(200).json({ message: `Column "${columnName}" dropped successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /databases/:id/tables/:tableName
 * Drop a table
 */
export const dropTable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const tableName = req.params.tableName as string;

    await dropTableService(userId, databaseId, tableName);

    res.status(200).json({ message: `Table "${tableName}" dropped successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/views
 * Create a new view
 */
export const createView = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const { name, definition } = req.body;

    if (!name || !definition) {
      res.status(400).json({ message: 'View name and definition are required' });
      return;
    }

    await createViewService(userId, databaseId, { name, definition });

    res.status(201).json({ message: `View "${name}" created successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /databases/:id/views/:viewName
 * Drop a view
 */
export const dropView = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const viewName = req.params.viewName as string;

    await dropViewService(userId, databaseId, viewName);

    res.status(200).json({ message: `View "${viewName}" dropped successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/functions
 * Create a new function
 */
export const createFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const { name, parameters, returnType, body, language } = req.body;

    if (!name || !returnType || !body) {
      res.status(400).json({ message: 'Function name, return type, and body are required' });
      return;
    }

    await createFunctionService(userId, databaseId, {
      name,
      parameters: parameters || [],
      returnType,
      body,
      language,
    });

    res.status(201).json({ message: `Function "${name}" created successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /databases/:id/functions/:functionName
 * Drop a function
 */
export const dropFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const functionName = req.params.functionName as string;

    await dropFunctionService(userId, databaseId, functionName);

    res.status(200).json({ message: `Function "${functionName}" dropped successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/procedures
 * Create a new procedure
 */
export const createProcedure = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const { name, parameters, body, language } = req.body;

    if (!name || !body) {
      res.status(400).json({ message: 'Procedure name and body are required' });
      return;
    }

    await createProcedureService(userId, databaseId, {
      name,
      parameters: parameters || [],
      body,
      language,
    });

    res.status(201).json({ message: `Procedure "${name}" created successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /databases/:id/procedures/:procedureName
 * Drop a procedure
 */
export const dropProcedure = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const procedureName = req.params.procedureName as string;

    await dropProcedureService(userId, databaseId, procedureName);

    res.status(200).json({ message: `Procedure "${procedureName}" dropped successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/schema/full
 * Get complete schema with all tables and their columns
 */
export const getFullSchema = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    
    // Get all schema objects first
    const objects = await getSchemaObjectsService(userId, databaseId);
    
    // Get detailed info for each table
    const tablesWithDetails = await Promise.all(
      objects
        .filter((obj: any) => obj.type === 'table' || obj.objectType === 'TABLE')
        .map(async (table: any) => {
          try {
            const details = await getTableDetailsService(userId, databaseId, table.name);
            return details;
          } catch (error) {
            // Return table with empty columns if details fail
            return {
              name: table.name,
              columns: [],
              type: 'table',
            };
          }
        })
    );

    res.status(200).json({ 
      tables: tablesWithDetails,
      count: tablesWithDetails.length 
    });
  } catch (error) {
    next(error);
  }
};
