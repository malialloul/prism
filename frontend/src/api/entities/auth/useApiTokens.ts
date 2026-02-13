import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiTokenService } from '../../services/ApiTokenService';
import { ApiError } from '../../core/ApiError';
import type { ApiTokensResponseDto } from '../../models/ApiTokensResponseDto';
import type { CreateApiTokenResponseDto } from '../../models/CreateApiTokenResponseDto';
import type { RevealApiTokenResponseDto } from '../../models/RevealApiTokenResponseDto';
import type { CreateApiTokenDto } from '../../models/ApiTokenDto';
import type { PasswordActionResponseDto } from '../../models/PasswordActionResponseDto';

export function useApiTokens() {
  return useQuery<ApiTokensResponseDto, ApiError>({
    queryKey: ['apiTokens'],
    queryFn: () => ApiTokenService.getApiTokens(),
  });
}

interface UseCreateApiTokenOptions {
  onSuccess?: (data: CreateApiTokenResponseDto) => void;
  onError?: (error: ApiError) => void;
}

export function useCreateApiToken(options: UseCreateApiTokenOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<CreateApiTokenResponseDto, ApiError, CreateApiTokenDto>({
    mutationFn: (data) => ApiTokenService.createApiToken(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['apiTokens'] });
      // Invalidate version limits to update usage counts
      queryClient.invalidateQueries({ queryKey: ['versionLimits'] });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    createToken: mutation.mutate,
    createTokenAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

interface UseRevealApiTokenOptions {
  onSuccess?: (data: RevealApiTokenResponseDto) => void;
  onError?: (error: ApiError) => void;
}

export function useRevealApiToken(options: UseRevealApiTokenOptions = {}) {
  const { onSuccess, onError } = options;

  const mutation = useMutation<RevealApiTokenResponseDto, ApiError, number>({
    mutationFn: (tokenId) => ApiTokenService.revealApiToken(tokenId),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    revealToken: mutation.mutate,
    revealTokenAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

interface UseRevokeApiTokenOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export function useRevokeApiToken(options: UseRevokeApiTokenOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<PasswordActionResponseDto, ApiError, number>({
    mutationFn: (tokenId) => ApiTokenService.revokeApiToken(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiTokens'] });
      // Invalidate version limits to update usage counts
      queryClient.invalidateQueries({ queryKey: ['versionLimits'] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    revokeToken: mutation.mutate,
    revokeTokenAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
