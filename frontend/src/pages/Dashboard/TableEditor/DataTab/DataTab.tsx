import {
  CircularProgress,
  IconButton,
  Tooltip,
  Checkbox,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import UndoIcon from '@mui/icons-material/Undo';
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { RowData, EditingCell } from '../TableEditor.types';
import { formatDisplayValue } from '../TableEditor.utils';
import { Pagination } from '../../../../components';
import {
  DataTabContent,
  DataToolbar,
  ToolbarLeft,
  ToolbarRight,
  SearchContainer,
  SearchInput,
  SortContainer,
  SortSelect,
  ActionBar,
  ActionBarInfo,
  TableContainer,
  EditableTable,
  SortableHeader,
  EditableCell,
  EditInput,
  NewRowIndicator,
  ModifiedRowIndicator,
} from './DataTab.styles';

interface DataTabProps {
  // Data
  rows: RowData[];
  columns: string[];
  primaryKeyColumns: string[];
  selectedRows: Set<string>;
  visibleRows: RowData[];
  
  // Pagination
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
  startRow: number;
  endRow: number;
  
  // Search & Sort
  searchValue: string;
  sortColumn: string;
  sortDirection: 'ASC' | 'DESC';
  
  // Editing
  editingCell: EditingCell | null;
  editValue: string;
  pendingChanges: number;
  isLoading: boolean;
  
  // Handlers
  onSearchValueChange: (value: string) => void;
  onSortColumnChange: (value: string) => void;
  onSortDirectionToggle: () => void;
  onSortClick: (column: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onCellClick: (rowId: string, column: string, value: unknown) => void;
  onCellChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCellBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSelectRow: (rowId: string) => void;
  onSelectAll: () => void;
  onAddRow: () => void;
  onDeleteSelected: () => void;
  onRevertChanges: () => void;
  onRefresh: () => void;
}

export default function DataTab({
  rows,
  columns,
  primaryKeyColumns,
  selectedRows,
  visibleRows,
  page,
  pageSize,
  totalRows,
  totalPages,
  startRow,
  endRow,
  searchValue,
  sortColumn,
  sortDirection,
  editingCell,
  editValue,
  pendingChanges,
  isLoading,
  onSearchValueChange,
  onSortColumnChange,
  onSortDirectionToggle,
  onSortClick,
  onPageChange,
  onPageSizeChange,
  onCellClick,
  onCellChange,
  onCellBlur,
  onKeyDown,
  onSelectRow,
  onSelectAll,
  onAddRow,
  onDeleteSelected,
  onRevertChanges,
  onRefresh,
}: DataTabProps) {
  return (
    <DataTabContent>
      {/* Search and Sort Toolbar */}
      <DataToolbar>
        <ToolbarLeft>
          <SearchContainer>
            <SearchInput
              placeholder="Search all columns..."
              value={searchValue}
              onChange={(e) => onSearchValueChange(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </SearchContainer>
          <SortContainer>
            <span>Sort:</span>
            <SortSelect
              value={sortColumn}
              onChange={(e) => onSortColumnChange(e.target.value as string)}
              displayEmpty
              size="small"
            >
              <MenuItem value="">None</MenuItem>
              {columns.map((col) => (
                <MenuItem key={col} value={col}>
                  {col}
                </MenuItem>
              ))}
            </SortSelect>
            {sortColumn && (
              <Tooltip title={sortDirection === 'ASC' ? 'Ascending' : 'Descending'}>
                <IconButton size="small" onClick={onSortDirectionToggle}>
                  {sortDirection === 'ASC' ? (
                    <ArrowUpwardIcon sx={{ fontSize: '1rem' }} />
                  ) : (
                    <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </SortContainer>
        </ToolbarLeft>
        <ToolbarRight>
          <Tooltip title="Add Row">
            <IconButton onClick={onAddRow} size="small">
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Selected">
            <span>
              <IconButton
                onClick={onDeleteSelected}
                size="small"
                disabled={
                  selectedRows.size === 0 ||
                  (primaryKeyColumns.length === 0 &&
                    rows.some((r) => selectedRows.has(r._rowId) && !r._isNew))
                }
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Revert All Changes">
            <span>
              <IconButton
                onClick={onRevertChanges}
                size="small"
                disabled={pendingChanges === 0}
              >
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={onRefresh} size="small" disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </ToolbarRight>
      </DataToolbar>

      {/* Status Bar */}
      {(selectedRows.size > 0 || pendingChanges > 0) && (
        <ActionBar>
          <ActionBarInfo>
            {selectedRows.size > 0 && <span>{selectedRows.size} row(s) selected</span>}
            {pendingChanges > 0 && (
              <span style={{ color: '#f59e0b' }}>
                <WarningIcon sx={{ fontSize: '0.875rem', verticalAlign: 'middle', mr: 0.5 }} />
                {pendingChanges} unsaved change(s)
              </span>
            )}
          </ActionBarInfo>
        </ActionBar>
      )}

      {/* Table Container */}
      <TableContainer>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
            }}
          >
            <CircularProgress size={32} />
          </div>
        ) : columns.length > 0 ? (
          <EditableTable>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <Checkbox
                    size="small"
                    checked={selectedRows.size === rows.length && rows.length > 0}
                    indeterminate={selectedRows.size > 0 && selectedRows.size < rows.length}
                    onChange={onSelectAll}
                  />
                </th>
                <th style={{ width: '50px' }}>Status</th>
                {columns.map((col) => (
                  <th key={col}>
                    <SortableHeader
                      sortable
                      sorted={sortColumn === col}
                      onClick={() => onSortClick(col)}
                    >
                      {col}
                      {primaryKeyColumns.includes(col) && (
                        <span
                          style={{
                            marginLeft: '0.25rem',
                            color: '#f59e0b',
                            fontSize: '0.625rem',
                          }}
                        >
                          PK
                        </span>
                      )}
                      {sortColumn === col &&
                        (sortDirection === 'ASC' ? (
                          <ArrowUpwardIcon sx={{ fontSize: '0.875rem' }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ fontSize: '0.875rem' }} />
                        ))}
                    </SortableHeader>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={row._rowId}
                  style={{
                    backgroundColor: row._isDeleted
                      ? 'rgba(239, 68, 68, 0.1)'
                      : row._isNew
                        ? 'rgba(34, 197, 94, 0.1)'
                        : row._isModified
                          ? 'rgba(245, 158, 11, 0.1)'
                          : undefined,
                  }}
                >
                  <td>
                    <Checkbox
                      size="small"
                      checked={selectedRows.has(row._rowId)}
                      onChange={() => onSelectRow(row._rowId)}
                    />
                  </td>
                  <td>
                    {row._isNew && <NewRowIndicator>NEW</NewRowIndicator>}
                    {row._isModified && !row._isNew && (
                      <ModifiedRowIndicator>MOD</ModifiedRowIndicator>
                    )}
                    {row._isDeleted && (
                      <span style={{ color: '#ef4444', fontSize: '0.625rem' }}>DEL</span>
                    )}
                  </td>
                  {columns.map((col) => (
                    <EditableCell
                      key={col}
                      onClick={() =>
                        !row._isDeleted && onCellClick(row._rowId, col, row[col])
                      }
                      style={{
                        cursor: row._isDeleted ? 'not-allowed' : 'pointer',
                        opacity: row._isDeleted ? 0.5 : 1,
                      }}
                    >
                      {editingCell?.rowId === row._rowId && editingCell?.column === col ? (
                        <EditInput
                          value={editValue}
                          onChange={onCellChange}
                          onBlur={onCellBlur}
                          onKeyDown={onKeyDown}
                          autoFocus
                        />
                      ) : (
                        <span
                          style={{
                            color: row[col] === null ? '#6b7280' : undefined,
                          }}
                        >
                          {row[col] === null ? 'NULL' : formatDisplayValue(row[col])}
                        </span>
                      )}
                    </EditableCell>
                  ))}
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#6b7280',
                    }}
                  >
                    {searchValue ? 'No results found' : 'No data found'}
                  </td>
                </tr>
              )}
            </tbody>
          </EditableTable>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              color: '#6b7280',
            }}
          >
            No columns found
          </div>
        )}
      </TableContainer>

      {/* Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        totalPages={totalPages}
        startRow={startRow}
        endRow={endRow}
        isLoading={isLoading}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </DataTabContent>
  );
}
