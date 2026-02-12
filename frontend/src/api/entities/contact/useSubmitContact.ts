import { useMutation } from '@tanstack/react-query';
import { ContactService } from '../../services/ContactService';
import { ApiError } from '../../core/ApiError';
import type { CreateContactDto, SubmitContactResponse } from '../../models/ContactDto';

interface UseSubmitContactOptions {
  onSuccess?: (result: SubmitContactResponse) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Hook to submit a contact message
 */
export function useSubmitContact(options: UseSubmitContactOptions = {}) {
  return useMutation<SubmitContactResponse, ApiError, CreateContactDto>({
    mutationFn: (data) => ContactService.submit(data),
    onSuccess: (result) => {
      options.onSuccess?.(result);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
