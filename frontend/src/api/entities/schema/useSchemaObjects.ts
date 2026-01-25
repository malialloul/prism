import { useQuery } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';

export const SCHEMA_OBJECTS_QUERY_KEY = ['schema-objects'];

export function useSchemaObjects(databaseId: string | undefined) {
  return useQuery({
    queryKey: [...SCHEMA_OBJECTS_QUERY_KEY, databaseId],
    queryFn: () => SchemaService.getSchemaObjects(databaseId!),
    enabled: !!databaseId,
    staleTime: 30000, // 30 seconds
  });
}
