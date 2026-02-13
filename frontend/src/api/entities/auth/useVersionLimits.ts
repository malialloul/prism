import { useQuery } from '@tanstack/react-query';
import { VersionService, VersionLimitsResponseDto } from '../../services/VersionService';
import { ApiError } from '../../core/ApiError';

export function useVersionLimits() {
  return useQuery<VersionLimitsResponseDto, ApiError>({
    queryKey: ['versionLimits'],
    queryFn: () => VersionService.getVersionLimits(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
