import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedbackService } from '../../services/FeedbackService';
import { MY_FEEDBACK_QUERY_KEY, ALL_FEEDBACK_QUERY_KEY, FEEDBACK_STATS_QUERY_KEY } from './useFeedback';

/**
 * Hook to delete feedback
 */
export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => FeedbackService.delete(id),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: MY_FEEDBACK_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_FEEDBACK_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEEDBACK_STATS_QUERY_KEY });
    },
  });
}
