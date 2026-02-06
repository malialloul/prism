import { useQuery } from '@tanstack/react-query';
import { DatabasesService } from '../../services/DatabasesService';
import type { DatabaseDto } from '../../models/DatabaseDto';

export const DATABASES_QUERY_KEY = ['databases'];

export function useDatabases() {
  return useQuery<{ databases: DatabaseDto[] }>({
    queryKey: DATABASES_QUERY_KEY,
    queryFn: () => DatabasesService.getDatabases(),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}
