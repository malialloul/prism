export interface FeedbackDto {
  id: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'in-progress' | 'completed' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackDto {
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UpdateFeedbackDto {
  type?: 'bug' | 'feature' | 'improvement' | 'other';
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'reviewed' | 'in-progress' | 'completed' | 'rejected';
  adminNotes?: string;
}

export interface FeedbackFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'type' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedFeedbackResponse {
  feedback: FeedbackDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
