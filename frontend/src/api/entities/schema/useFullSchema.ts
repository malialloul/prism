import { useQuery } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import type { TableDetailsDto } from '../../models/SchemaDto';
import { isDemoModeActive } from '../../../context/TourContext';
import { getDemoFullSchema } from '../../../context/demoData';

export const FULL_SCHEMA_QUERY_KEY = ['full-schema'];

export function useFullSchema(databaseId: number | undefined) {
  const isDemo = isDemoModeActive();
  
  return useQuery<{ tables: TableDetailsDto[]; count: number }>({
    queryKey: [...FULL_SCHEMA_QUERY_KEY, isDemo ? 'demo' : databaseId],
    queryFn: () => {
      if (isDemo) {
        return Promise.resolve(getDemoFullSchema(databaseId));
      }
      return SchemaService.getFullSchema(databaseId!);
    },
    enabled: isDemo || !!databaseId,
    staleTime: isDemo ? Infinity : 30000,
    placeholderData: isDemo ? getDemoFullSchema(databaseId) : undefined,
  });
}
