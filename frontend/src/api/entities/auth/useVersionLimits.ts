import { useQuery } from '@tanstack/react-query';
import { VersionService, VersionLimitsResponseDto } from '../../services/VersionService';
import { ApiError } from '../../core/ApiError';
import { isDemoModeActive } from '../../../context/TourContext';

export function useVersionLimits() {
  const isDemo = isDemoModeActive();

  const demoData: VersionLimitsResponseDto = {
    status: 'success',
    message: 'Demo mode - version/limits placeholder',
    data: {
      version: 'v-demo',
      versionName: 'Demo Release',
      limits: {
        maxDatabases: 5,
        maxStorageMB: 1024,
        maxRequestsPerMonth: 10000,
        maxSavedApis: 50,
        maxSavedQueries: 50,
        maxTablesPerDatabase: 200,
        maxSharedAccounts: 5,
        maxApiTokens: 5,
      },
      usage: {
        databases: 2,
        storageMB: 50,
        requestsThisMonth: 1200,
        savedApis: 3,
        savedQueries: 5,
        tables: 13,
        sharedAccounts: 1,
        apiTokens: 0,
      },
    },
  };

  return useQuery<VersionLimitsResponseDto, ApiError>({
    queryKey: ['versionLimits'],
    queryFn: () => (isDemo ? Promise.resolve(demoData) : VersionService.getVersionLimits()),
    staleTime: isDemo ? Infinity : 5 * 60 * 1000, // keep long-lived in demo
    placeholderData: isDemo ? demoData : undefined,
  });
}
