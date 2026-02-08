import { useState, useEffect, useMemo, useRef } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import TableRowsIcon from '@mui/icons-material/TableRows';
import StorageIcon from '@mui/icons-material/Storage';
import {
  useTableDetails,
  useExecuteQuery,
  useTableData,
  useModifyColumn,
  useDropColumn,
} from '../../../../api/entities/schema';
import type { ColumnDetailsDto, ModifyColumnDto } from '../../../../api/models/SchemaDto';
import { POSTGRES_DATA_TYPES, MYSQL_DATA_TYPES } from '../../../../api/models/SchemaDto';
import { toastService } from '../../../../services';
import { Dialog, DialogTitle as MuiDialogTitle, DialogActions } from '@mui/material';
import {
  CancelButton,
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
import { usePermissions, AccessRestricted } from '../../../../components';
import EditRowDialog from './EditRowDialog/EditRowDialog';

export default function TableEditor({
  open,
  onClose,
  databaseId,
  tableName,
  engine,
  onDataChanged,
}: TableEditorProps) {
  // Permissions
  const { canViewTableData, canAddRecord, canDeleteRecord } = usePermissions();

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
  const [addRowDialogOpen, setAddRowDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteRowDialogOpen, setDeleteRowDialogOpen] = useState(false);

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
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Fetch table details for column info
  const { data: tableDetailsData, refetch: refetchTableDetails } = useTableDetails(
    open ? databaseId : undefined,
    open ? tableName : undefined
  );
  const tableDetails = tableDetailsData?.table;

  // Fetch table data using dedicated endpoint (viewTableData permission)
  const {
    data: tableDataResult,
    isLoading: isLoadingTableData,
    refetch: refetchTableData
  } = useTableData(
    open ? databaseId : undefined,
    open ? tableName : undefined,
    {
      page,
      pageSize,
      sortColumn: sortColumn || undefined,
      sortDirection,
      search: debouncedSearch || undefined,
      enabled: open && !!tableName && canViewTableData,
    }
  );

  // Query execution - used for DML operations (INSERT, UPDATE, DELETE)
  const { mutateAsync: executeQueryAsync } = useExecuteQuery(databaseId, {
    onError: (error) => {
      toastService.error(error.message || 'Query execution failed');
    },
  });

  // Update rows/columns/totalRows when tableDataResult changes
  useEffect(() => {
    if (tableDataResult?.success && tableDataResult.rows && tableDataResult.columns) {
      const offset = page * pageSize;
      const loadedRows: RowData[] = tableDataResult.rows.map((row, idx) => ({
        ...row,
        _rowId: `existing-${offset + idx}`,
        _originalData: { ...row },
      }));
      setRows(loadedRows);
      setColumns(tableDataResult.columns);
      if (tableDataResult.totalCount !== undefined) {
        setTotalRows(tableDataResult.totalCount);
      } else if (tableDataResult.rowCount !== undefined) {
        setTotalRows(tableDataResult.rowCount);
      }
    }
  }, [tableDataResult, page, pageSize]);

  // Update isLoading state
  useEffect(() => {
    setIsLoading(isLoadingTableData);
  }, [isLoadingTableData]);

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

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      hasLoadedRef.current = false;
      // Reset search/sort state when closing
      setSearchValue('');
      setDebouncedSearch('');
      setSortColumn('');
      setSortDirection('ASC');
      setPage(0);
      setPageSize(DEFAULT_PAGE_SIZE);
      setRows([]);
      setColumns([]);
    } else {
      hasLoadedRef.current = true;
    }
  }, [open]);

  // Debounced search - update debouncedSearch after delay
  useEffect(() => {
    if (!open) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setPage(0); // Reset to first page on search
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue, open]);

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

  const handleRowSave = async (updatedRow: RowData) => {
    setIsSavingRow(true);
    const quote = engine === 'postgres' ? '"' : '`';

    try {
      // For new rows, we don't need to find them in the rows array
      if (updatedRow._isNew) {
        // INSERT new row
        const nonNullColumns = columns.filter(
          (col) => updatedRow[col] !== null && updatedRow[col] !== undefined && updatedRow[col] !== ''
        );
        if (nonNullColumns.length === 0) {
          toastService.error('Please fill in at least one column');
          setIsSavingRow(false);
          return;
        }

        const columnList = nonNullColumns.map((col) => `${quote}${col}${quote}`).join(', ');
        const valueList = nonNullColumns.map((col) => formatValue(updatedRow[col])).join(', ');
        const sql = `INSERT INTO ${quote}${tableName}${quote} (${columnList}) VALUES (${valueList})`;

        const result = await executeQueryAsync({ sql });
        if (result.success) {
          toastService.success('Row added successfully');
          handleRefresh();
          onDataChanged?.();
          setEditRowOpen(false);
          setEditingRow(null);
        } else {
          toastService.error(result.message || 'Failed to add row');
        }
      } else {
        // UPDATE existing row
        const originalRow = rows.find((r) => r._rowId === updatedRow._rowId);
        if (!originalRow) {
          toastService.error('Row not found');
          setIsSavingRow(false);
          return;
        }

        if (primaryKeyColumns.length === 0) {
          toastService.error('Cannot update rows without a primary key');
          setIsSavingRow(false);
          return;
        }

        const originalData = originalRow._originalData || originalRow;
        const setClauses = columns
          .filter((col) => !primaryKeyColumns.includes(col))
          .filter((col) => String(updatedRow[col] ?? '') !== String(originalData[col] ?? ''))
          .map((col) => `${quote}${col}${quote} = ${formatValue(updatedRow[col])}`)
          .join(', ');

        if (!setClauses) {
          toastService.info('No changes to save');
          setEditRowOpen(false);
          setEditingRow(null);
          return;
        }

        const whereClause = primaryKeyColumns
          .map((pk) => `${quote}${pk}${quote} = ${formatValue(originalData[pk])}`)
          .join(' AND ');
        const sql = `UPDATE ${quote}${tableName}${quote} SET ${setClauses} WHERE ${whereClause}`;

        const result = await executeQueryAsync({ sql });
        if (result.success) {
          toastService.success('Row updated successfully');
          handleRefresh();
          onDataChanged?.();
          setEditRowOpen(false);
          setEditingRow(null);
        } else {
          toastService.error(result.message || 'Failed to update row');
        }
      }
    } catch (error: any) {
      toastService.error(error?.message || 'Failed to save row');
    } finally {
      setIsSavingRow(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Close add row dialog and actually add the row when permission is granted
  useEffect(() => {
    if (canAddRecord && addRowDialogOpen) {
      setAddRowDialogOpen(false);
      // Actually add the row now that we have permission
      const newRow: RowData = {
        _rowId: `new-${Date.now()}`,
        _isNew: true,
      };
      columns.forEach((col) => {
        newRow[col] = null;
      });
      setRows((prev) => [...prev, newRow]);
    }
  }, [canAddRecord, addRowDialogOpen, columns]);

  const handleAddRow = () => {
    if (!canAddRecord) {
      setAddRowDialogOpen(true);
      return;
    }
    const newRow: RowData = {
      _rowId: `new-${Date.now()}`,
      _isNew: true,
    };
    columns.forEach((col) => {
      newRow[col] = null;
    });
    // Open EditRowDialog with the new row
    setEditingRow(newRow);
    setEditRowOpen(true);
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
    if (!canDeleteRecord) {
      setDeleteRowDialogOpen(true);
      return;
    }
    setConfirmDeleteOpen(true);
  };

  // Close delete row permission dialog when permission is granted
  useEffect(() => {
    if (canDeleteRecord && deleteRowDialogOpen) {
      setDeleteRowDialogOpen(false);
      // Show the actual delete confirmation now
      if (selectedRows.size > 0) {
        setConfirmDeleteOpen(true);
      }
    }
  }, [canDeleteRecord, deleteRowDialogOpen, selectedRows.size]);

  const confirmDelete = async () => {
    const quote = engine === 'postgres' ? '"' : '`';
    const selectedRowsList = rows.filter((r) => selectedRows.has(r._rowId));
    const newRows = selectedRowsList.filter((r) => r._isNew);
    const existingRows = selectedRowsList.filter((r) => !r._isNew);

    // Remove new rows immediately (they don't exist in DB)
    if (newRows.length > 0) {
      setRows((prevRows) => prevRows.filter((row) => !newRows.some((nr) => nr._rowId === row._rowId)));
      toastService.success(`${newRows.length} new row(s) removed`);
    }

    // Delete existing rows from database
    if (existingRows.length > 0) {
      if (primaryKeyColumns.length === 0) {
        toastService.error('Cannot delete rows without a primary key');
        setConfirmDeleteOpen(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of existingRows) {
        const whereClause = primaryKeyColumns
          .map((pk) => `${quote}${pk}${quote} = ${formatValue(row._originalData?.[pk] ?? row[pk])}`)
          .join(' AND ');
        const sql = `DELETE FROM ${quote}${tableName}${quote} WHERE ${whereClause}`;

        try {
          const result = await executeQueryAsync({ sql });
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            toastService.error(result.message || 'Failed to delete row');
          }
        } catch {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toastService.success(`${successCount} row(s) deleted successfully`);
        handleRefresh();
        onDataChanged?.();
      }
    }

    setSelectedRows(new Set());
    setConfirmDeleteOpen(false);
  };

  const handleRefresh = () => {
    setSelectedRows(new Set());
    refetchTableData();
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
    doClose();
  };

  const doClose = () => {
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
        canViewTableData ? (
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
            onRefresh={handleRefresh}
          />
        ) : (
          <AccessRestricted
            message="Data Access Restricted"
            description="You don't have permission to view table data. Please contact the account owner to request access."
            permission="viewTableData"
          />
        )
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

      {/* Add Row Permission Dialog */}
      <Dialog open={addRowDialogOpen} onClose={() => setAddRowDialogOpen(false)} maxWidth="sm" fullWidth>
        <MuiDialogTitle>Add Row</MuiDialogTitle>
        <AccessRestricted
          message="Add Row Access Restricted"
          description="You don't have permission to add table data. Please contact the account owner to request access."
          permission="addRecord"
        />
        <DialogActions sx={{ p: 2 }}>
          <CancelButton onClick={() => setAddRowDialogOpen(false)}>
            Close
          </CancelButton>
        </DialogActions>
      </Dialog>

      {/* Delete Row Permission Dialog */}
      <Dialog open={deleteRowDialogOpen} onClose={() => setDeleteRowDialogOpen(false)} maxWidth="sm" fullWidth>
        <MuiDialogTitle>Delete Row</MuiDialogTitle>
        <AccessRestricted
          message="Delete Row Access Restricted"
          description="You don't have permission to delete table data. Please contact the account owner to request access."
          permission="deleteRecord"
        />
        <DialogActions sx={{ p: 2 }}>
          <CancelButton onClick={() => setDeleteRowDialogOpen(false)}>
            Close
          </CancelButton>
        </DialogActions>
      </Dialog>
    </TableEditorDialog>
  );
}
