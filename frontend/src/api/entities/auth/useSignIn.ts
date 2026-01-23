import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthenticationService } from '../../services/AuthenticationService';
import { ApiError } from '../../core/ApiError';
import { setAuthToken } from '../../httpClient';
import type { LoginDto } from '../../models/LoginDto';
import type { TokenResponseDto } from '../../models/TokenResponseDto';

interface UseSignInOptions {
  redirectTo?: string;
}

interface UseSignInReturn {
  signIn: (credentials: LoginDto, rememberMe?: boolean) => void;
  isLoading: boolean;
  reset: () => void;
}

export function useSignIn(options: UseSignInOptions = {}): UseSignInReturn {
  const { redirectTo = '/' } = options;
  const navigate = useNavigate();

  const mutation = useMutation<TokenResponseDto, ApiError, { credentials: LoginDto; rememberMe: boolean }>({
    mutationFn: ({ credentials }) =>
      AuthenticationService.postAuthLogin(credentials),
    onSuccess: (response, { rememberMe }) => {
      if (response.data?.token) {
        setAuthToken(response.data.token, rememberMe);
      }
      navigate(redirectTo);
    },
  });

  const signIn = (credentials: LoginDto, rememberMe: boolean = false): void => {
    mutation.mutate({ credentials, rememberMe });
  };

  return {
    signIn,
    isLoading: mutation.isPending,
    reset: () => {
      mutation.reset();
    },
  };
}
