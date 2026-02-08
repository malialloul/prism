import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthenticationService } from '../../services/AuthenticationService';
import { ApiError } from '../../core/ApiError';
import { setAuthToken } from '../../httpClient';
import { toastService } from '../../../services';
import type { LoginDto } from '../../models/LoginDto';
import type { TokenResponseDto } from '../../models/TokenResponseDto';

interface TwoFactorRequired {
  tempToken: string;
  email: string;
}

interface UseSignInOptions {
  redirectTo?: string;
  on2FARequired?: (data: TwoFactorRequired) => void;
}

interface UseSignInReturn {
  signIn: (credentials: LoginDto, rememberMe?: boolean) => void;
  isLoading: boolean;
  error: ApiError | null;
  reset: () => void;
}

// Type guard to check if response requires 2FA
interface TwoFactorResponse {
  status: string;
  message: string;
  data?: {
    requires2FA: boolean;
    tempToken: string;
    email: string;
  };
}

function is2FARequired(response: TokenResponseDto | TwoFactorResponse): response is TwoFactorResponse {
  return 'data' in response && response.data !== undefined && 'requires2FA' in response.data && response.data.requires2FA === true;
}

export function useSignIn(options: UseSignInOptions = {}): UseSignInReturn {
  const { redirectTo = '/dashboard', on2FARequired } = options;
  const navigate = useNavigate();

  const mutation = useMutation<TokenResponseDto | TwoFactorResponse, ApiError, { credentials: LoginDto; rememberMe: boolean }>({
    mutationFn: ({ credentials }) =>
      // The API can return either TokenResponseDto or a 2FA required response
      AuthenticationService.postAuthLogin(credentials) as Promise<TokenResponseDto | TwoFactorResponse>,
    onSuccess: (response, { rememberMe }) => {
      // Check if 2FA is required
      if (is2FARequired(response)) {
        if (on2FARequired && response.data) {
          on2FARequired({
            tempToken: response.data.tempToken,
            email: response.data.email,
          });
        }
        return;
      }

      // Normal login success
      if (response.data && 'token' in response.data) {
        setAuthToken(response.data.token, rememberMe);
        navigate(redirectTo);
      }
    },
    onError: (error) => {
      toastService.error(error.body?.message || 'Login failed. Please check your credentials.');
    },
  });

  const signIn = (credentials: LoginDto, rememberMe: boolean = false): void => {
    mutation.mutate({ credentials, rememberMe });
  };

  return {
    signIn,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: () => {
      mutation.reset();
    },
  };
}
