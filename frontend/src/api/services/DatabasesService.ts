import type { ConnectDatabaseDto } from '../models/ConnectDatabaseDto';
import type { DatabaseDto } from '../models/DatabaseDto';
import type { TestConnectionDto } from '../models/TestConnectionDto';
import type { TestConnectionResultDto } from '../models/TestConnectionResultDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { CreateDatabaseDto } from '../models/CreateDatabaseDto';

export class DatabasesService {
  /**
   * Test database connection without saving
   * @param requestBody
   * @returns TestConnectionResultDto Test result
   * @throws ApiError
   */
  public static postDatabasesTest(
    requestBody: TestConnectionDto
  ): CancelablePromise<TestConnectionResultDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/databases/test',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Create a new hosted database
   * @param requestBody
   * @returns DatabaseDto Database created successfully
   * @throws ApiError
   */
  public static createDatabase(
    requestBody: CreateDatabaseDto
  ): CancelablePromise<{ database: DatabaseDto; message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/databases/create',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: 'Creation failed',
        401: 'Unauthorized',
      },
    });
  }

  /**
   * Connect a new database
   * @param requestBody
   * @returns DatabaseDto Database connected successfully
   * @throws ApiError
   */
  public static postDatabases(
    requestBody: ConnectDatabaseDto
  ): CancelablePromise<{ database: DatabaseDto; message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/databases',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: 'Connection failed',
        401: 'Unauthorized',
      },
    });
  }

  /**
   * Get all user databases
   * @returns DatabaseDto[] List of databases
   * @throws ApiError
   */
  public static getDatabases(): CancelablePromise<{ databases: DatabaseDto[] }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/databases',
      errors: {
        401: 'Unauthorized',
      },
    });
  }

  /**
   * Get single database
   * @param id Database ID
   * @returns DatabaseDto Database details
   * @throws ApiError
   */
  public static getDatabase(id: number): CancelablePromise<{ database: DatabaseDto }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/databases/${id}`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Delete database connection
   * @param id Database ID
   * @returns void
   * @throws ApiError
   */
  public static deleteDatabase(id: number): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/databases/${id}`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Refresh database connection status
   * @param id Database ID
   * @returns DatabaseDto Refreshed database
   * @throws ApiError
   */
  public static postDatabaseRefresh(id: number): CancelablePromise<{ database: DatabaseDto }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: `/databases/${id}/refresh`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Disconnect database
   * @param id Database ID
   * @returns DatabaseDto Disconnected database
   * @throws ApiError
   */
  public static postDatabaseDisconnect(id: number): CancelablePromise<{ database: DatabaseDto; message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: `/databases/${id}/disconnect`,
      errors: {
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Reconnect database
   * @param id Database ID
   * @returns DatabaseDto Connected database
   * @throws ApiError
   */
  public static postDatabaseConnect(id: number): CancelablePromise<{ database: DatabaseDto; message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: `/databases/${id}/connect`,
      errors: {
        400: 'Connection failed',
        401: 'Unauthorized',
        404: 'Not found',
      },
    });
  }

  /**
   * Get query execution statistics
   * @param databaseId Optional database ID to filter stats
   * @returns QueryStatsResponse Query statistics
   * @throws ApiError
   */
  public static getQueryStats(databaseId?: number): CancelablePromise<QueryStatsResponse> {
    const query = databaseId !== undefined ? `?databaseId=${databaseId}` : '';
    return __request(OpenAPI, {
      method: 'GET',
      url: `/databases/stats/queries${query}`,
      errors: {
        401: 'Unauthorized',
      },
    });
  }
}

export interface QueryStatsResponse {
  totalQueries: number;
  queriesLastHour: number;
  queriesLastDay: number;
  queriesByDatabase: Array<{
    databaseId: number;
    count: number;
  }>;
  avgExecutionTimeMs: number;
  successRate: number;
  hourlyData: Array<{
    hour: number;
    queries: number;
    errors: number;
    avgLatencyMs: number;
  }>;
}
