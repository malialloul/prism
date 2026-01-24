import { useMutation } from '@tanstack/react-query';
import { TwoFactorAuthenticationService } from '../../services/TwoFactorAuthenticationService';
import { ApiError } from '../../core/ApiError';
import { hashPassword } from '../../../utils/crypto';
import type { Setup2FADto } from '../../models/Setup2FADto';
import type { Setup2FAResponseDto } from '../../models/Setup2FAResponseDto';

interface UseSetup2FAReturn {
  setup2FA: (data: Setup2FADto) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: ApiError | null;
  data: Setup2FAResponseDto | undefined;
  reset: () => void;
}

export function useSetup2FA(): UseSetup2FAReturn {
  const mutation = useMutation<Setup2FAResponseDto, ApiError, Setup2FADto>({
    mutationFn: async (data: Setup2FADto) => {
      const hashedPassword = await hashPassword(data.password);
      return TwoFactorAuthenticationService.postAuth2FaSetup({
        password: hashedPassword,
      });
    },
  });

  return {
    setup2FA: (data: Setup2FADto) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
