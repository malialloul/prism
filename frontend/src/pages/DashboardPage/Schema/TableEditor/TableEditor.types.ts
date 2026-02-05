import type { ColumnDetailsDto } from '../../../../api/models/SchemaDto';

export interface TableEditorProps {
  open: boolean;
  onClose: () => void;
  databaseId: number;
  tableName: string;
  engine: 'postgres' | 'mysql';
  onDataChanged?: () => void;
}

export interface RowData {
  _rowId: string;
  _isNew?: boolean;
  _isModified?: boolean;
  _isDeleted?: boolean;
  _originalData?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface EditingCell {
  rowId: string;
  column: string;
}

export interface ColumnMenuAnchor {
  el: HTMLElement;
  column: ColumnDetailsDto;
}

export const PAGE_SIZES = [25, 50, 100, 200];
export const DEFAULT_PAGE_SIZE = 50;
