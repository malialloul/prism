// src/modules/databases/schema/schema.controller.ts
import { Request, Response, NextFunction } from 'express';
import { enforceSaveApiLimit } from '../../../services/limits.service';
import {
  getSchemaObjectsService,
  getTableDetailsService,
  executeQueryService,
  getTableDataService,
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
  exportSchemaService,
  importSqlService,
  generateSchemaDocService,
  generateSchemaExcelService,
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

    // Parse pagination query params
    const page = req.query.page !== undefined ? parseInt(req.query.page as string, 10) : undefined;
    const pageSize = req.query.pageSize !== undefined ? Math.min(parseInt(req.query.pageSize as string, 10), 1000) : undefined;
    const paginationOptions = page !== undefined && pageSize !== undefined ? { page, pageSize } : undefined;

    // Pass permissions for shared access validation
    const result = await executeQueryService(
      userId,
      databaseId,
      sql,
      req.user!.permissions,
      req.user!.isSharedAccess,
      paginationOptions
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/tables/:tableName/data
 * Get table data (for Data tab - uses viewTableData permission)
 */
export const getTableData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const tableName = req.params.tableName as string;
    const page = parseInt(req.query.page as string) || 0;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 50, 1000);
    const sortColumn = req.query.sortColumn as string | undefined;
    const sortDirection = (req.query.sortDirection as 'ASC' | 'DESC') || 'ASC';
    const search = req.query.search as string | undefined;

    const result = await getTableDataService(userId, databaseId, tableName, {
      page,
      pageSize,
      sortColumn,
      sortDirection,
      search,
    });

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

    // Enforce API limit for current version
    const limitResult = await enforceSaveApiLimit(userId);

    // Pass permissions for shared access validation
    const query = await saveQueryService(
      userId, 
      databaseId, 
      name, 
      sql,
      description,
      parameters,
      method || 'GET',
      isPublic || false,
      req.user!.permissions,
      req.user!.isSharedAccess
    );

    res.status(201).json({ 
      message: 'Query saved successfully',
      query,
      warning: limitResult.warning,
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
    
    // Pass permissions for shared access validation
    const result = await executeSavedQueryService(
      userId,
      databaseId,
      slugOrId,
      params as Record<string, any>,
      req.user!.permissions,
      req.user!.isSharedAccess
    );

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

/**
 * GET /databases/:id/export
 * Export database schema (and optionally data) as SQL
 */
export const exportSchema = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const includeData = req.query.includeData === 'true';
    const tables = req.query.tables ? (req.query.tables as string).split(',') : undefined;

    const result = await exportSchemaService(userId, databaseId, { includeData, tables });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.status(200).send(result.sql);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/import
 * Import SQL file to database
 */
export const importSql = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;
    const { sql } = req.body;

    if (!sql || typeof sql !== 'string') {
      res.status(400).json({ message: 'SQL content is required' });
      return;
    }

    // Pass permissions for shared access validation
    const result = await importSqlService(
      userId,
      databaseId,
      sql,
      req.user!.permissions,
      req.user!.isSharedAccess
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/schema/documentation
 * Generate Word document with schema documentation
 */
export const generateSchemaDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;

    const { buffer, filename } = await generateSchemaDocService(userId, databaseId);

    // Ensure buffer is valid
    if (!buffer || buffer.length === 0) {
      res.status(500).json({ message: 'Failed to generate document' });
      return;
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', buffer.length);
    res.status(200).end(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/schema/excel
 * Generate Excel workbook with schema data - each table in a sheet
 */
export const generateSchemaExcel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const databaseId = req.params.id as string;

    const { buffer, filename } = await generateSchemaExcelService(userId, databaseId);

    if (!buffer || buffer.length === 0) {
      res.status(500).json({ message: 'Failed to generate Excel file' });
      return;
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', buffer.length);
    res.status(200).end(buffer);
  } catch (error) {
    next(error);
  }
};