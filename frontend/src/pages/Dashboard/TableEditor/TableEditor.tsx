import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import TableRowsIcon from '@mui/icons-material/TableRows';
import StorageIcon from '@mui/icons-material/Storage';
import {
  useTableDetails,
  useExecuteQuery,
  useModifyColumn,
  useDropColumn,
} from '../../../api/entities/schema';
import type { ColumnDetailsDto, ModifyColumnDto } from '../../../api/models/SchemaDto';
import { POSTGRES_DATA_TYPES, MYSQL_DATA_TYPES } from '../../../api/models/SchemaDto';
import { toastService } from '../../../services';
import {
  CancelButton,
  SubmitButton,
} from './shared.styles';
import {
  TableEditorDialog,
  DialogHeader,
  HeaderContent,
  TableIcon,
  HeaderInfo,
  DialogTitle,
  DialogSubtitle,
  StatBadge,
  WarningBadge,
  CloseButton,
  DialogFooter,
  StyledTabs,
  StyledTab,
} from './TableEditor.styles';
import type { TableEditorProps, RowData, EditingCell, ColumnMenuAnchor } from './TableEditor.types';
import { DEFAULT_PAGE_SIZE } from './TableEditor.types';
import { formatValue } from './TableEditor.utils';
import DataTab from './DataTab';
import ColumnsTab from './ColumnsTab';
import ConfirmDeleteRowsDialog from './ConfirmDeleteRowsDialog';
import EditColumnDialog from './EditColumnDialog';
import DeleteColumnDialog from './DeleteColumnDialog';
import ConfirmCloseDialog from './ConfirmCloseDialog';
import { ButtonLoadingSkeleton } from '../../../components';
import EditRowDialog from './EditRowDialog/EditRowDialog';

