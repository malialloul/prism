import { useMutation } from '@tanstack/react-query';
import { AuthenticationService } from '../../services/AuthenticationService';
import { ApiError } from '../../core/ApiError';
import { hashPassword } from '../../../utils/crypto';
import type { ChangePasswordDto } from '../../models/ChangePasswordDto';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';

interface UseChangePasswordReturn {
  changePassword: (data: ChangePasswordDto) => void;
  isLoading: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useChangePassword(): UseChangePasswordReturn {
  const mutation = useMutation<PasswordActionResponseDto, ApiError, ChangePasswordDto>({
    mutationFn: async (data: ChangePasswordDto) => {
      // Hash both passwords before sending
      const [hashedCurrentPassword, hashedNewPassword] = await Promise.all([
        hashPassword(data.currentPassword),
        hashPassword(data.newPassword),
      ]);
      
      return AuthenticationService.postAuthChangePassword({
        currentPassword: hashedCurrentPassword,
        newPassword: hashedNewPassword,
      });
    },
  });

  return {
    changePassword: (data: ChangePasswordDto) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    reset: () => mutation.reset(),
  };
}
