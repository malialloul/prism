import { useMutation } from '@tanstack/react-query';
import { AccountService } from '../../services/AccountService';
import { ApiError } from '../../core/ApiError';
import { hashPassword } from '../../../utils/crypto';
import type { DeleteAccountDto } from '../../models/DeleteAccountDto';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';

interface UseDeleteAccountReturn {
  deleteAccount: (data: DeleteAccountDto) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: ApiError | null;
  reset: () => void;
}

export function useDeleteAccount(): UseDeleteAccountReturn {
  const mutation = useMutation<PasswordActionResponseDto, ApiError, DeleteAccountDto>({
    mutationFn: async (data: DeleteAccountDto) => {
      const hashedPassword = await hashPassword(data.password);
      return AccountService.postAuthAccountDelete({
        password: hashedPassword,
        confirmation: data.confirmation,
      });
    },
  });

  return {
    deleteAccount: (data: DeleteAccountDto) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
