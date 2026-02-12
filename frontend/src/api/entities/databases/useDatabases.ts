import { useQuery } from '@tanstack/react-query';
import { DatabasesService } from '../../services/DatabasesService';
import type { DatabaseDto } from '../../models/DatabaseDto';
import { isDemoModeActive } from '../../../context/TourContext';
import { DEMO_DATABASES } from '../../../context/demoData';

export const DATABASES_QUERY_KEY = ['databases'];

export function useDatabases() {
  const isDemo = isDemoModeActive();
  const demoData = { databases: DEMO_DATABASES };
  
  return useQuery<{ databases: DatabaseDto[] }>({
    queryKey: DATABASES_QUERY_KEY,
    queryFn: () => {
      if (isDemo) {
        return Promise.resolve(demoData);
      }
      return DatabasesService.getDatabases();
    },
    staleTime: isDemo ? Infinity : 30000,
    placeholderData: isDemo ? demoData : undefined,
  });
}
