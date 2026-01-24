import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TwoFactorAuthenticationService } from '../../services/TwoFactorAuthenticationService';
import { ApiError } from '../../core/ApiError';
import { hashPassword } from '../../../utils/crypto';
import type { Disable2FADto } from '../../models/Disable2FADto';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';

interface UseDisable2FAReturn {
  disable2FA: (data: Disable2FADto) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: ApiError | null;
  reset: () => void;
}

export function useDisable2FA(): UseDisable2FAReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation<PasswordActionResponseDto, ApiError, Disable2FADto>({
    mutationFn: async (data: Disable2FADto) => {
      const hashedPassword = await hashPassword(data.password);
      return TwoFactorAuthenticationService.postAuth2FaDisable({
        password: hashedPassword,
        code: data.code,
      });
    },
    onSuccess: () => {
      // Invalidate 2FA status query to refresh the status
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
  });

  return {
    disable2FA: (data: Disable2FADto) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
