import { useQuery } from '@tanstack/react-query';
import { FeedbackService } from '../../services/FeedbackService';
import type { FeedbackDto, FeedbackFilterParams, PaginatedFeedbackResponse } from '../../models/FeedbackDto';

export const FEEDBACK_QUERY_KEY = ['feedback'];
export const MY_FEEDBACK_QUERY_KEY = ['feedback', 'my'];
export const ALL_FEEDBACK_QUERY_KEY = ['feedback', 'all'];
export const FEEDBACK_STATS_QUERY_KEY = ['feedback', 'stats'];
export const FEEDBACK_ADMIN_CHECK_KEY = ['feedback', 'admin-check'];

/**
 * Hook to get current user's feedback submissions
 */
export function useMyFeedback() {
  return useQuery<{ feedback: FeedbackDto[] }>({
    queryKey: MY_FEEDBACK_QUERY_KEY,
    queryFn: () => FeedbackService.getMyFeedback(),
    staleTime: 30000,
  });
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin() {
  return useQuery<{ isAdmin: boolean }>({
    queryKey: FEEDBACK_ADMIN_CHECK_KEY,
    queryFn: () => FeedbackService.checkIsAdmin(),
    staleTime: 60000, // Cache for 1 minute
  });
}

/**
 * Hook to get all feedback with pagination and filters (admin only)
 */
export function useAllFeedback(params: FeedbackFilterParams = {}, enabled = true) {
  return useQuery<PaginatedFeedbackResponse>({
    queryKey: [...ALL_FEEDBACK_QUERY_KEY, params],
    queryFn: () => FeedbackService.getAllFeedback(params),
    enabled,
  });
}

/**
 * Hook to get feedback statistics (admin only)
 */
export function useFeedbackStats(enabled = true) {
  return useQuery({
    queryKey: FEEDBACK_STATS_QUERY_KEY,
    queryFn: () => FeedbackService.getStats(),
    enabled,
  });
}
