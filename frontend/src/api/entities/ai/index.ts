import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AiService } from '../../services/AiService';
import type {
  GenerateSqlRequestDto,
  GeneratedSqlDto,
  SaveGeneratedApiDto,
  GeneratedApiDto,
  ExecuteGeneratedApiDto,
  ExecuteApiResultDto,
} from '../../models/AiTypes';

export const AI_APIS_QUERY_KEY = ['ai-apis'];

/**
 * Hook to generate SQL from natural language
 */
export function useGenerateSql() {
  return useMutation<GeneratedSqlDto, Error, GenerateSqlRequestDto>({
    mutationFn: (body) => AiService.generateSql(body),
  });
}

/**
 * Hook to save a generated API
 */
export function useSaveGeneratedApi() {
  const queryClient = useQueryClient();

  return useMutation<GeneratedApiDto, Error, SaveGeneratedApiDto>({
    mutationFn: (body) => AiService.saveGeneratedApi(body),
    onSuccess: (data) => {
      // Invalidate the generated APIs query for this database
      queryClient.invalidateQueries({ queryKey: [...AI_APIS_QUERY_KEY, data.databaseId] });
    },
  });
}

/**
 * Hook to get all generated APIs for a database
 */
export function useGeneratedApis(databaseId: string | undefined) {
  return useQuery<{ apis: GeneratedApiDto[] }>({
    queryKey: [...AI_APIS_QUERY_KEY, databaseId],
    queryFn: () => AiService.getGeneratedApis(databaseId!),
    enabled: !!databaseId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get a single generated API
 */
export function useGeneratedApi(apiId: string | undefined) {
  return useQuery<GeneratedApiDto>({
    queryKey: [...AI_APIS_QUERY_KEY, 'detail', apiId],
    queryFn: () => AiService.getGeneratedApi(apiId!),
    enabled: !!apiId,
  });
}

/**
 * Hook to delete a generated API
 */
export function useDeleteGeneratedApi(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (apiId) => AiService.deleteGeneratedApi(apiId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...AI_APIS_QUERY_KEY, databaseId] });
    },
  });
}

/**
 * Hook to execute a generated API
 */
export function useExecuteGeneratedApi() {
  return useMutation<
    ExecuteApiResultDto,
    Error,
    { databaseId: string; apiSlug: string; body: ExecuteGeneratedApiDto }
  >({
    mutationFn: ({ databaseId, apiSlug, body }) =>
      AiService.executeGeneratedApi(databaseId, apiSlug, body),
  });
}
