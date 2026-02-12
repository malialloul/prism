import { useQuery } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import { isDemoModeActive } from '../../../context/TourContext';
import { getDemoSchemaObjects } from '../../../context/demoData';

export const SCHEMA_OBJECTS_QUERY_KEY = ['schema-objects'];

export function useSchemaObjects(databaseId: number | undefined) {
  const isDemo = isDemoModeActive();
  const demoData = isDemo ? { objects: getDemoSchemaObjects(databaseId) } : undefined;
  
  return useQuery({
    queryKey: [...SCHEMA_OBJECTS_QUERY_KEY, isDemo ? 'demo' : databaseId],
    queryFn: () => {
      if (isDemo) {
        return Promise.resolve({ objects: getDemoSchemaObjects(databaseId) });
      }
      return SchemaService.getSchemaObjects(databaseId!);
    },
    enabled: isDemo || !!databaseId,
    staleTime: isDemo ? Infinity : 30000,
    placeholderData: demoData,
  });
}
