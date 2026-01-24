import { useMutation } from '@tanstack/react-query';
import { AccountService } from '../../services/AccountService';
import { ApiError } from '../../core/ApiError';
import { hashPassword } from '../../../utils/crypto';
import type { DeactivateAccountDto } from '../../models/DeactivateAccountDto';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';

interface UseDeactivateAccountReturn {
  deactivateAccount: (data: DeactivateAccountDto) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: ApiError | null;
  reset: () => void;
}

export function useDeactivateAccount(): UseDeactivateAccountReturn {
  const mutation = useMutation<PasswordActionResponseDto, ApiError, DeactivateAccountDto>({
    mutationFn: async (data: DeactivateAccountDto) => {
      const hashedPassword = await hashPassword(data.password);
      return AccountService.postAuthAccountDeactivate({
        password: hashedPassword,
      });
    },
  });

  return {
    deactivateAccount: (data: DeactivateAccountDto) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
