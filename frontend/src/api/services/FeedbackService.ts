import { httpClient } from '../httpClient';
import type { FeedbackDto, CreateFeedbackDto, UpdateFeedbackDto, FeedbackStats, FeedbackFilterParams, PaginatedFeedbackResponse } from '../models/FeedbackDto';

const BASE_URL = '/feedback';

export const FeedbackService = {
  /**
   * Submit new feedback
   */
  async create(data: CreateFeedbackDto): Promise<FeedbackDto> {
    const response = await httpClient.post<FeedbackDto>(BASE_URL, data);
    return response.data;
  },

  /**
   * Get current user's feedback submissions
   */
  async getMyFeedback(): Promise<{ feedback: FeedbackDto[] }> {
    const response = await httpClient.get<{ feedback: FeedbackDto[] }>(`${BASE_URL}/my`);
    return response.data;
  },

  /**
   * Check if current user is admin
   */
  async checkIsAdmin(): Promise<{ isAdmin: boolean }> {
    const response = await httpClient.get<{ isAdmin: boolean }>(`${BASE_URL}/check-admin`);
    return response.data;
  },

  /**
   * Get all feedback with pagination and filters (admin only)
   */
  async getAllFeedback(params: FeedbackFilterParams = {}): Promise<PaginatedFeedbackResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);
    if (params.type) searchParams.set('type', params.type);
    if (params.priority) searchParams.set('priority', params.priority);
    if (params.search) searchParams.set('search', params.search);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    const url = queryString ? `${BASE_URL}/all?${queryString}` : `${BASE_URL}/all`;
    
    const response = await httpClient.get<PaginatedFeedbackResponse>(url);
    return response.data;
  },

  /**
   * Get feedback statistics (admin only)
   */
  async getStats(): Promise<FeedbackStats> {
    const response = await httpClient.get<FeedbackStats>(`${BASE_URL}/stats`);
    return response.data;
  },

  /**
   * Update feedback status/notes (admin only)
   */
  async update(id: number, data: UpdateFeedbackDto): Promise<FeedbackDto> {
    const response = await httpClient.patch<FeedbackDto>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete feedback (admin only)
   */
  async delete(id: number): Promise<void> {
    await httpClient.delete(`${BASE_URL}/${id}`);
  },
};
