import { useQuery } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import type { QueryResultDto } from '../../models/SchemaDto';

export const TABLE_DATA_QUERY_KEY = ['tableData'];

interface UseTableDataOptions {
  page?: number;
  pageSize?: number;
  sortColumn?: string;
  sortDirection?: 'ASC' | 'DESC';
  search?: string;
  enabled?: boolean;
}

export function useTableData(
  databaseId: number | undefined,
  tableName: string | undefined,
  options: UseTableDataOptions = {}
) {
  const { page = 0, pageSize = 50, sortColumn, sortDirection, search, enabled = true } = options;

  return useQuery<QueryResultDto>({
    queryKey: [...TABLE_DATA_QUERY_KEY, databaseId, tableName, page, pageSize, sortColumn, sortDirection, search],
    queryFn: () =>
      SchemaService.getTableData(databaseId!, tableName!, {
        page,
        pageSize,
        sortColumn,
        sortDirection,
        search,
      }),
    enabled: enabled && !!databaseId && !!tableName,
    staleTime: 30000, // 30 seconds
  });
}
