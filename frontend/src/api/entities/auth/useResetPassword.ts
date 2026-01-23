import { useMutation } from '@tanstack/react-query';
import { AuthenticationService } from '../../services/AuthenticationService';
import { ApiError } from '../../core/ApiError';
import { hashPassword } from '../../../utils/crypto';
import type { ResetPasswordDto } from '../../models/ResetPasswordDto';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';

interface UseResetPasswordReturn {
  resetPassword: (data: ResetPasswordDto) => void;
  isLoading: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useResetPassword(): UseResetPasswordReturn {
  const mutation = useMutation<PasswordActionResponseDto, ApiError, ResetPasswordDto>({
    mutationFn: async (data: ResetPasswordDto) => {
      // Hash the password before sending
      const hashedPassword = await hashPassword(data.newPassword);
      return AuthenticationService.postAuthResetPassword({
        email: data.email,
        code: data.code,
        newPassword: hashedPassword,
      });
    },
  });

  return {
    resetPassword: (data: ResetPasswordDto) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    reset: () => mutation.reset(),
  };
}
