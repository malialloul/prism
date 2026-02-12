import { useQuery } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import type { TableDetailsDto } from '../../models/SchemaDto';

export const FULL_SCHEMA_QUERY_KEY = ['full-schema'];

export function useFullSchema(databaseId: number | undefined) {
  return useQuery<{ tables: TableDetailsDto[]; count: number }>({
    queryKey: [...FULL_SCHEMA_QUERY_KEY, databaseId],
    queryFn: () => SchemaService.getFullSchema(databaseId!),
    enabled: !!databaseId,
    staleTime: 30000, // 30 seconds
  });
}
