import { useQuery } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import type { SchemaObjectType } from '../../models/SchemaDto';

export const OBJECT_DETAILS_QUERY_KEY = ['object-details'];

export function useTableDetails(databaseId: number | undefined, tableName: string | undefined) {
  return useQuery({
    queryKey: [...OBJECT_DETAILS_QUERY_KEY, 'table', databaseId, tableName],
    queryFn: () => SchemaService.getTableDetails(databaseId!, tableName!),
    enabled: !!databaseId && !!tableName,
    staleTime: 30000,
    refetchOnMount: true,
  });
}

export function useObjectDetails(
  databaseId: number | undefined,
  objectName: string | undefined,
  objectType: SchemaObjectType | undefined
) {
  const tableQuery = useTableDetails(
    objectType === 'table' ? databaseId : undefined,
    objectType === 'table' ? objectName : undefined
  );

  switch (objectType) {
    case 'table':
      return { data: tableQuery.data?.table, isLoading: tableQuery.isLoading, error: tableQuery.error };
    default:
      return { data: undefined, isLoading: false, error: null };
  }
}
