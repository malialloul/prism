import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SchemaService } from '../../services/SchemaService';
import { ApiError } from '../../core/ApiError';
import type { CreateTableDto, AddColumnDto, ModifyColumnDto } from '../../models/SchemaDto';
import { SCHEMA_OBJECTS_QUERY_KEY } from './useSchemaObjects';
import { OBJECT_DETAILS_QUERY_KEY } from './useObjectDetails';

interface UseTableMutationOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: ApiError) => void;
}

export function useCreateTable(databaseId: string, options: UseTableMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, CreateTableDto>({
    mutationFn: (tableData) => SchemaService.createTable(databaseId, tableData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [...SCHEMA_OBJECTS_QUERY_KEY, databaseId] });
      options.onSuccess?.(response.message);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}

export function useDropTable(databaseId: string, options: UseTableMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: (tableName) => SchemaService.dropTable(databaseId, tableName),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [...SCHEMA_OBJECTS_QUERY_KEY, databaseId] });
      options.onSuccess?.(response.message);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}

export function useAddColumn(databaseId: string, tableName: string, options: UseTableMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, AddColumnDto>({
    mutationFn: (column) => SchemaService.addColumn(databaseId, tableName, column),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [...OBJECT_DETAILS_QUERY_KEY, 'table', databaseId, tableName] });
      options.onSuccess?.(response.message);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}

export function useModifyColumn(databaseId: string, tableName: string, options: UseTableMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, { columnName: string; modifications: ModifyColumnDto }>({
    mutationFn: ({ columnName, modifications }) => SchemaService.modifyColumn(databaseId, tableName, columnName, modifications),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [...OBJECT_DETAILS_QUERY_KEY, 'table', databaseId, tableName] });
      options.onSuccess?.(response.message);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}

export function useDropColumn(databaseId: string, tableName: string, options: UseTableMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: (columnName) => SchemaService.dropColumn(databaseId, tableName, columnName),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [...OBJECT_DETAILS_QUERY_KEY, 'table', databaseId, tableName] });
      options.onSuccess?.(response.message);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
