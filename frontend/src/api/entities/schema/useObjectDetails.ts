import { useQuery } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import type { SchemaObjectType } from '../../models/SchemaDto';
import { isDemoModeActive } from '../../../context/TourContext';
import { getDemoTableDetails } from '../../../context/demoData';

export const OBJECT_DETAILS_QUERY_KEY = ['object-details'];

export function useTableDetails(databaseId: number | undefined, tableName: string | undefined) {
  const isDemo = isDemoModeActive();
  const demoData = tableName ? { table: getDemoTableDetails(tableName, databaseId) } : undefined;
  
  return useQuery({
    queryKey: [...OBJECT_DETAILS_QUERY_KEY, 'table', isDemo ? 'demo' : databaseId, tableName],
    queryFn: () => {
      if (isDemo && tableName) {
        const demoTable = getDemoTableDetails(tableName, databaseId);
        return Promise.resolve({ table: demoTable });
      }
      return SchemaService.getTableDetails(databaseId!, tableName!);
    },
    enabled: (isDemo && !!tableName) || (!!databaseId && !!tableName),
    staleTime: isDemo ? Infinity : 30000,
    refetchOnMount: !isDemo,
    placeholderData: isDemo && demoData ? demoData : undefined,
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
