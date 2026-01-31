import type {
  SchemaObjectDto,
  TableDetailsDto,
  ViewDetailsDto,
  ProcedureDetailsDto,
  FunctionDetailsDto,
  QueryResultDto,
  SavedQueryDto,
  CreateTableDto,
  AddColumnDto,
  ModifyColumnDto,
  CreateViewDto,
  CreateFunctionDto,
  CreateProcedureDto,
} from '../models/SchemaDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

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
   * Get complete schema with all tables and their columns
   */
  public static getFullSchema(
    databaseId: number
  ): CancelablePromise<{ tables: Array<{ name: string; columns: Array<{ name: string; type: string }> }>; count: number }> {
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
   * Get view details
   * @param databaseId Database ID
   * @param viewName View name
   * @returns ViewDetailsDto View details
   * @throws ApiError
   */
  public static getViewDetails(
    databaseId: number,
    viewName: string
  ): CancelablePromise<{ view: ViewDetailsDto }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/databases/${databaseId}/schema/views/${viewName}`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Get procedure details
   * @param databaseId Database ID
   * @param procedureName Procedure name
   * @returns ProcedureDetailsDto Procedure details
   * @throws ApiError
   */
  public static getProcedureDetails(
    databaseId: number,
    procedureName: string
  ): CancelablePromise<{ procedure: ProcedureDetailsDto }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/databases/${databaseId}/schema/procedures/${procedureName}`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Get function details
   * @param databaseId Database ID
   * @param functionName Function name
   * @returns FunctionDetailsDto Function details
   * @throws ApiError
   */
  public static getFunctionDetails(
    databaseId: number,
    functionName: string
  ): CancelablePromise<{ function: FunctionDetailsDto }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/databases/${databaseId}/schema/functions/${functionName}`,
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
   * @returns QueryResultDto Query result
   * @throws ApiError
   */
  public static executeQuery(
    databaseId: number,
    sql: string
  ): CancelablePromise<QueryResultDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: `/databases/${databaseId}/query`,
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
        url: `/databases/${databaseId}/api/${slugOrId}${queryString}`,
        errors: {
          400: 'Invalid parameters',
          401: 'Unauthorized',
          404: 'API not found',
        },
      });
    } else {
      return __request(OpenAPI, {
        method: 'POST',
        url: `/databases/${databaseId}/api/${slugOrId}`,
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
   * Create a new view
   * @param databaseId Database ID
   * @param viewData View definition
   * @returns void
   * @throws ApiError
   */
  public static createView(
    databaseId: number,
    viewData: CreateViewDto
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: `/databases/${databaseId}/views`,
      body: viewData,
      mediaType: 'application/json',
      errors: {
        400: 'Invalid view definition',
        401: 'Unauthorized',
        404: 'Database not found',
      },
    });
  }

  /**
   * Drop a view
   * @param databaseId Database ID
   * @param viewName View name
   * @returns void
   * @throws ApiError
   */
  public static dropView(
    databaseId: number,
    viewName: string
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/databases/${databaseId}/views/${viewName}`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Create a new function
   * @param databaseId Database ID
   * @param functionData Function definition
   * @returns void
   * @throws ApiError
   */
  public static createFunction(
    databaseId: number,
    functionData: CreateFunctionDto
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: `/databases/${databaseId}/functions`,
      body: functionData,
      mediaType: 'application/json',
      errors: {
        400: 'Invalid function definition',
        401: 'Unauthorized',
        404: 'Database not found',
      },
    });
  }

  /**
   * Drop a function
   * @param databaseId Database ID
   * @param functionName Function name
   * @returns void
   * @throws ApiError
   */
  public static dropFunction(
    databaseId: number,
    functionName: string
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/databases/${databaseId}/functions/${functionName}`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Create a new procedure
   * @param databaseId Database ID
   * @param procedureData Procedure definition
   * @returns void
   * @throws ApiError
   */
  public static createProcedure(
    databaseId: number,
    procedureData: CreateProcedureDto
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: `/databases/${databaseId}/procedures`,
      body: procedureData,
      mediaType: 'application/json',
      errors: {
        400: 'Invalid procedure definition',
        401: 'Unauthorized',
        404: 'Database not found',
      },
    });
  }

  /**
   * Drop a procedure
   * @param databaseId Database ID
   * @param procedureName Procedure name
   * @returns void
   * @throws ApiError
   */
  public static dropProcedure(
    databaseId: number,
    procedureName: string
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/databases/${databaseId}/procedures/${procedureName}`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }
}
