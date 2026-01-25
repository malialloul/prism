import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  CircularProgress,
  IconButton,
  Tooltip,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import UndoIcon from "@mui/icons-material/Undo";
import WarningIcon from "@mui/icons-material/Warning";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import TableRowsIcon from "@mui/icons-material/TableRows";
import {
  useTableDetails,
  useExecuteQuery,
  useModifyColumn,
  useDropColumn,
} from "../../../api/entities/schema";
import type {
  ColumnDetailsDto,
  ModifyColumnDto,
} from "../../../api/models/SchemaDto";
import {
  POSTGRES_DATA_TYPES,
  MYSQL_DATA_TYPES,
} from "../../../api/models/SchemaDto";
import { toastService } from "../../../services";
import {
  StyledDialog,
  DialogHeader,
  DialogTitle as StyledDialogTitle,
  DialogSubtitle,
  DialogFooter,
  CancelButton,
  SubmitButton,
  DeleteButton,
  FormGroup,
  FormLabel,
  FormRow,
  StyledTextField,
  StyledSelect,
  CheckboxLabel,
} from "./TableManagement.styles";
import {
  TableEditorContent,
  EditableTable,
  EditableCell,
  EditInput,
  NewRowIndicator,
  ModifiedRowIndicator,
  ActionBar,
  ActionBarInfo,
  ActionBarButtons,
  PaginationControls,
  PageButton,
  PageInfo,
} from "./TableEditor.styles";

interface TableEditorProps {
  open: boolean;
  onClose: () => void;
  databaseId: string;
  tableName: string;
  engine: "postgres" | "mysql";
  onDataChanged?: () => void;
}

interface RowData {
  _rowId: string;
  _isNew?: boolean;
  _isModified?: boolean;
  _isDeleted?: boolean;
  _originalData?: Record<string, unknown>;
  [key: string]: unknown;
}

