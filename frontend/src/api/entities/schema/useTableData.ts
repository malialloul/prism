import { useQuery } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import type { QueryResultDto } from '../../models/SchemaDto';
import { isDemoModeActive } from '../../../context/TourContext';
import { getDemoTableData } from '../../../context/demoData';

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
  const isDemo = isDemoModeActive();
  const demoData = tableName ? getDemoTableData(tableName, databaseId) : undefined;

  return useQuery<QueryResultDto>({
    queryKey: [...TABLE_DATA_QUERY_KEY, isDemo ? 'demo' : databaseId, tableName, page, pageSize, sortColumn, sortDirection, search],
    queryFn: () => {
      if (isDemo && tableName) {
        return Promise.resolve(getDemoTableData(tableName, databaseId));
      }
      return SchemaService.getTableData(databaseId!, tableName!, {
        page,
        pageSize,
        sortColumn,
        sortDirection,
        search,
      });
    },
    enabled: (isDemo && !!tableName) || (enabled && !!databaseId && !!tableName),
    staleTime: isDemo ? Infinity : 30000,
    placeholderData: isDemo && demoData ? demoData : undefined,
  });
}
