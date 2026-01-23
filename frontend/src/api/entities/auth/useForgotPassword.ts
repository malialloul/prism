import { useMutation } from '@tanstack/react-query';
import { AuthenticationService } from '../../services/AuthenticationService';
import { ApiError } from '../../core/ApiError';
import type { ForgotPasswordDto } from '../../models/ForgotPasswordDto';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';

interface UseForgotPasswordReturn {
  requestReset: (data: ForgotPasswordDto) => void;
  isLoading: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const mutation = useMutation<PasswordActionResponseDto, ApiError, ForgotPasswordDto>({
    mutationFn: (data: ForgotPasswordDto) =>
      AuthenticationService.postAuthForgotPassword(data),
  });

  return {
    requestReset: (data: ForgotPasswordDto) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    reset: () => mutation.reset(),
  };
}
