import { useQuery } from '@tanstack/react-query';
import { DatabasesService, QueryStatsResponse } from '../../services/DatabasesService';
import { isDemoModeActive } from '../../../context/TourContext';
import { DEMO_QUERY_STATS } from '../../../context/demoData';

export const QUERY_STATS_KEY = ['queryStats'];

export function useQueryStats(databaseId?: number) {
  const isDemo = isDemoModeActive();
  
  return useQuery<QueryStatsResponse>({
    queryKey: databaseId !== undefined ? [...QUERY_STATS_KEY, databaseId] : QUERY_STATS_KEY,
    queryFn: () => {
      if (isDemo) {
        return Promise.resolve(DEMO_QUERY_STATS);
      }
      return DatabasesService.getQueryStats(databaseId);
    },
    staleTime: isDemo ? Infinity : 30000,
    placeholderData: isDemo ? DEMO_QUERY_STATS : undefined,
  });
}
