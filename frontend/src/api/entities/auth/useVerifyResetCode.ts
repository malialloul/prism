import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../core/ApiError';
import { httpClient } from '../../httpClient';
import type { VerifyResetCodeDto } from '../../models/VerifyResetCodeDto';
import type { VerifyCodeResponseDto } from '../../models/VerifyCodeResponseDto';

interface UseVerifyResetCodeReturn {
  verifyCode: (data: VerifyResetCodeDto) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isValid: boolean | undefined;
  reset: () => void;
}

export function useVerifyResetCode(): UseVerifyResetCodeReturn {
  const mutation = useMutation<VerifyCodeResponseDto, ApiError, VerifyResetCodeDto>({
    mutationFn: async (data: VerifyResetCodeDto) => {
      const response = await httpClient.post<VerifyCodeResponseDto>('/auth/verify-reset-code', data);
      return response.data;
    },
  });

  return {
    verifyCode: (data: VerifyResetCodeDto) => mutation.mutate(data),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isValid: mutation.data?.data?.valid,
    reset: () => mutation.reset(),
  };
}
