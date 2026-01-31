import { useQuery } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';

export const FULL_SCHEMA_QUERY_KEY = ['full-schema'];

export interface TableWithColumns {
  name: string;
  columns: Array<{ name: string; type: string }>;
  type?: string;
}

export function useFullSchema(databaseId: number | undefined) {
  return useQuery({
    queryKey: [...FULL_SCHEMA_QUERY_KEY, databaseId],
    queryFn: () => SchemaService.getFullSchema(databaseId!),
    enabled: !!databaseId,
    staleTime: 30000, // 30 seconds
  });
}
