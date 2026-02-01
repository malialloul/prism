import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AccountSharingService } from '../../services/AccountSharingService';
import { ApiError } from '../../core/ApiError';
import { setAuthToken } from '../../httpClient';
import type { SharedLoginDto } from '../../models/SharedLoginDto';
import type { TokenResponseDto } from '../../models/TokenResponseDto';

interface UseSharedLoginOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useSharedLogin(options: UseSharedLoginOptions = {}) {
  const { redirectTo = '/dashboard', onSuccess, onError } = options;
  const navigate = useNavigate();

  const mutation = useMutation<TokenResponseDto, ApiError, SharedLoginDto>({
    mutationFn: (credentials) => AccountSharingService.sharedLogin(credentials),
    onSuccess: (response) => {
      if (response.data?.token) {
        setAuthToken(response.data.token);
        onSuccess?.();
        navigate(redirectTo);
      }
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    sharedLogin: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error?.message || '',
    reset: mutation.reset,
  };
}
