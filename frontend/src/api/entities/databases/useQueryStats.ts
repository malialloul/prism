import { useQuery } from '@tanstack/react-query';
import { DatabasesService, QueryStatsResponse } from '../../services/DatabasesService';

export const QUERY_STATS_KEY = ['queryStats'];

export function useQueryStats(databaseId?: number) {
  return useQuery<QueryStatsResponse>({
    queryKey: databaseId !== undefined ? [...QUERY_STATS_KEY, databaseId] : QUERY_STATS_KEY,
    queryFn: () => DatabasesService.getQueryStats(databaseId),
    refetchOnWindowFocus: true,
  });
}
