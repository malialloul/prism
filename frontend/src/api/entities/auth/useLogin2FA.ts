import { useMutation } from '@tanstack/react-query';
import { AuthenticationService } from '../../services/AuthenticationService';
import { ApiError } from '../../core/ApiError';
import type { Login2FADto } from '../../models/Login2FADto';
import type { TokenResponseDto } from '../../models/TokenResponseDto';

interface UseLogin2FAReturn {
  login2FA: (data: Login2FADto) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: ApiError | null;
  data: TokenResponseDto | undefined;
  reset: () => void;
}

export function useLogin2FA(): UseLogin2FAReturn {
  const mutation = useMutation<TokenResponseDto, ApiError, Login2FADto>({
    mutationFn: (data: Login2FADto) => AuthenticationService.postAuthLogin2Fa(data),
  });

  return {
    login2FA: (data: Login2FADto) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
