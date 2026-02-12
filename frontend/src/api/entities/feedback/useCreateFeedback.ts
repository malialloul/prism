import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedbackService } from '../../services/FeedbackService';
import type { CreateFeedbackDto, FeedbackDto } from '../../models/FeedbackDto';
import { MY_FEEDBACK_QUERY_KEY, ALL_FEEDBACK_QUERY_KEY, FEEDBACK_STATS_QUERY_KEY } from './useFeedback';

/**
 * Hook to create new feedback
 */
export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation<FeedbackDto, Error, CreateFeedbackDto>({
    mutationFn: (data) => FeedbackService.create(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: MY_FEEDBACK_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_FEEDBACK_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEEDBACK_STATS_QUERY_KEY });
    },
  });
}