const PAGE_SIZE = 50;

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
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    column: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Column management state
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<{
    el: HTMLElement;
    column: ColumnDetailsDto;
  } | null>(null);
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [deleteColumnDialogOpen, setDeleteColumnDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<ColumnDetailsDto | null>(
    null,
  );
  const [columnModifications, setColumnModifications] =
    useState<ModifyColumnDto>({
      name: "",
    });

  // Prevent double loading
  const hasLoadedRef = useRef(false);

  // Fetch table details for column info
  const { data: tableDetailsData, refetch: refetchTableDetails } =
    useTableDetails(
      open ? databaseId : undefined,
      open ? tableName : undefined,
    );
  const tableDetails = tableDetailsData?.table;

  // Query execution
  const { mutateAsync: executeQueryAsync } = useExecuteQuery(databaseId, {
    onError: (error) => {
      toastService.error(error.message || "Query execution failed");
    },
  });

  // Load data function
  const loadData = useCallback(async () => {
    if (!tableName) return;

    setIsLoading(true);
    const offset = page * PAGE_SIZE;
    const quote = engine === "postgres" ? '"' : "`";
    const sql = `SELECT * FROM ${quote}${tableName}${quote} LIMIT ${PAGE_SIZE} OFFSET ${offset}`;

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
  }, [tableName, page, engine, executeQueryAsync]);

  // Load total count
  const loadTotalCount = useCallback(async () => {
    if (!tableName) return;

    const quote = engine === "postgres" ? '"' : "`";
    const sql = `SELECT COUNT(*) as count FROM ${quote}${tableName}${quote}`;

    try {
      const result = await executeQueryAsync(sql);
      if (result.success && result.rows && result.rows.length > 0) {
        const count = Number(result.rows[0].count);
        setTotalRows(count);
      }
    } catch {
      // Error handled by mutation onError
    }
  }, [tableName, engine, executeQueryAsync]);

  // Column mutations
  const { mutate: modifyColumn, isPending: isModifying } = useModifyColumn(
    databaseId,
    tableName,
    {
      onSuccess: (message) => {
        toastService.success(message);
        setEditColumnDialogOpen(false);
        setSelectedColumn(null);
        refetchTableDetails();
        onDataChanged?.();
      },
      onError: (error) => {
        toastService.error(error.message || "Failed to modify column");
      },
    },
  );

  const { mutate: dropColumn, isPending: isDropping } = useDropColumn(
    databaseId,
    tableName,
    {
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
        toastService.error(error.message || "Failed to delete column");
      },
    },
  );

  // Get primary key columns from table details
  useEffect(() => {
    if (tableDetails?.columns) {
      const pkCols = tableDetails.columns
        .filter((col) => col.isPrimaryKey)
        .map((col) => col.name);
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
    }
  }, [open, tableName, loadData, loadTotalCount]);

  // Reload when page changes (but only after initial load)
  useEffect(() => {
    if (open && hasLoadedRef.current && page > 0) {
      loadData();
    }
  }, [page, open, loadData]);

  // Calculate pending changes
  useEffect(() => {
    const newRows = rows.filter((r) => r._isNew && !r._isDeleted).length;
    const modifiedRows = rows.filter(
      (r) => r._isModified && !r._isNew && !r._isDeleted,
    ).length;
    const deletedRows = rows.filter((r) => r._isDeleted && !r._isNew).length;
    setPendingChanges(newRows + modifiedRows + deletedRows);
  }, [rows]);

  const handleCellClick = (rowId: string, column: string, value: unknown) => {
    if (
      primaryKeyColumns.includes(column) &&
      !rows.find((r) => r._rowId === rowId)?._isNew
    ) {
      return;
    }
    setEditingCell({ rowId, column });
    setEditValue(value === null ? "" : String(value));
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
        const newValue = editValue === "" ? null : editValue;
        const currentValue = row[editingCell.column];

        if (String(currentValue ?? "") === String(newValue ?? "")) {
          setEditingCell(null);
          return row;
        }

        const updatedRow = {
          ...row,
          [editingCell.column]: newValue,
          _isModified:
            !row._isNew &&
            (String(originalValue ?? "") !== String(newValue ?? "") ||
              row._isModified),
        };

        if (!row._isNew && row._originalData) {
          const isBackToOriginal = columns.every(
            (col) =>
              String(updatedRow[col] ?? "") ===
              String(row._originalData?.[col] ?? ""),
          );
          if (isBackToOriginal) {
            updatedRow._isModified = false;
          }
        }

        return updatedRow;
      }),
    );

    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCellBlur();
    } else if (e.key === "Escape") {
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
        .filter((row) => !row._removeFromList),
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
        })),
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
    const quote = engine === "postgres" ? '"' : "`";

    const deletedRows = rows.filter((r) => r._isDeleted && !r._isNew);
    for (const row of deletedRows) {
      if (primaryKeyColumns.length === 0) {
        toastService.error("Cannot delete rows without a primary key");
        return [];
      }
      const whereClause = primaryKeyColumns
        .map(
          (pk) =>
            `${quote}${pk}${quote} = ${formatValue(row._originalData?.[pk])}`,
        )
        .join(" AND ");
      queries.push(
        `DELETE FROM ${quote}${tableName}${quote} WHERE ${whereClause}`,
      );
    }

    const modifiedRows = rows.filter(
      (r) => r._isModified && !r._isNew && !r._isDeleted,
    );
    for (const row of modifiedRows) {
      if (primaryKeyColumns.length === 0) {
        toastService.error("Cannot update rows without a primary key");
        return [];
      }
      const setClauses = columns
        .filter((col) => !primaryKeyColumns.includes(col))
        .filter(
          (col) =>
            String(row[col] ?? "") !== String(row._originalData?.[col] ?? ""),
        )
        .map((col) => `${quote}${col}${quote} = ${formatValue(row[col])}`)
        .join(", ");

      if (!setClauses) continue;

      const whereClause = primaryKeyColumns
        .map(
          (pk) =>
            `${quote}${pk}${quote} = ${formatValue(row._originalData?.[pk])}`,
        )
        .join(" AND ");
      queries.push(
        `UPDATE ${quote}${tableName}${quote} SET ${setClauses} WHERE ${whereClause}`,
      );
    }

    const newRows = rows.filter((r) => r._isNew && !r._isDeleted);
    for (const row of newRows) {
      const nonNullColumns = columns.filter(
        (col) => row[col] !== null && row[col] !== undefined && row[col] !== "",
      );
      if (nonNullColumns.length === 0) continue;

      const columnList = nonNullColumns
        .map((col) => `${quote}${col}${quote}`)
        .join(", ");
      const valueList = nonNullColumns
        .map((col) => formatValue(row[col]))
        .join(", ");
      queries.push(
        `INSERT INTO ${quote}${tableName}${quote} (${columnList}) VALUES (${valueList})`,
      );
    }

    return queries;
  }, [rows, columns, primaryKeyColumns, tableName, engine]);

  const handleSave = async () => {
    const queries = generateSaveQueries();
    if (queries.length === 0) {
      toastService.info("No changes to save");
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
          toastService.error(result.message || "Query failed");
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
    if (errorCount > 0) {
      toastService.error(`${errorCount} change(s) failed`);
    }
  };

  // Column management handlers
  const handleColumnMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    column: ColumnDetailsDto,
  ) => {
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
      defaultValue: column.defaultValue || "",
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

    if (
      columnModifications.newName &&
      columnModifications.newName !== selectedColumn.name
    ) {
      modifications.newName = columnModifications.newName;
    }
    if (
      columnModifications.type &&
      columnModifications.type !== selectedColumn.type
    ) {
      modifications.type = columnModifications.type;
    }
    if (
      columnModifications.nullable !== undefined &&
      columnModifications.nullable !== selectedColumn.nullable
    ) {
      modifications.nullable = columnModifications.nullable;
    }
    if (columnModifications.defaultValue !== undefined) {
      modifications.defaultValue =
        columnModifications.defaultValue || undefined;
    }

    modifyColumn({ columnName: selectedColumn.name, modifications });
  };

  const handleConfirmDeleteColumn = () => {
    if (!selectedColumn) return;
    dropColumn(selectedColumn.name);
  };

  const handleClose = () => {
    if (pendingChanges > 0) {
      if (
        !confirm(
          `You have ${pendingChanges} unsaved change(s). Are you sure you want to close?`,
        )
      ) {
        return;
      }
    }
    setRows([]);
    setSelectedRows(new Set());
    setPage(0);
    setActiveTab(0);
    onClose();
  };

  const totalPages = Math.ceil(totalRows / PAGE_SIZE);

  const visibleRows = useMemo(
    () => rows.filter((r) => !r._isDeleted || r._isNew),
    [rows],
  );

  const dataTypes =
    engine === "postgres" ? POSTGRES_DATA_TYPES : MYSQL_DATA_TYPES;

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogHeader>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <StyledDialogTitle>Edit Table: {tableName}</StyledDialogTitle>
            <DialogSubtitle>
              {totalRows} total rows • {tableDetails?.columns?.length || 0}{" "}
              columns
              {primaryKeyColumns.length === 0 && (
                <span style={{ color: "#f59e0b", marginLeft: "1rem" }}>
                  <WarningIcon
                    sx={{
                      fontSize: "0.875rem",
                      verticalAlign: "middle",
                      mr: 0.5,
                    }}
                  />
                  No primary key
                </span>
              )}
            </DialogSubtitle>
          </div>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogHeader>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          icon={<TableRowsIcon sx={{ fontSize: "1rem" }} />}
          iconPosition="start"
          label="Data"
          sx={{ minHeight: 48, textTransform: "none" }}
        />
        <Tab
          icon={<ViewColumnIcon sx={{ fontSize: "1rem" }} />}
          iconPosition="start"
          label="Columns"
          sx={{ minHeight: 48, textTransform: "none" }}
        />
      </Tabs>

      {/* Data Tab */}
      {activeTab === 0 && (
        <TableEditorContent>
          <ActionBar>
            <ActionBarInfo>
              <span>
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              {selectedRows.size > 0 && (
                <span>{selectedRows.size} row(s) selected</span>
              )}
              {pendingChanges > 0 && (
                <span style={{ color: "#f59e0b" }}>
                  {pendingChanges} unsaved change(s)
                </span>
              )}
            </ActionBarInfo>
            <ActionBarButtons>
              <Tooltip title="Add Row">
                <IconButton onClick={handleAddRow} size="small">
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Selected">
                <span>
                  <IconButton
                    onClick={handleDeleteSelected}
                    size="small"
                    disabled={
                      selectedRows.size === 0 ||
                      (primaryKeyColumns.length === 0 &&
                        rows.some(
                          (r) => selectedRows.has(r._rowId) && !r._isNew,
                        ))
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Revert All Changes">
                <span>
                  <IconButton
                    onClick={handleRevertChanges}
                    size="small"
                    disabled={pendingChanges === 0}
                  >
                    <UndoIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={handleRefresh}
                  size="small"
                  disabled={isLoading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </ActionBarButtons>
          </ActionBar>

          {isLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              <CircularProgress size={32} />
            </div>
          )}

          {!isLoading && columns.length > 0 && (
            <EditableTable>
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <Checkbox
                      size="small"
                      checked={
                        selectedRows.size === rows.length && rows.length > 0
                      }
                      indeterminate={
                        selectedRows.size > 0 && selectedRows.size < rows.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{ width: "30px" }}></th>
                  {columns.map((col) => (
                    <th key={col}>
                      {col}
                      {primaryKeyColumns.includes(col) && (
                        <span
                          style={{
                            marginLeft: "0.25rem",
                            color: "#f59e0b",
                            fontSize: "0.625rem",
                          }}
                        >
                          PK
                        </span>
                      )}
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
                        ? "rgba(239, 68, 68, 0.1)"
                        : row._isNew
                          ? "rgba(34, 197, 94, 0.1)"
                          : row._isModified
                            ? "rgba(245, 158, 11, 0.1)"
                            : undefined,
                    }}
                  >
                    <td>
                      <Checkbox
                        size="small"
                        checked={selectedRows.has(row._rowId)}
                        onChange={() => handleSelectRow(row._rowId)}
                      />
                    </td>
                    <td>
                      {row._isNew && <NewRowIndicator>NEW</NewRowIndicator>}
                      {row._isModified && !row._isNew && (
                        <ModifiedRowIndicator>MOD</ModifiedRowIndicator>
                      )}
                      {row._isDeleted && (
                        <span
                          style={{ color: "#ef4444", fontSize: "0.625rem" }}
                        >
                          DEL
                        </span>
                      )}
                    </td>
                    {columns.map((col) => (
                      <EditableCell
                        key={col}
                        onClick={() =>
                          !row._isDeleted &&
                          handleCellClick(row._rowId, col, row[col])
                        }
                        style={{
                          cursor: row._isDeleted ? "not-allowed" : "pointer",
                          opacity: row._isDeleted ? 0.5 : 1,
                        }}
                      >
                        {editingCell?.rowId === row._rowId &&
                        editingCell?.column === col ? (
                          <EditInput
                            value={editValue}
                            onChange={handleCellChange}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                          />
                        ) : (
                          <span
                            style={{
                              color: row[col] === null ? "#6b7280" : undefined,
                            }}
                          >
                            {row[col] === null
                              ? "NULL"
                              : formatDisplayValue(row[col])}
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
                        textAlign: "center",
                        padding: "2rem",
                        color: "#6b7280",
                      }}
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </EditableTable>
          )}

          {totalPages > 1 && (
            <PaginationControls>
              <PageButton
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
              >
                Previous
              </PageButton>
              <PageInfo>
                Page {page + 1} of {totalPages}
              </PageInfo>
              <PageButton
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || isLoading}
              >
                Next
              </PageButton>
            </PaginationControls>
          )}
        </TableEditorContent>
      )}

      {/* Columns Tab */}
      {activeTab === 1 && (
        <TableEditorContent>
          <EditableTable>
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Type</th>
                <th>Nullable</th>
                <th>Default</th>
                <th>Primary Key</th>
                <th style={{ width: "60px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableDetails?.columns?.map((col) => (
                <tr key={col.name}>
                  <td style={{ fontWeight: 500 }}>{col.name}</td>
                  <td
                    style={{
                      color: "#6b7280",
                      fontFamily: "monospace",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {col.type}
                  </td>
                  <td>{col.nullable ? "Yes" : "No"}</td>
                  <td
                    style={{
                      color: "#6b7280",
                      fontFamily: "monospace",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {col.defaultValue || "-"}
                  </td>
                  <td>
                    {col.isPrimaryKey && (
                      <span style={{ color: "#f59e0b", fontWeight: 500 }}>
                        Yes
                      </span>
                    )}
                    {!col.isPrimaryKey && "-"}
                  </td>
                  <td>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnMenuOpen(e, col)}
                      disabled={col.isPrimaryKey}
                    >
                      <MoreVertIcon sx={{ fontSize: "1rem" }} />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </EditableTable>

          <Menu
            anchorEl={columnMenuAnchor?.el}
            open={Boolean(columnMenuAnchor)}
            onClose={handleColumnMenuClose}
          >
            <MenuItem
              onClick={() =>
                columnMenuAnchor && handleEditColumn(columnMenuAnchor.column)
              }
            >
              <EditIcon sx={{ fontSize: "1rem", mr: 1 }} />
              Edit Column
            </MenuItem>
            <MenuItem
              onClick={() =>
                columnMenuAnchor && handleDeleteColumn(columnMenuAnchor.column)
              }
              sx={{ color: "error.main" }}
            >
              <DeleteIcon sx={{ fontSize: "1rem", mr: 1 }} />
              Delete Column
            </MenuItem>
          </Menu>
        </TableEditorContent>
      )}

      <DialogFooter>
        <CancelButton onClick={handleClose}>Close</CancelButton>
        {activeTab === 0 && (
          <SubmitButton
            onClick={handleSave}
            disabled={pendingChanges === 0}
            startIcon={
              isLoading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
          >
            Save {pendingChanges > 0 ? `(${pendingChanges})` : ""}
          </SubmitButton>
        )}
      </DialogFooter>

      {/* Confirm Delete Rows Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedRows.size} row(s)?
          {rows.some((r) => selectedRows.has(r._rowId) && !r._isNew) && (
            <p style={{ color: "#ef4444", marginTop: "0.5rem" }}>
              This will execute DELETE queries when you save changes.
            </p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <DeleteButton onClick={confirmDelete}>Delete</DeleteButton>
        </DialogActions>
      </Dialog>

      {/* Edit Column Dialog */}
      <Dialog
        open={editColumnDialogOpen}
        onClose={() => setEditColumnDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Column: {selectedColumn?.name}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormGroup>
            <FormLabel>Column Name</FormLabel>
            <StyledTextField
              fullWidth
              value={columnModifications.newName || ""}
              onChange={(e) =>
                setColumnModifications((prev) => ({
                  ...prev,
                  newName: e.target.value,
                }))
              }
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Data Type</FormLabel>
            <StyledSelect
              fullWidth
              value={columnModifications.type || selectedColumn?.type || ""}
              onChange={(e) =>
                setColumnModifications((prev) => ({
                  ...prev,
                  type: e.target.value as string,
                }))
              }
            >
              {dataTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
              {/* Include current type if not in list */}
              {selectedColumn?.type &&
                !([...dataTypes] as string[]).includes(selectedColumn.type) && (
                  <MenuItem value={selectedColumn.type}>
                    {selectedColumn.type}
                  </MenuItem>
                )}
            </StyledSelect>
          </FormGroup>
          <FormRow>
            <FormGroup>
              <FormLabel>Default Value</FormLabel>
              <StyledTextField
                fullWidth
                value={columnModifications.defaultValue || ""}
                onChange={(e) =>
                  setColumnModifications((prev) => ({
                    ...prev,
                    defaultValue: e.target.value,
                  }))
                }
                placeholder="NULL"
              />
            </FormGroup>
            <FormGroup>
              <CheckboxLabel>
                <Checkbox
                  checked={
                    columnModifications.nullable ??
                    selectedColumn?.nullable ??
                    true
                  }
                  onChange={(e) =>
                    setColumnModifications((prev) => ({
                      ...prev,
                      nullable: e.target.checked,
                    }))
                  }
                />
                <span>Nullable</span>
              </CheckboxLabel>
            </FormGroup>
          </FormRow>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CancelButton onClick={() => setEditColumnDialogOpen(false)}>
            Cancel
          </CancelButton>
          <SubmitButton
            onClick={handleSaveColumnChanges}
            disabled={isModifying}
            startIcon={
              isModifying ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
          >
            Save Changes
          </SubmitButton>
        </DialogActions>
      </Dialog>

      {/* Delete Column Dialog */}
      <Dialog
        open={deleteColumnDialogOpen}
        onClose={() => setDeleteColumnDialogOpen(false)}
      >
        <DialogTitle>Delete Column</DialogTitle>
        <DialogContent>
          <p>
            Are you sure you want to delete the column{" "}
            <strong>{selectedColumn?.name}</strong>?
          </p>
          <p style={{ color: "#ef4444", marginTop: "0.5rem" }}>
            This action cannot be undone. All data in this column will be
            permanently deleted.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteColumnDialogOpen(false)}>
            Cancel
          </Button>
          <DeleteButton
            onClick={handleConfirmDeleteColumn}
            disabled={isDropping}
          >
            {isDropping ? "Deleting..." : "Delete Column"}
          </DeleteButton>
        </DialogActions>
      </Dialog>
    </StyledDialog>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (value instanceof Date) return value.toISOString();
    return JSON.stringify(value);
  }
  return String(value);
}
