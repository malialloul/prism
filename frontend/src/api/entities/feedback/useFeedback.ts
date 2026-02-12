import { useQuery } from '@tanstack/react-query';
import { FeedbackService } from '../../services/FeedbackService';
import type { FeedbackDto, FeedbackFilterParams, PaginatedFeedbackResponse } from '../../models/FeedbackDto';
import { isDemoModeActive } from '../../../context/TourContext';

export const FEEDBACK_QUERY_KEY = ['feedback'];
export const MY_FEEDBACK_QUERY_KEY = ['feedback', 'my'];
export const ALL_FEEDBACK_QUERY_KEY = ['feedback', 'all'];
export const FEEDBACK_STATS_QUERY_KEY = ['feedback', 'stats'];
export const FEEDBACK_ADMIN_CHECK_KEY = ['feedback', 'admin-check'];

// Demo mode mock data
const DEMO_MY_FEEDBACK: { feedback: FeedbackDto[] } = { feedback: [] };
const DEMO_IS_ADMIN: { isAdmin: boolean } = { isAdmin: false };
const DEMO_ALL_FEEDBACK: PaginatedFeedbackResponse = {
  feedback: [],
  pagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
};
const DEMO_FEEDBACK_STATS = {
  totalFeedback: 0,
  byStatus: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
  byType: { bug: 0, feature: 0, improvement: 0, question: 0 },
  byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
};

/**
 * Hook to get current user's feedback submissions
 */
export function useMyFeedback() {
  const isDemo = isDemoModeActive();
  
  return useQuery<{ feedback: FeedbackDto[] }>({
    queryKey: MY_FEEDBACK_QUERY_KEY,
    queryFn: () => {
      if (isDemo) return Promise.resolve(DEMO_MY_FEEDBACK);
      return FeedbackService.getMyFeedback();
    },
    staleTime: isDemo ? Infinity : 30000,
    placeholderData: isDemo ? DEMO_MY_FEEDBACK : undefined,
  });
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin() {
  const isDemo = isDemoModeActive();
  
  return useQuery<{ isAdmin: boolean }>({
    queryKey: FEEDBACK_ADMIN_CHECK_KEY,
    queryFn: () => {
      if (isDemo) return Promise.resolve(DEMO_IS_ADMIN);
      return FeedbackService.checkIsAdmin();
    },
    staleTime: isDemo ? Infinity : 60000,
    placeholderData: isDemo ? DEMO_IS_ADMIN : undefined,
  });
}

/**
 * Hook to get all feedback with pagination and filters (admin only)
 */
export function useAllFeedback(params: FeedbackFilterParams = {}, enabled = true) {
  const isDemo = isDemoModeActive();
  
  return useQuery<PaginatedFeedbackResponse>({
    queryKey: [...ALL_FEEDBACK_QUERY_KEY, params],
    queryFn: () => {
      if (isDemo) return Promise.resolve(DEMO_ALL_FEEDBACK);
      return FeedbackService.getAllFeedback(params);
    },
    enabled: isDemo || enabled,
    staleTime: isDemo ? Infinity : undefined,
    placeholderData: isDemo ? DEMO_ALL_FEEDBACK : undefined,
  });
}

/**
 * Hook to get feedback statistics (admin only)
 */
export function useFeedbackStats(enabled = true) {
  const isDemo = isDemoModeActive();
  
  return useQuery({
    queryKey: FEEDBACK_STATS_QUERY_KEY,
    queryFn: () => {
      if (isDemo) return Promise.resolve(DEMO_FEEDBACK_STATS);
      return FeedbackService.getStats();
    },
    enabled: isDemo || enabled,
    staleTime: isDemo ? Infinity : undefined,
    placeholderData: isDemo ? DEMO_FEEDBACK_STATS : undefined,
  });
}
