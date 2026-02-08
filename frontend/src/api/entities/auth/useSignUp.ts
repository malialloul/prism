import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthenticationService } from '../../services/AuthenticationService';
import { ApiError } from '../../core/ApiError';
import { setAuthToken } from '../../httpClient';
import { toastService } from '../../../services';
import type { SignupDto } from '../../models/SignupDto';
import type { TokenResponseDto } from '../../models/TokenResponseDto';

interface UseSignUpOptions {
  redirectTo?: string;
}

interface UseSignUpReturn {
  signUp: (data: SignupDto) => void;
  isLoading: boolean;
  error: ApiError | null;
  reset: () => void;
}

export function useSignUp(options: UseSignUpOptions = {}): UseSignUpReturn {
  const { redirectTo = '/' } = options;
  const navigate = useNavigate();

  const mutation = useMutation<TokenResponseDto, ApiError, SignupDto>({
    mutationFn: (data: SignupDto) =>
      AuthenticationService.postAuthSignup(data),
    onSuccess: (response) => {
      // Auto-login after signup - set token and redirect to home
      if (response.data?.token) {
        setAuthToken(response.data.token, false);
      }
      navigate(redirectTo);
    },
    onError: (error) => {
      toastService.error(error.body?.message || 'Sign up failed. Please try again.');
    },
  });

  const signUp = (data: SignupDto): void => {
    mutation.mutate(data);
  };

  return {
    signUp,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: () => {
      mutation.reset();
    },
  };
}
