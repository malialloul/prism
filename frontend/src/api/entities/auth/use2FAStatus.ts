import { useQuery } from '@tanstack/react-query';
import { TwoFactorAuthenticationService } from '../../services/TwoFactorAuthenticationService';
import { ApiError } from '../../core/ApiError';
import type { TwoFactorStatusResponseDto } from '../../models/TwoFactorStatusResponseDto';

interface Use2FAStatusReturn {
  data: TwoFactorStatusResponseDto | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
  enabled: boolean;
}

export function use2FAStatus(): Use2FAStatusReturn {
  const query = useQuery<TwoFactorStatusResponseDto, ApiError>({
    queryKey: ['2fa-status'],
    queryFn: () => TwoFactorAuthenticationService.getAuth2FaStatus(),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    enabled: query.data?.data?.enabled ?? false,
  };
}
