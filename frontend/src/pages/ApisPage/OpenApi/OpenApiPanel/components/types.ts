import type { SavedQueryDto } from '../../../../../api/models/SchemaDto';

export interface MethodColors {
  bg: string;
  text: string;
  border: string;
}

export interface OpenApiColors {
  primary: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  background: string;
  backgroundCard: string;
  backgroundSecondary: string;
  border: string;
}

export interface ApiTestResult {
  success?: boolean;
  error?: string;
  rows?: unknown[];
  rowCount?: number;
  executionTimeMs?: number;
}

export interface OpenApiHeaderProps {
  databaseName: string;
  apiCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterMethod: string | null;
  onFilterChange: (method: string | null) => void;
  darkMode: boolean;
}

export interface ApiCardItemProps {
  api: SavedQueryDto;
  isExpanded: boolean;
  onToggleExpanded: (apiId: string) => void;
  testParams: Record<string, string>;
  onParamChange: (paramName: string, value: string) => void;
  paramErrors: Record<string, boolean>;
  testResult?: ApiTestResult;
  testLoading: boolean;
  toggleLoading: boolean;
  copiedEndpoint: string | null;
  copiedSql: string | null;
  showSql: boolean;
  onCopyEndpoint: (endpoint: string, type: string) => void;
  onCopySql: (sql: string) => void;
  onTogglePublic: () => void;
  onToggleSql: () => void;
  onTestApi: () => void;
  onDeleteClick: () => void;
  getPublicEndpoint: (api: SavedQueryDto) => string;
  colors: OpenApiColors;
  darkMode: boolean;
}

export interface ApiEndpointsProps {
  api: SavedQueryDto;
  copiedEndpoint: string | null;
  onCopyEndpoint: (endpoint: string, type: string) => void;
  getPublicEndpoint: (api: SavedQueryDto) => string;
  colors: OpenApiColors;
}

export interface ApiParametersProps {
  api: SavedQueryDto;
  testParams: Record<string, string>;
  onParamChange: (paramName: string, value: string) => void;
  paramErrors: Record<string, boolean>;
  colors: OpenApiColors;
}

export interface ApiActionsProps {
  loading: boolean;
  showSql: boolean;
  onExecute: () => void;
  onToggleSql: () => void;
  onDelete: () => void;
  methodColors: MethodColors;
}

export interface ApiResponseProps {
  result: ApiTestResult;
  colors: OpenApiColors;
  darkMode: boolean;
}

export interface DeleteApiDialogProps {
  open: boolean;
  apiName: string;
  onClose: () => void;
  onConfirm: () => void;
  colors: OpenApiColors;
}

export interface OpenApiEmptyStateProps {
  colors: OpenApiColors;
}

export const getMethodColor = (method: string): MethodColors => {
  switch (method) {
    case 'GET': return { bg: '#61affe', text: '#fff', border: '#61affe' };
    case 'POST': return { bg: '#49cc90', text: '#fff', border: '#49cc90' };
    case 'PUT': return { bg: '#fca130', text: '#fff', border: '#fca130' };
    case 'DELETE': return { bg: '#f93e3e', text: '#fff', border: '#f93e3e' };
    case 'PATCH': return { bg: '#50e3c2', text: '#000', border: '#50e3c2' };
    default: return { bg: '#61affe', text: '#fff', border: '#61affe' };
  }
};
