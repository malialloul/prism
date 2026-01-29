// src/modules/ai/ai.controller.ts
import type { Request, Response } from 'express';
import {
  generateSqlService,
  saveGeneratedApiService,
  getGeneratedApisService,
  getGeneratedApiService,
  deleteGeneratedApiService,
  executeGeneratedApiService,
} from './ai.service';
import type {
  GenerateSqlRequestDto,
  SaveGeneratedApiDto,
  ExecuteGeneratedApiDto,
  GenerateSqlResponseDto,
  SaveGeneratedApiResponseDto,
  GetGeneratedApisResponseDto,
  GetGeneratedApiResponseDto,
  DeleteGeneratedApiResponseDto,
  ExecuteGeneratedApiResponseDto,
} from './ai.types';

/**
 * Generate SQL from natural language prompt
 * POST /ai/generate-sql
 */
export const generateSql = async (
  req: Request<object, object, GenerateSqlRequestDto>,
  res: Response<GenerateSqlResponseDto>
) => {
  const userId = req.user!.userId;
  const result = await generateSqlService(String(userId), req.body);

  res.json({
    status: 'success',
    message: result.isValid 
      ? 'SQL generated successfully' 
      : 'SQL generated but has validation issues',
    data: result,
  });
};

/**
 * Save generated SQL as an API endpoint
 * POST /ai/apis
 */
export const saveGeneratedApi = async (
  req: Request<object, object, SaveGeneratedApiDto>,
  res: Response<SaveGeneratedApiResponseDto>
) => {
  const userId = req.user!.userId;
  const result = await saveGeneratedApiService(String(userId), req.body);

  res.status(201).json({
    status: 'success',
    message: 'API saved successfully',
    data: result,
  });
};

/**
 * Get all generated APIs for a database
 * GET /ai/databases/:databaseId/apis
 */
export const getGeneratedApis = async (
  req: Request<{ databaseId: string }>,
  res: Response<GetGeneratedApisResponseDto>
) => {
  const userId = req.user!.userId;
  const { databaseId } = req.params;
  const apis = await getGeneratedApisService(String(userId), databaseId);

  res.json({
    status: 'success',
    message: 'Generated APIs retrieved successfully',
    data: { apis },
  });
};

/**
 * Get a single generated API by ID
 * GET /ai/apis/:apiId
 */
export const getGeneratedApi = async (
  req: Request<{ apiId: string }>,
  res: Response<GetGeneratedApiResponseDto>
) => {
  const userId = req.user!.userId;
  const { apiId } = req.params;
  const api = await getGeneratedApiService(String(userId), apiId);

  res.json({
    status: 'success',
    message: 'Generated API retrieved successfully',
    data: api,
  });
};

/**
 * Delete a generated API
 * DELETE /ai/apis/:apiId
 */
export const deleteGeneratedApi = async (
  req: Request<{ apiId: string }>,
  res: Response<DeleteGeneratedApiResponseDto>
) => {
  const userId = req.user!.userId;
  const { apiId } = req.params;
  await deleteGeneratedApiService(String(userId), apiId);

  res.json({
    status: 'success',
    message: 'Generated API deleted successfully',
    data: { message: 'API deleted successfully' },
  });
};

/**
 * Execute a generated API
 * POST /databases/:databaseId/ai-api/:apiSlug
 */
export const executeGeneratedApi = async (
  req: Request<{ databaseId: string; apiSlug: string }, object, ExecuteGeneratedApiDto>,
  res: Response<ExecuteGeneratedApiResponseDto>
) => {
  const userId = req.user!.userId;
  const { databaseId, apiSlug } = req.params;
  const result = await executeGeneratedApiService(
    String(userId),
    databaseId,
    apiSlug,
    req.body
  );

  res.json({
    status: 'success',
    message: 'API executed successfully',
    data: result,
  });
};
