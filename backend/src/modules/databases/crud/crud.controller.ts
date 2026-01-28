// src/modules/databases/crud/crud.controller.ts

import { Request, Response, NextFunction } from 'express';
import {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getTableRelations,
  getRelatedRecords,
} from './crud.service';
import type { ListQueryParams, FilterCondition, FilterOperator } from './crud.types';

// Define route param interfaces
interface TableParams {
  id: string;
  table: string;
}

interface RecordParams extends TableParams {
  recordId: string;
}

interface RelatedParams extends RecordParams {
  relatedTable: string;
}

// Valid filter operators
const VALID_OPERATORS: FilterOperator[] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'contains', 'startsWith', 'endsWith', 'isNull', 'isNotNull'];

/**
 * Parse a filter key to extract column name and operator
 * Supports formats: column (defaults to eq), column__operator
 */
const parseFilterKey = (key: string): { column: string; operator: FilterOperator } => {
  const parts = key.split('__');
  if (parts.length === 2 && VALID_OPERATORS.includes(parts[1] as FilterOperator)) {
    return { column: parts[0], operator: parts[1] as FilterOperator };
  }
  return { column: key, operator: 'eq' };
};

/**
 * Parse query parameters for list endpoints
 */
const parseListParams = (query: Request['query']): ListQueryParams => {
  const params: ListQueryParams = {};

  // Pagination
  if (query.page) params.page = parseInt(query.page as string, 10);
  if (query.limit) params.limit = parseInt(query.limit as string, 10);
  if (query.offset) params.offset = parseInt(query.offset as string, 10);

  // Sorting
  if (query.sortBy) params.sortBy = query.sortBy as string;
  if (query.sortOrder) params.sortOrder = query.sortOrder as 'asc' | 'desc';

  // Search
  if (query.search) params.search = query.search as string;
  if (query.searchFields) {
    params.searchFields = Array.isArray(query.searchFields)
      ? query.searchFields as string[]
      : [query.searchFields as string];
  }

  // Filters - parse advanced operators from query params
  // Supports: column=value (eq), column__gt=value, column__contains=value, etc.
  const reservedParams = ['page', 'limit', 'offset', 'sortBy', 'sortOrder', 'search', 'searchFields'];
  const filters: FilterCondition[] = [];
  
  for (const [key, value] of Object.entries(query)) {
    if (!reservedParams.includes(key) && value !== undefined) {
      const { column, operator } = parseFilterKey(key);
      
      // Handle isNull and isNotNull operators
      if (value === 'null' || operator === 'isNull') {
        filters.push({ column, operator: 'isNull' });
      } else if (operator === 'isNotNull') {
        filters.push({ column, operator: 'isNotNull' });
      } else if (operator === 'between') {
        // Between requires two comma-separated values: value1,value2
        const parts = (value as string).split(',');
        if (parts.length === 2) {
          const val1 = !isNaN(Number(parts[0])) ? Number(parts[0]) : parts[0];
          const val2 = !isNaN(Number(parts[1])) ? Number(parts[1]) : parts[1];
          filters.push({ column, operator: 'between', value: val1, value2: val2 });
        }
      } else {
        // Parse the value
        let parsedValue: string | number | boolean = value as string;
        if (value === 'true') {
          parsedValue = true;
        } else if (value === 'false') {
          parsedValue = false;
        } else if (!isNaN(Number(value)) && value !== '') {
          parsedValue = Number(value);
        }
        
        filters.push({ column, operator, value: parsedValue });
      }
    }
  }

  if (filters.length > 0) {
    params.filters = filters;
  }

  return params;
};

/**
 * GET /databases/:id/api/:table
 * List records with pagination, filtering, sorting, and search
 */
export const listRecordsHandler = async (
  req: Request<TableParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: databaseId, table: tableName } = req.params;
    const params = parseListParams(req.query);

    const result = await listRecords(userId, databaseId, tableName, params);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/api/:table/:recordId
 * Get a single record by ID
 */
export const getRecordHandler = async (
  req: Request<RecordParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: databaseId, table: tableName, recordId } = req.params;

    const record = await getRecord(userId, databaseId, tableName, recordId);

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /databases/:id/api/:table
 * Create a new record
 */
export const createRecordHandler = async (
  req: Request<TableParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: databaseId, table: tableName } = req.params;
    const data = req.body;

    const record = await createRecord(userId, databaseId, tableName, data);

    res.status(201).json({
      success: true,
      record,
      message: 'Record created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /databases/:id/api/:table/:recordId
 * Update a record (full replacement)
 */
export const updateRecordHandler = async (
  req: Request<RecordParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: databaseId, table: tableName, recordId } = req.params;
    const data = req.body;

    const record = await updateRecord(userId, databaseId, tableName, recordId, data);

    res.json({
      success: true,
      record,
      message: 'Record updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /databases/:id/api/:table/:recordId
 * Partially update a record
 */
export const patchRecordHandler = async (
  req: Request<RecordParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: databaseId, table: tableName, recordId } = req.params;
    const data = req.body;

    const record = await updateRecord(userId, databaseId, tableName, recordId, data);

    res.json({
      success: true,
      record,
      message: 'Record updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /databases/:id/api/:table
 * Delete records by filters
 */
export const deleteRecordHandler = async (
  req: Request<TableParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: databaseId, table: tableName } = req.params;
    const params = parseListParams(req.query);

    if (!params.filters || params.filters.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one filter is required to delete records',
      });
      return;
    }

    const deletedCount = await deleteRecord(userId, databaseId, tableName, params.filters);

    res.json({
      success: true,
      message: `${deletedCount} record(s) deleted successfully`,
      deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/api/:table/relations
 * Get table relations (foreign keys)
 */
export const getTableRelationsHandler = async (
  req: Request<TableParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: databaseId, table: tableName } = req.params;

    const relations = await getTableRelations(userId, databaseId, tableName);

    res.json({
      success: true,
      relations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /databases/:id/api/:table/:recordId/:relatedTable
 * Get related records (nested route)
 * Example: GET /databases/1/api/users/5/orders - Get orders for user 5
 */
export const getRelatedRecordsHandler = async (
  req: Request<RelatedParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: databaseId, table: parentTable, recordId: parentId, relatedTable } = req.params;
    const params = parseListParams(req.query);

    const result = await getRelatedRecords(
      userId,
      databaseId,
      parentTable,
      parentId,
      relatedTable,
      params
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
