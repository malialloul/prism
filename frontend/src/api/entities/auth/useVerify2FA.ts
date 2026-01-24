import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TwoFactorAuthenticationService } from '../../services/TwoFactorAuthenticationService';
import { ApiError } from '../../core/ApiError';
import type { Verify2FADto } from '../../models/Verify2FADto';
import type { Verify2FAResponseDto } from '../../models/Verify2FAResponseDto';

interface UseVerify2FAReturn {
  verify2FA: (data: Verify2FADto) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: ApiError | null;
  data: Verify2FAResponseDto | undefined;
  reset: () => void;
}

export function useVerify2FA(): UseVerify2FAReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation<Verify2FAResponseDto, ApiError, Verify2FADto>({
    mutationFn: (data: Verify2FADto) => 
      TwoFactorAuthenticationService.postAuth2FaVerify(data),
    onSuccess: () => {
      // Invalidate 2FA status query to refresh the status
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
  });

  return {
    verify2FA: (data: Verify2FADto) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
