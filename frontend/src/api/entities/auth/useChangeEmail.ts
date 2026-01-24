import { useMutation } from '@tanstack/react-query';
import { AuthenticationService } from '../../services/AuthenticationService';
import { ApiError } from '../../core/ApiError';
import { hashPassword } from '../../../utils/crypto';
import { setAuthToken } from '../../httpClient';
import type { ChangeEmailDto } from '../../models/ChangeEmailDto';
import type { ChangeEmailResponseDto } from '../../models/ChangeEmailResponseDto';

interface UseChangeEmailReturn {
  changeEmail: (data: ChangeEmailDto) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: ApiError | null;
  reset: () => void;
}

export function useChangeEmail(): UseChangeEmailReturn {
  const mutation = useMutation<ChangeEmailResponseDto, ApiError, ChangeEmailDto>({
    mutationFn: async (data: ChangeEmailDto) => {
      // Hash password before sending
      const hashedPassword = await hashPassword(data.password);
      
      return AuthenticationService.postAuthChangeEmail({
        newEmail: data.newEmail,
        password: hashedPassword,
      });
    },
    onSuccess: (response) => {
      // Update the token with the new email
      if (response.data?.token) {
        setAuthToken(response.data.token, true);
      }
    },
  });

  return {
    changeEmail: (data: ChangeEmailDto) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: () => mutation.reset(),
  };
}
