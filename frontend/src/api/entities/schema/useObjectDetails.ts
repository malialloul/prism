import { useQuery } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import type { SchemaObjectType } from '../../models/SchemaDto';

export const OBJECT_DETAILS_QUERY_KEY = ['object-details'];

export function useTableDetails(databaseId: string | undefined, tableName: string | undefined) {
  return useQuery({
    queryKey: [...OBJECT_DETAILS_QUERY_KEY, 'table', databaseId, tableName],
    queryFn: () => SchemaService.getTableDetails(databaseId!, tableName!),
    enabled: !!databaseId && !!tableName,
    staleTime: 30000,
  });
}

export function useViewDetails(databaseId: string | undefined, viewName: string | undefined) {
  return useQuery({
    queryKey: [...OBJECT_DETAILS_QUERY_KEY, 'view', databaseId, viewName],
    queryFn: () => SchemaService.getViewDetails(databaseId!, viewName!),
    enabled: !!databaseId && !!viewName,
    staleTime: 30000,
  });
}

export function useProcedureDetails(databaseId: string | undefined, procedureName: string | undefined) {
  return useQuery({
    queryKey: [...OBJECT_DETAILS_QUERY_KEY, 'procedure', databaseId, procedureName],
    queryFn: () => SchemaService.getProcedureDetails(databaseId!, procedureName!),
    enabled: !!databaseId && !!procedureName,
    staleTime: 30000,
  });
}

export function useFunctionDetails(databaseId: string | undefined, functionName: string | undefined) {
  return useQuery({
    queryKey: [...OBJECT_DETAILS_QUERY_KEY, 'function', databaseId, functionName],
    queryFn: () => SchemaService.getFunctionDetails(databaseId!, functionName!),
    enabled: !!databaseId && !!functionName,
    staleTime: 30000,
  });
}

export function useObjectDetails(
  databaseId: string | undefined,
  objectName: string | undefined,
  objectType: SchemaObjectType | undefined
) {
  const tableQuery = useTableDetails(
    objectType === 'table' ? databaseId : undefined,
    objectType === 'table' ? objectName : undefined
  );
  const viewQuery = useViewDetails(
    objectType === 'view' ? databaseId : undefined,
    objectType === 'view' ? objectName : undefined
  );
  const procedureQuery = useProcedureDetails(
    objectType === 'procedure' ? databaseId : undefined,
    objectType === 'procedure' ? objectName : undefined
  );
  const functionQuery = useFunctionDetails(
    objectType === 'function' ? databaseId : undefined,
    objectType === 'function' ? objectName : undefined
  );

  switch (objectType) {
    case 'table':
      return { data: tableQuery.data?.table, isLoading: tableQuery.isLoading, error: tableQuery.error };
    case 'view':
      return { data: viewQuery.data?.view, isLoading: viewQuery.isLoading, error: viewQuery.error };
    case 'procedure':
      return { data: procedureQuery.data?.procedure, isLoading: procedureQuery.isLoading, error: procedureQuery.error };
    case 'function':
      return { data: functionQuery.data?.function, isLoading: functionQuery.isLoading, error: functionQuery.error };
    default:
      return { data: undefined, isLoading: false, error: null };
  }
}
