import type {
  SchemaObjectDto,
  TableDetailsDto,
  QueryResultDto,
  SavedQueryDto,
  CreateTableDto,
  AddColumnDto,
  ModifyColumnDto,
} from '../models/SchemaDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { getAuthToken } from '../httpClient';

export class SchemaService {
  /**
   * Get all schema objects for a database
   * @param databaseId Database ID
   * @returns SchemaObjectDto[] List of schema objects
   * @throws ApiError
   */
  public static getSchemaObjects(
    databaseId: number
  ): CancelablePromise<{ objects: SchemaObjectDto[] }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/databases/${databaseId}/schema`,
      errors: {
        401: 'Unauthorized',
        404: 'Database not found',
      },
    });
  }

  /**
   * GET /databases/{databaseId}/schema/full
   * Get complete schema with all tables and their full details (columns, constraints, indexes)
   */
  public static getFullSchema(
    databaseId: number
  ): CancelablePromise<{ tables: TableDetailsDto[]; count: number }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/databases/${databaseId}/schema/full`,
      errors: {
        401: 'Unauthorized',
        404: 'Database not found',
      },
    });
  }

  /**
   * Get table details
   * @param databaseId Database ID
   * @param tableName Table name
   * @returns TableDetailsDto Table details
   * @throws ApiError
   */
  public static getTableDetails(
    databaseId: number,
    tableName: string
  ): CancelablePromise<{ table: TableDetailsDto }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/databases/${databaseId}/schema/tables/${tableName}`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Execute a SQL query
   * @param databaseId Database ID
   * @param sql SQL query string
   * @param options Pagination options
   * @returns QueryResultDto Query result
   * @throws ApiError
   */
  public static executeQuery(
    databaseId: number,
    sql: string,
    options?: {
      page?: number;
      pageSize?: number;
    }
  ): CancelablePromise<QueryResultDto> {
    const queryParams = new URLSearchParams();
    if (options?.page !== undefined) {
      queryParams.set('page', String(options.page));
    }
    if (options?.pageSize !== undefined) {
      queryParams.set('pageSize', String(options.pageSize));
    }
    const queryString = queryParams.toString();
    const url = `/databases/${databaseId}/query${queryString ? `?${queryString}` : ''}`;

    return __request(OpenAPI, {
      method: 'POST',
      url,
      body: { sql },
      mediaType: 'application/json',
      errors: {
        400: 'Invalid query',
        401: 'Unauthorized',
        404: 'Database not found',
      },
    });
  }

  /**
   * Get table data (for Data tab - uses viewTableData permission)
   * @param databaseId Database ID
   * @param tableName Table name
   * @param options Pagination and sorting options
   * @returns QueryResultDto Table data
   * @throws ApiError
   */
  public static getTableData(
    databaseId: number,
    tableName: string,
    options?: {
      page?: number;
      pageSize?: number;
      sortColumn?: string;
      sortDirection?: 'ASC' | 'DESC';
      search?: string;
    }
  ): CancelablePromise<QueryResultDto> {
    const queryParams = new URLSearchParams();
    if (options?.page !== undefined) queryParams.append('page', String(options.page));
    if (options?.pageSize !== undefined) queryParams.append('pageSize', String(options.pageSize));
    if (options?.sortColumn) queryParams.append('sortColumn', options.sortColumn);
    if (options?.sortDirection) queryParams.append('sortDirection', options.sortDirection);
    if (options?.search) queryParams.append('search', options.search);
    
    const queryString = queryParams.toString();
    return __request(OpenAPI, {
      method: 'GET',
      url: `/databases/${databaseId}/tables/${encodeURIComponent(tableName)}/data${queryString ? `?${queryString}` : ''}`,
      errors: {
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not found',
      },
    });
  }

  /**
   * Get saved queries for a database
   * @param databaseId Database ID
   * @returns SavedQueryDto[] List of saved queries
   * @throws ApiError
   */
  public static getSavedQueries(
    databaseId: number
  ): CancelablePromise<{ queries: SavedQueryDto[] }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/databases/${databaseId}/queries`,
      errors: {
        401: 'Unauthorized',
        404: 'Database not found',
      },
    });
  }

  /**
   * Save a query/API
   * @param databaseId Database ID
   * @param name Query name
   * @param sql SQL query string
   * @param options Optional parameters for the API
   * @returns SavedQueryDto Saved query
   * @throws ApiError
   */
  public static saveQuery(
    databaseId: number,
    name: string,
    sql: string,
    options?: {
      description?: string;
      parameters?: Array<{
        name: string;
        columnName: string;
        columnType: string;
        operator: string;
        required?: boolean;
      }>;
      method?: string;
      isPublic?: boolean;
    }
  ): CancelablePromise<{ query: SavedQueryDto; message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: `/databases/${databaseId}/queries`,
      body: { 
        name, 
        sql,
        description: options?.description,
        parameters: options?.parameters,
        method: options?.method || 'GET',
        isPublic: options?.isPublic || false,
      },
      mediaType: 'application/json',
      errors: {
        400: 'Invalid request',
        401: 'Unauthorized',
        404: 'Database not found',
      },
    });
  }

  /**
   * Execute a saved query/API with parameters
   * @param databaseId Database ID
   * @param slugOrId Query/API slug or ID
   * @param params Parameters to pass to the query
   * @param method HTTP method (GET or POST)
   * @returns QueryResultDto Query result
   * @throws ApiError
   */
  public static executeSavedQuery(
    databaseId: number,
    slugOrId: string,
    params?: Record<string, any>,
    method: 'GET' | 'POST' = 'GET'
  ): CancelablePromise<QueryResultDto> {
    if (method === 'GET') {
      const queryString = params 
        ? '?' + new URLSearchParams(params as Record<string, string>).toString()
        : '';
      return __request(OpenAPI, {
        method: 'GET',
        url: `/databases/${databaseId}/custom-api/${slugOrId}${queryString}`,
        errors: {
          400: 'Invalid parameters',
          401: 'Unauthorized',
          404: 'API not found',
        },
      });
    } else {
      return __request(OpenAPI, {
        method: 'POST',
        url: `/databases/${databaseId}/custom-api/${slugOrId}`,
        body: params,
        mediaType: 'application/json',
        errors: {
          400: 'Invalid parameters',
          401: 'Unauthorized',
          404: 'API not found',
        },
      });
    }
  }

  /**
   * Delete a saved query
   * @param databaseId Database ID
   * @param queryId Query ID
   * @returns void
   * @throws ApiError
   */
  public static deleteSavedQuery(
    databaseId: number,
    queryId: string
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/databases/${databaseId}/queries/${queryId}`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Toggle API public/private status
   * @param databaseId Database ID
   * @param queryId Query ID
   * @param isPublic Whether the API should be public
   * @returns void
   * @throws ApiError
   */
  public static toggleApiPublic(
    databaseId: number,
    queryId: string,
    isPublic: boolean
  ): CancelablePromise<{ message: string; isPublic: boolean }> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: `/databases/${databaseId}/queries/${queryId}/public`,
      body: { isPublic },
      mediaType: 'application/json',
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Create a new table
   * @param databaseId Database ID
   * @param tableData Table definition
   * @returns void
   * @throws ApiError
   */
  public static createTable(
    databaseId: number,
    tableData: CreateTableDto
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: `/databases/${databaseId}/tables`,
      body: tableData,
      mediaType: 'application/json',
      errors: {
        400: 'Invalid table definition',
        401: 'Unauthorized',
        404: 'Database not found',
      },
    });
  }

  /**
   * Drop a table
   * @param databaseId Database ID
   * @param tableName Table name
   * @returns void
   * @throws ApiError
   */
  public static dropTable(
    databaseId: number,
    tableName: string
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/databases/${databaseId}/tables/${tableName}`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Add a column to a table
   * @param databaseId Database ID
   * @param tableName Table name
   * @param column Column definition
   * @returns void
   * @throws ApiError
   */
  public static addColumn(
    databaseId: number,
    tableName: string,
    column: AddColumnDto
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: `/databases/${databaseId}/tables/${tableName}/columns`,
      body: column,
      mediaType: 'application/json',
      errors: {
        400: 'Invalid column definition',
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Modify a column
   * @param databaseId Database ID
   * @param tableName Table name
   * @param columnName Column name
   * @param modifications Column modifications
   * @returns void
   * @throws ApiError
   */
  public static modifyColumn(
    databaseId: number,
    tableName: string,
    columnName: string,
    modifications: ModifyColumnDto
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: `/databases/${databaseId}/tables/${tableName}/columns/${columnName}`,
      body: modifications,
      mediaType: 'application/json',
      errors: {
        400: 'Invalid modifications',
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Drop a column
   * @param databaseId Database ID
   * @param tableName Table name
   * @param columnName Column name
   * @returns void
   * @throws ApiError
   */
  public static dropColumn(
    databaseId: number,
    tableName: string,
    columnName: string
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/databases/${databaseId}/tables/${tableName}/columns/${columnName}`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Export database schema (and optionally data) as SQL
   * @param databaseId Database ID
   * @param includeData Include table data in export
   * @param tables Optional list of specific tables to export
   * @returns SQL file content as blob
   * @throws ApiError
   */
  public static exportSchema(
    databaseId: number,
    includeData: boolean = false,
    tables?: string[]
  ): CancelablePromise<Blob> {
    const params = new URLSearchParams();
    if (includeData) params.append('includeData', 'true');
    if (tables && tables.length > 0) params.append('tables', tables.join(','));
    const queryString = params.toString();
    
    return __request(OpenAPI, {
      method: 'GET',
      url: `/databases/${databaseId}/export${queryString ? `?${queryString}` : ''}`,
      errors: {
        401: 'Unauthorized',
        404: 'Database not found',
      },
    });
  }

  /**
   * Import SQL file to database
   * @param databaseId Database ID
   * @param sql SQL content to import
   * @returns Import result
   * @throws ApiError
   */
  public static async importSql(
    databaseId: number,
    sql: string
  ): Promise<{ success: boolean; message: string; executedStatements: number; errors: string[] }> {
    const token = getAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minute timeout

    try {
      const response = await fetch(`${OpenAPI.BASE}/databases/${databaseId}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sql }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw { body: data };
      }

      return data.data || data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw { body: { message: 'Request timed out. The import may still be processing - try refreshing to check.' } };
      }
      throw error;
    }
  }

  /**
   * Generate Word document with schema documentation
   * @param databaseId Database ID
   * @returns Word document as blob
   * @throws ApiError
   */
  public static async generateSchemaDoc(
    databaseId: number
  ): Promise<Blob> {
    const token = getAuthToken();
    
    const response = await fetch(`${OpenAPI.BASE}/databases/${databaseId}/schema/documentation`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate document');
    }
    
    return response.blob();
  }

  /**
   * Generate Excel workbook with schema data - each table in a sheet
   * @param databaseId Database ID
   * @returns Excel file as blob
   * @throws ApiError
   */
  public static async generateSchemaExcel(
    databaseId: number
  ): Promise<Blob> {
    const token = getAuthToken();
    
    const response = await fetch(`${OpenAPI.BASE}/databases/${databaseId}/schema/excel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate Excel file');
    }
    
    return response.blob();
  }
}
