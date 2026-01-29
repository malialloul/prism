import { httpClient } from '../httpClient';
import type {
  GenerateSqlRequestDto,
  GeneratedSqlDto,
  SaveGeneratedApiDto,
  GeneratedApiDto,
  ExecuteGeneratedApiDto,
  ExecuteApiResultDto,
} from '../models/AiTypes';

interface ApiResponse<T> {
  status: 'success' | 'error' | 'fail';
  message: string;
  data: T;
}

export const AiService = {
  /**
   * Generate SQL from natural language prompt using AI
   */
  generateSql: async (body: GenerateSqlRequestDto): Promise<GeneratedSqlDto> => {
    const response = await httpClient.post<ApiResponse<GeneratedSqlDto>>(
      '/ai/generate-sql',
      body
    );
    return response.data.data;
  },

  /**
   * Save a generated API endpoint
   */
  saveGeneratedApi: async (body: SaveGeneratedApiDto): Promise<GeneratedApiDto> => {
    const response = await httpClient.post<ApiResponse<GeneratedApiDto>>(
      '/ai/apis',
      body
    );
    return response.data.data;
  },

  /**
   * Get all generated APIs for a database
   */
  getGeneratedApis: async (databaseId: string): Promise<{ apis: GeneratedApiDto[] }> => {
    const response = await httpClient.get<ApiResponse<{ apis: GeneratedApiDto[] }>>(
      `/ai/databases/${databaseId}/apis`
    );
    return response.data.data;
  },

  /**
   * Get a single generated API
   */
  getGeneratedApi: async (apiId: string): Promise<GeneratedApiDto> => {
    const response = await httpClient.get<ApiResponse<GeneratedApiDto>>(
      `/ai/apis/${apiId}`
    );
    return response.data.data;
  },

  /**
   * Delete a generated API
   */
  deleteGeneratedApi: async (apiId: string): Promise<void> => {
    await httpClient.delete(`/ai/apis/${apiId}`);
  },

  /**
   * Execute a generated API
   */
  executeGeneratedApi: async (
    databaseId: string,
    apiSlug: string,
    body: ExecuteGeneratedApiDto
  ): Promise<ExecuteApiResultDto> => {
    const response = await httpClient.post<ApiResponse<ExecuteApiResultDto>>(
      `/databases/${databaseId}/ai-api/${apiSlug}`,
      body
    );
    return response.data.data;
  },
};