export default function TableEditor({
  open,
  onClose,
  databaseId,
  tableName,
  engine,
  onDataChanged,
}: TableEditorProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Data editing state
  const [rows, setRows] = useState<RowData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [primaryKeyColumns, setPrimaryKeyColumns] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editRowOpen, setEditRowOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<RowData | null>(null);
  const [isSavingRow, setIsSavingRow] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Search and sort state
  const [searchValue, setSearchValue] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  // Column management state
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<ColumnMenuAnchor | null>(null);
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [deleteColumnDialogOpen, setDeleteColumnDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<ColumnDetailsDto | null>(null);
  const [columnModifications, setColumnModifications] = useState<ModifyColumnDto>({
    name: '',
  });

  // Prevent double loading
  const hasLoadedRef = useRef(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch table details for column info
  const { data: tableDetailsData, refetch: refetchTableDetails } = useTableDetails(
    open ? databaseId : undefined,
    open ? tableName : undefined
  );
  const tableDetails = tableDetailsData?.table;

  // Query execution
  const { mutateAsync: executeQueryAsync } = useExecuteQuery(databaseId, {
    onError: (error) => {
      toastService.error(error.message || 'Query execution failed');
    },
  });

  // Build SQL query with search, sort, and pagination
  const buildQuery = useCallback(
    (countOnly: boolean = false, searchCols?: string[]) => {
      const quote = engine === 'postgres' ? '"' : '`';
      const offset = page * pageSize;

      let sql = countOnly
        ? `SELECT COUNT(*) as count FROM ${quote}${tableName}${quote}`
        : `SELECT * FROM ${quote}${tableName}${quote}`;

      // Add WHERE clause for global search across all columns
      if (searchValue && searchCols && searchCols.length > 0) {
        const searchTerm = searchValue.replace(/'/g, "''");
        const conditions = searchCols.map((col) => {
          if (engine === 'postgres') {
            return `${quote}${col}${quote}::text ILIKE '%${searchTerm}%'`;
          } else {
            return `CAST(${quote}${col}${quote} AS CHAR) LIKE '%${searchTerm}%'`;
          }
        });
        sql += ` WHERE (${conditions.join(' OR ')})`;
      }

      if (!countOnly) {
        // Add ORDER BY clause
        if (sortColumn) {
          sql += ` ORDER BY ${quote}${sortColumn}${quote} ${sortDirection}`;
        }

        // Add pagination
        sql += ` LIMIT ${pageSize} OFFSET ${offset}`;
      }

      return sql;
    },
    [engine, tableName, page, pageSize, searchValue, sortColumn, sortDirection]
  );

  // Load data function
  const loadData = useCallback(async (searchColumns?: string[]) => {
    if (!tableName) return;

    setIsLoading(true);
    const offset = page * pageSize;
    const sql = buildQuery(false, searchColumns);

    try {
      const result = await executeQueryAsync(sql);
      if (result.success && result.rows && result.columns) {
        const loadedRows: RowData[] = result.rows.map((row, idx) => ({
          ...row,
          _rowId: `existing-${offset + idx}`,
          _originalData: { ...row },
        }));
        setRows(loadedRows);
        setColumns(result.columns);
      }
    } catch {
      // Error handled by mutation onError
    } finally {
      setIsLoading(false);
    }
  }, [tableName, page, pageSize, buildQuery, executeQueryAsync]);

  // Load total count
  const loadTotalCount = useCallback(async (searchColumns?: string[]) => {
    if (!tableName) return;

    const sql = buildQuery(true, searchColumns);

    try {
      const result = await executeQueryAsync(sql);
      if (result.success && result.rows && result.rows.length > 0) {
        const count = Number(result.rows[0].count);
        setTotalRows(count);
      }
    } catch {
      // Error handled by mutation onError
    }
  }, [tableName, buildQuery, executeQueryAsync]);

  // Column mutations
  const { mutate: modifyColumn, isPending: isModifying } = useModifyColumn(databaseId, tableName, {
    onSuccess: (message) => {
      toastService.success(message);
      setEditColumnDialogOpen(false);
      setSelectedColumn(null);
      refetchTableDetails();
      onDataChanged?.();
    },
    onError: (error) => {
      toastService.error(error.message || 'Failed to modify column');
    },
  });

  const { mutate: dropColumn, isPending: isDropping } = useDropColumn(databaseId, tableName, {
    onSuccess: (message) => {
      toastService.success(message);
      setDeleteColumnDialogOpen(false);
      setSelectedColumn(null);
      refetchTableDetails();
      // Reload data since columns changed
      hasLoadedRef.current = false;
      onDataChanged?.();
    },
    onError: (error) => {
      toastService.error(error.message || 'Failed to delete column');
    },
  });

  // Get primary key columns from table details
  useEffect(() => {
    if (tableDetails?.columns) {
      const pkCols = tableDetails.columns.filter((col) => col.isPrimaryKey).map((col) => col.name);
      setPrimaryKeyColumns(pkCols);
    }
  }, [tableDetails]);

  // Initial load when dialog opens
  useEffect(() => {
    if (open && !hasLoadedRef.current && tableName) {
      hasLoadedRef.current = true;
      loadData();
      loadTotalCount();
    }
    if (!open) {
      hasLoadedRef.current = false;
      // Reset search/sort state when closing
      setSearchValue('');
      setSortColumn('');
      setSortDirection('ASC');
      setPage(0);
      setPageSize(DEFAULT_PAGE_SIZE);
    }
  }, [open, tableName, loadData, loadTotalCount]);

  // Reload when page, pageSize, sort changes
  useEffect(() => {
    if (open && hasLoadedRef.current) {
      loadData(columns);
    }
  }, [page, pageSize, sortColumn, sortDirection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    if (!open || !hasLoadedRef.current) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      // Reset to first page on search without triggering the page change effect
      setPage(0);
      // Load both data and count in sequence to avoid race conditions
      await loadData(columns);
      await loadTotalCount(columns);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate pending changes
  useEffect(() => {
    const newRows = rows.filter((r) => r._isNew && !r._isDeleted).length;
    const modifiedRows = rows.filter((r) => r._isModified && !r._isNew && !r._isDeleted).length;
    const deletedRows = rows.filter((r) => r._isDeleted && !r._isNew).length;
    setPendingChanges(newRows + modifiedRows + deletedRows);
  }, [rows]);

  // Handle sort column click
  const handleSortClick = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortColumn(column);
      setSortDirection('ASC');
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0); // Reset to first page
  };

  const handleCellClick = (rowId: string, column: string, value: unknown) => {
    if (primaryKeyColumns.includes(column) && !rows.find((r) => r._rowId === rowId)?._isNew) {
      return;
    }
    setEditingCell({ rowId, column });
    setEditValue(value === null ? '' : String(value));
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleCellBlur = () => {
    if (!editingCell) return;

    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row._rowId !== editingCell.rowId) return row;

        const originalValue = row._originalData?.[editingCell.column];
        const newValue = editValue === '' ? null : editValue;
        const currentValue = row[editingCell.column];

        if (String(currentValue ?? '') === String(newValue ?? '')) {
          setEditingCell(null);
          return row;
        }

        const updatedRow = {
          ...row,
          [editingCell.column]: newValue,
          _isModified:
            !row._isNew &&
            (String(originalValue ?? '') !== String(newValue ?? '') || row._isModified),
        };

        if (!row._isNew && row._originalData) {
          const isBackToOriginal = columns.every(
            (col) => String(updatedRow[col] ?? '') === String(row._originalData?.[col] ?? '')
          );
          if (isBackToOriginal) {
            updatedRow._isModified = false;
          }
        }

        return updatedRow;
      })
    );

    setEditingCell(null);
  };

  const handleRowEdit = (row: RowData) => {
    setEditingRow(row);
    setEditRowOpen(true);
  };

  const handleRowSave = (updatedRow: RowData) => {
    setIsSavingRow(true);

    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row._rowId !== updatedRow._rowId) return row;

        const originalData = row._originalData || row;
        const isModified = columns.some(
          (col) => String(updatedRow[col] ?? '') !== String(originalData[col] ?? '')
        );

        return {
          ...updatedRow,
          _isModified: !row._isNew && isModified,
          _originalData: row._originalData || originalData,
        };
      })
    );

    setEditRowOpen(false);
    setEditingRow(null);
    setIsSavingRow(false);
    toastService.success('Row updated');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const handleAddRow = () => {
    const newRow: RowData = {
      _rowId: `new-${Date.now()}`,
      _isNew: true,
    };
    columns.forEach((col) => {
      newRow[col] = null;
    });
    setRows((prev) => [...prev, newRow]);
  };

  const handleSelectRow = (rowId: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((r) => r._rowId)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRows.size === 0) return;
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    setRows((prevRows) =>
      prevRows
        .map((row) => {
          if (!selectedRows.has(row._rowId)) return row;
          if (row._isNew) {
            return { ...row, _isDeleted: true, _removeFromList: true };
          }
          return { ...row, _isDeleted: true };
        })
        .filter((row) => !row._removeFromList)
    );
    setSelectedRows(new Set());
    setConfirmDeleteOpen(false);
  };

  const handleRevertChanges = () => {
    setRows((prevRows) =>
      prevRows
        .filter((row) => !row._isNew)
        .map((row) => ({
          ...row,
          ...row._originalData,
          _isModified: false,
          _isDeleted: false,
        }))
    );
    setSelectedRows(new Set());
  };

  const handleRefresh = () => {
    setSelectedRows(new Set());
    loadData();
    loadTotalCount();
  };

  const generateSaveQueries = useCallback((): string[] => {
    const queries: string[] = [];
    const quote = engine === 'postgres' ? '"' : '`';

    const deletedRows = rows.filter((r) => r._isDeleted && !r._isNew);
    for (const row of deletedRows) {
      if (primaryKeyColumns.length === 0) {
        toastService.error('Cannot delete rows without a primary key');
        return [];
      }
      const whereClause = primaryKeyColumns
        .map((pk) => `${quote}${pk}${quote} = ${formatValue(row._originalData?.[pk])}`)
        .join(' AND ');
      queries.push(`DELETE FROM ${quote}${tableName}${quote} WHERE ${whereClause}`);
    }

    const modifiedRows = rows.filter((r) => r._isModified && !r._isNew && !r._isDeleted);
    for (const row of modifiedRows) {
      if (primaryKeyColumns.length === 0) {
        toastService.error('Cannot update rows without a primary key');
        return [];
      }
      const setClauses = columns
        .filter((col) => !primaryKeyColumns.includes(col))
        .filter((col) => String(row[col] ?? '') !== String(row._originalData?.[col] ?? ''))
        .map((col) => `${quote}${col}${quote} = ${formatValue(row[col])}`)
        .join(', ');

      if (!setClauses) continue;

      const whereClause = primaryKeyColumns
        .map((pk) => `${quote}${pk}${quote} = ${formatValue(row._originalData?.[pk])}`)
        .join(' AND ');
      queries.push(`UPDATE ${quote}${tableName}${quote} SET ${setClauses} WHERE ${whereClause}`);
    }

    const newRows = rows.filter((r) => r._isNew && !r._isDeleted);
    for (const row of newRows) {
      const nonNullColumns = columns.filter(
        (col) => row[col] !== null && row[col] !== undefined && row[col] !== ''
      );
      if (nonNullColumns.length === 0) continue;

      const columnList = nonNullColumns.map((col) => `${quote}${col}${quote}`).join(', ');
      const valueList = nonNullColumns.map((col) => formatValue(row[col])).join(', ');
      queries.push(
        `INSERT INTO ${quote}${tableName}${quote} (${columnList}) VALUES (${valueList})`
      );
    }

    return queries;
  }, [rows, columns, primaryKeyColumns, tableName, engine]);

  const handleSave = async () => {
    const queries = generateSaveQueries();
    if (queries.length === 0) {
      toastService.info('No changes to save');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const sql of queries) {
      try {
        const result = await executeQueryAsync(sql);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          toastService.error(result.message || 'Query failed');
        }
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toastService.success(`${successCount} change(s) saved successfully`);
      onDataChanged?.();
      handleRefresh();
    }
  };

  // Column management handlers
  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>, column: ColumnDetailsDto) => {
    event.stopPropagation();
    setColumnMenuAnchor({ el: event.currentTarget, column });
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

  const handleEditColumn = (column: ColumnDetailsDto) => {
    setSelectedColumn(column);
    setColumnModifications({
      name: column.name,
      newName: column.name,
      type: column.type,
      nullable: column.nullable,
      defaultValue: column.defaultValue || '',
    });
    setEditColumnDialogOpen(true);
    handleColumnMenuClose();
  };

  const handleDeleteColumn = (column: ColumnDetailsDto) => {
    setSelectedColumn(column);
    setDeleteColumnDialogOpen(true);
    handleColumnMenuClose();
  };

  const handleSaveColumnChanges = () => {
    if (!selectedColumn) return;

    const modifications: ModifyColumnDto = {
      name: selectedColumn.name,
    };

    if (columnModifications.newName && columnModifications.newName !== selectedColumn.name) {
      modifications.newName = columnModifications.newName;
    }
    if (columnModifications.type && columnModifications.type !== selectedColumn.type) {
      modifications.type = columnModifications.type;
    }
    if (
      columnModifications.nullable !== undefined &&
      columnModifications.nullable !== selectedColumn.nullable
    ) {
      modifications.nullable = columnModifications.nullable;
    }
    if (columnModifications.defaultValue !== undefined) {
      modifications.defaultValue = columnModifications.defaultValue || undefined;
    }

    modifyColumn({ columnName: selectedColumn.name, modifications });
  };

  const handleConfirmDeleteColumn = () => {
    if (!selectedColumn) return;
    dropColumn(selectedColumn.name);
  };

  const handleClose = () => {
    if (pendingChanges > 0) {
      setConfirmCloseOpen(true);
      return;
    }
    doClose();
  };

  const doClose = () => {
    setConfirmCloseOpen(false);
    setRows([]);
    setSelectedRows(new Set());
    setPage(0);
    setActiveTab(0);
    onClose();
  };

  const totalPages = Math.ceil(totalRows / pageSize);
  const startRow = page * pageSize + 1;
  const endRow = Math.min((page + 1) * pageSize, totalRows);

  const visibleRows = useMemo(() => rows.filter((r) => !r._isDeleted || r._isNew), [rows]);

  const dataTypes = engine === 'postgres' ? POSTGRES_DATA_TYPES : MYSQL_DATA_TYPES;

  return (
    <TableEditorDialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogHeader>
        <HeaderContent>
          <TableIcon>
            <StorageIcon />
          </TableIcon>
          <HeaderInfo>
            <DialogTitle>{tableName}</DialogTitle>
            <DialogSubtitle>
              <StatBadge>
                <TableRowsIcon sx={{ fontSize: '0.875rem' }} />
                {totalRows.toLocaleString()} rows
              </StatBadge>
              <StatBadge>
                <ViewColumnIcon sx={{ fontSize: '0.875rem' }} />
                {tableDetails?.columns?.length || 0} columns
              </StatBadge>
              {primaryKeyColumns.length === 0 && (
                <WarningBadge>
                  <WarningIcon sx={{ fontSize: '0.875rem' }} />
                  No primary key
                </WarningBadge>
              )}
            </DialogSubtitle>
          </HeaderInfo>
        </HeaderContent>
        <CloseButton onClick={handleClose} size="small">
          <CloseIcon />
        </CloseButton>
      </DialogHeader>

      <StyledTabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
      >
        <StyledTab
          icon={<TableRowsIcon />}
          iconPosition="start"
          label="Data"
        />
        <StyledTab
          icon={<ViewColumnIcon />}
          iconPosition="start"
          label="Columns"
        />
      </StyledTabs>

      {/* Data Tab */}
      {activeTab === 0 && (
        <DataTab
          rows={rows}
          columns={columns}
          primaryKeyColumns={primaryKeyColumns}
          selectedRows={selectedRows}
          visibleRows={visibleRows}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          totalPages={totalPages}
          startRow={startRow}
          endRow={endRow}
          searchValue={searchValue}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          editingCell={editingCell}
          editValue={editValue}
          pendingChanges={pendingChanges}
          isLoading={isLoading}
          onSearchValueChange={setSearchValue}
          onSortColumnChange={setSortColumn}
          onSortDirectionToggle={() => setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC')}
          onSortClick={handleSortClick}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          onCellClick={handleCellClick}
          onCellChange={handleCellChange}
          onCellBlur={handleCellBlur}
          onKeyDown={handleKeyDown}
          onRowEdit={handleRowEdit}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          onAddRow={handleAddRow}
          onDeleteSelected={handleDeleteSelected}
          onRevertChanges={handleRevertChanges}
          onRefresh={handleRefresh}
        />
      )}

      {/* Columns Tab */}
      {activeTab === 1 && (
        <ColumnsTab
          columns={tableDetails?.columns}
          columnMenuAnchor={columnMenuAnchor}
          onColumnMenuOpen={handleColumnMenuOpen}
          onColumnMenuClose={handleColumnMenuClose}
          onEditColumn={handleEditColumn}
          onDeleteColumn={handleDeleteColumn}
        />
      )}

      <DialogFooter>
        <CancelButton onClick={handleClose}>Close</CancelButton>
        {activeTab === 0 && (
          <SubmitButton
            onClick={handleSave}
            disabled={pendingChanges === 0}
            startIcon={
              isLoading ? <ButtonLoadingSkeleton size="small" /> : <SaveIcon />
            }
          >
            Save {pendingChanges > 0 ? `(${pendingChanges})` : ''}
          </SubmitButton>
        )}
      </DialogFooter>

      {/* Confirm Delete Rows Dialog */}
      <ConfirmDeleteRowsDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        selectedCount={selectedRows.size}
        hasExistingRows={rows.some((r) => selectedRows.has(r._rowId) && !r._isNew)}
        onConfirm={confirmDelete}
      />

      {/* Edit Column Dialog */}
      <EditColumnDialog
        open={editColumnDialogOpen}
        onClose={() => setEditColumnDialogOpen(false)}
        selectedColumn={selectedColumn}
        columnModifications={columnModifications}
        onColumnModificationsChange={setColumnModifications}
        dataTypes={dataTypes}
        onSave={handleSaveColumnChanges}
        isModifying={isModifying}
      />

      {/* Delete Column Dialog */}
      <DeleteColumnDialog
        open={deleteColumnDialogOpen}
        onClose={() => setDeleteColumnDialogOpen(false)}
        columnName={selectedColumn?.name}
        onConfirm={handleConfirmDeleteColumn}
        isDropping={isDropping}
      />

      {/* Confirm Close Dialog */}
      <ConfirmCloseDialog
        open={confirmCloseOpen}
        onClose={() => setConfirmCloseOpen(false)}
        pendingChanges={pendingChanges}
        onDiscard={doClose}
      />

      {/* Edit Row Dialog */}
      <EditRowDialog
        open={editRowOpen}
        row={editingRow}
        columns={columns}
        primaryKeyColumns={primaryKeyColumns}
        onClose={() => setEditRowOpen(false)}
        onSave={handleRowSave}
        isSaving={isSavingRow}
      />
    </TableEditorDialog>
  );
}
