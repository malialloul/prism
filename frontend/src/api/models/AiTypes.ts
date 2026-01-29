// AI API types for frontend

export interface GenerateSqlRequestDto {
  databaseId: string;
  prompt: string;
}

export interface GeneratedSqlDto {
  sql: string;
  params: (string | number | boolean | null)[];
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  description: string;
  isValid: boolean;
  validationError?: string;
}

export interface SaveGeneratedApiDto {
  databaseId: string;
  name: string;
  description: string;
  sql: string;
  params: string[];
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface GeneratedApiDto {
  id: string;
  databaseId: string;
  name: string;
  slug: string;
  description: string;
  sql: string;
  params: string[];
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  createdAt: string;
  updatedAt: string;
}

export interface ExecuteGeneratedApiDto {
  params: Record<string, string | number | boolean | null>;
}

export interface ExecuteApiResultDto {
  result: unknown[];
  rowCount: number;
  sql: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sql?: string;
  params?: (string | number | boolean | null)[];
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  isValid?: boolean;
  validationError?: string;
  timestamp: Date;
}
