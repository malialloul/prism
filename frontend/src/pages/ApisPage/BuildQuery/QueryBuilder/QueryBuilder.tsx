import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
  Chip,
  Paper,
  Tabs,
  Tab,
  Typography,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  ButtonGroup,
  Menu,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Save as SaveIcon,
  DragIndicator as DragIcon,
  FilterList as FilterIcon,
  Functions as FunctionsIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Link as LinkIcon,
  Storage as StorageIcon,
  ViewColumn as ColumnIcon,
  ArrowUpward as SortAscIcon,
  ArrowDownward as SortDescIcon,
  GroupWork as GroupIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  GridOn as GridIcon,
  AutoFixHigh as AutoArrangeIcon,
  Map as MinimapIcon,
  CallMerge as JoinIcon,
  CheckCircle as IncludeIcon,
  Cancel as ExcludeIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import { useFullSchema } from "../../../../api/entities/schema/useFullSchema";
import { useExecuteQuery } from "../../../../api/entities/schema/useExecuteQuery";
import { SAVED_QUERIES_KEY } from "../../../../api/entities/schema/useSavedQueries";
import { DATABASES_QUERY_KEY } from "../../../../api/entities/databases";
import { SchemaService } from "../../../../api/services/SchemaService";
import { SaveApiDialog } from "./components/SaveApiDialog";
import {
  Header,
  Title,
  SaveButton,
  EmptyStateMessage,
} from "./QueryBuilder.styles";
import type { TableConnection } from "./QueryBuilder.types";

// ============================================================================
// TYPES
// ============================================================================

interface QueryBuilderProps {
  connectedDatabase: { id: string | number; name: string } | null;
  onApiSaved?: () => void;
}

interface TablePosition {
  x: number;
  y: number;
}

interface SelectedTable {
  id: string;
  name: string;
  columns: Array<{ name: string; type: string }>;
}

interface SelectedField {
  tableId: string;
  columnName: string;
  columnType?: string;
  aggregation?: "count" | "sum" | "avg" | "min" | "max" | null;
  sortOrder?: "asc" | "desc" | null;
  distinct?: boolean;
  alias?: string;
}

interface VisualFilter {
  id: string;
  tableId: string;
  columnName: string;
  columnType: string;
  operator: string;
  value: string | number | string[] | [number, number];
  isParameter?: boolean;
  parameterName?: string;
}

interface ReferenceFilter {
  id: string;
  sourceTableId: string;
  sourceColumn: string;
  targetTableId: string;
  targetColumn: string;
  filterType: "include" | "exclude";
}

interface ComputedField {
  id: string;
  name: string; // alias for the computed field
  expression: {
    leftTableId: string;
    leftColumn: string;
    leftColumnType?: string;
    operator: "*" | "+" | "-" | "/";
    rightTableId: string;
    rightColumn: string;
    rightColumnType?: string;
  };
  aggregation?: "count" | "sum" | "avg" | "min" | "max" | null;
}

interface GroupingRule {
  tableId: string;
  columnName: string;
}

type ConnectionMode = "none" | "join" | "include" | "exclude";

// ============================================================================
// CONSTANTS
// ============================================================================

const CANVAS_WIDTH = 3000;
const CANVAS_HEIGHT = 2000;
const TABLE_WIDTH = 280;
const TABLE_HEIGHT = 400;
const GRID_SIZE = 20;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getOperatorLabel = (op: string): string => {
  const labels: Record<string, string> = {
    equals: "=",
    not_equals: "≠",
    contains: "∋",
    starts_with: "A..",
    ends_with: "..Z",
    gt: ">",
    lt: "<",
    gte: "≥",
    lte: "≤",
    between: "↔",
    is_null: "∅",
    is_not_null: "≠∅",
  };
  return labels[op] || op;
};

const getAggLabel = (agg: string): string => {
  const labels: Record<string, string> = {
    count: "COUNT",
    sum: "SUM",
    avg: "AVG",
    min: "MIN",
    max: "MAX",
  };
  return labels[agg] || agg;
};

const getSqlOperator = (op: string): string => {
  const ops: Record<string, string> = {
    equals: "=",
    not_equals: "<>",
    contains: "LIKE",
    starts_with: "LIKE",
    ends_with: "LIKE",
    gt: ">",
    lt: "<",
    gte: ">=",
    lte: "<=",
    between: "BETWEEN",
    is_null: "IS NULL",
    is_not_null: "IS NOT NULL",
  };
  return ops[op] || "=";
};

const formatSqlValue = (op: string, value: any): string => {
  if (op === "is_null" || op === "is_not_null") return "";
  if (op === "contains") return `'%${value}%'`;
  if (op === "starts_with") return `'${value}%'`;
  if (op === "ends_with") return `'%${value}'`;
  if (op === "between" && Array.isArray(value))
    return `${value[0]} AND ${value[1]}`;
  if (typeof value === "string") return `'${value}'`;
  return String(value);
};

const snapToGrid = (value: number): number =>
  Math.round(value / GRID_SIZE) * GRID_SIZE;

// Helper to check if two column types are compatible for joining
const areTypesCompatible = (
  type1: string | undefined,
  type2: string | undefined,
): boolean => {
  if (!type1 || !type2) return true; // Unknown types - allow and let DB handle it

  const normalizeType = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes("uuid")) return "uuid";
    if (t.includes("int") || t.includes("serial")) return "integer";
    if (t.includes("char") || t.includes("text")) return "text";
    if (t.includes("bool")) return "boolean";
    if (t.includes("date") || t.includes("time")) return "datetime";
    if (
      t.includes("numeric") ||
      t.includes("decimal") ||
      t.includes("float") ||
      t.includes("double") ||
      t.includes("real")
    )
      return "numeric";
    return t;
  };

  const norm1 = normalizeType(type1);
  const norm2 = normalizeType(type2);

  // Same type family is compatible
  if (norm1 === norm2) return true;

  // Integer and numeric are compatible
  if (
    (norm1 === "integer" && norm2 === "numeric") ||
    (norm1 === "numeric" && norm2 === "integer")
  )
    return true;

  // Text types can be compared with most things (DB will handle conversion)
  if (norm1 === "text" || norm2 === "text") return true;

  return false;
};

// Generate JOIN condition - simple equality, no auto-casting
const generateJoinCondition = (
  sourceTable: string,
  sourceColumn: string,
  targetTable: string,
  targetColumn: string,
): string => {
  return `${sourceTable}.${sourceColumn} = ${targetTable}.${targetColumn}`;
};

// Helper to check if an aggregation is valid for a column type
const isAggregationValidForType = (
  aggregation: string | null | undefined,
  columnType: string | undefined,
): boolean => {
  if (!aggregation || !columnType) return true; // Unknown - let DB handle it

  const t = columnType.toLowerCase();

  // COUNT works on any type
  if (aggregation === "count") return true;

  // MIN/MAX work on any comparable type (numbers, strings, dates)
  if (aggregation === "min" || aggregation === "max") return true;

  // SUM/AVG only work on numeric types
  if (aggregation === "sum" || aggregation === "avg") {
    const numericTypes = [
      "int",
      "integer",
      "smallint",
      "bigint",
      "tinyint",
      "serial",
      "bigserial",
      "decimal",
      "numeric",
      "float",
      "double",
      "real",
      "money",
      "smallmoney",
    ];
    return numericTypes.some((nt) => t.includes(nt));
  }

  return true;
};

// Get friendly type name for error messages
const getFriendlyTypeName = (type: string | undefined): string => {
  if (!type) return "unknown";
  const t = type.toLowerCase();
  if (t.includes("uuid")) return "UUID";
  if (t.includes("int") || t.includes("serial")) return "integer";
  if (t.includes("char") || t.includes("text")) return "text";
  if (t.includes("bool")) return "boolean";
  if (t.includes("date")) return "date";
  if (t.includes("time")) return "timestamp";
  if (t.includes("numeric") || t.includes("decimal")) return "decimal";
  if (t.includes("float") || t.includes("double") || t.includes("real"))
    return "float";
  if (t.includes("json")) return "JSON";
  return type;
};

// ============================================================================
// CONNECTION BUTTON COMPONENT (Replaces small dots)
// ============================================================================

interface ConnectionButtonProps {
  type: "join" | "include" | "exclude";
  connected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  type,
  connected,
  onClick,
  disabled,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const config = {
    join: {
      icon: <JoinIcon sx={{ fontSize: 14 }} />,
      color: "#2196F3",
      bgColor: isDark ? "rgba(33, 150, 243, 0.15)" : "#e3f2fd",
      label: "+",
      tooltip: "Combine: Merge data from both tables where values match",
    },
    include: {
      icon: <IncludeIcon sx={{ fontSize: 14 }} />,
      color: "#4CAF50",
      bgColor: isDark ? "rgba(76, 175, 80, 0.15)" : "#e8f5e9",
      label: "✓",
      tooltip: "Keep: Only show rows that have a match in the other table",
    },
    exclude: {
      icon: <ExcludeIcon sx={{ fontSize: 14 }} />,
      color: "#f44336",
      bgColor: isDark ? "rgba(244, 67, 54, 0.15)" : "#ffebee",
      label: "✗",
      tooltip: "Remove: Hide rows that have a match in the other table",
    },
  };

  const { color, bgColor, label, tooltip } = config[type];

  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Button
        size="small"
        variant={connected ? "contained" : "outlined"}
        onClick={onClick}
        disabled={disabled}
        sx={{
          minWidth: 28,
          width: 28,
          height: 28,
          p: 0,
          fontSize: "0.85rem",
          fontWeight: 700,
          borderColor: color,
          color: connected ? "white" : color,
          backgroundColor: connected ? color : "transparent",
          borderRadius: "50%",
          "&:hover": {
            backgroundColor: connected ? color : bgColor,
            borderColor: color,
          },
          "&.Mui-disabled": {
            borderColor: "#ccc",
            color: "#ccc",
          },
        }}
      >
        {label}
      </Button>
    </Tooltip>
  );
};

// ============================================================================
// FIELD ROW COMPONENT
// ============================================================================

interface FieldRowProps {
  tableId: string;
  field: { name: string; type: string };
  isSelected: boolean;
  hasFilter: boolean;
  hasAggregation: string | null;
  sortOrder: "asc" | "desc" | null;
  isGrouped: boolean;
  alias?: string;
  hasDuplicateName: boolean;
  connectionMode: ConnectionMode;
  connectingFrom: {
    tableId: string;
    column: string;
    columnType: string;
  } | null;
  onSelect: () => void;
  onStartConnection: (mode: ConnectionMode) => void;
  onCompleteConnection: () => void;
  onToggleSort: (order: "asc" | "desc") => void;
  onOpenFilter: () => void;
  onOpenAggregation: () => void;
  onToggleGroup: () => void;
  onSetAlias: (alias: string) => void;
  hasExistingJoin: boolean;
  hasExistingInclude: boolean;
  hasExistingExclude: boolean;
  alreadyConnectedWithSource: boolean;
}

const FieldRow: React.FC<FieldRowProps> = ({
  tableId,
  field,
  isSelected,
  hasFilter,
  hasAggregation,
  sortOrder,
  isGrouped,
  alias,
  hasDuplicateName,
  connectionMode,
  connectingFrom,
  onSelect,
  onStartConnection,
  onCompleteConnection,
  onToggleSort,
  onOpenFilter,
  onOpenAggregation,
  onToggleGroup,
  onSetAlias,
  hasExistingJoin,
  hasExistingInclude,
  hasExistingExclude,
  alreadyConnectedWithSource,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isConnectTarget =
    connectionMode !== "none" && connectingFrom?.tableId !== tableId;
  const isConnectSource =
    connectingFrom?.tableId === tableId &&
    connectingFrom?.column === field.name;

  return (
    <Box
      onClick={onSelect}
      sx={{
        p: 1,
        borderRadius: 1.5,
        backgroundColor: isConnectSource
          ? connectionMode === "join"
            ? isDark
              ? "rgba(33, 150, 243, 0.15)"
              : "#e3f2fd"
            : connectionMode === "include"
              ? isDark
                ? "rgba(76, 175, 80, 0.15)"
                : "#e8f5e9"
              : isDark
                ? "rgba(244, 67, 54, 0.15)"
                : "#ffebee"
          : isSelected
            ? isDark
              ? "rgba(124, 77, 255, 0.15)"
              : "#f3f0ff"
            : isDark
              ? "#1a1f35"
              : "#fff",
        border: `2px solid ${
          isConnectSource
            ? connectionMode === "join"
              ? "#2196F3"
              : connectionMode === "include"
                ? "#4CAF50"
                : "#f44336"
            : isSelected
              ? "#7c4dff"
              : isDark
                ? "#334155"
                : "#e0e0e0"
        }`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: isConnectTarget
            ? connectionMode === "join"
              ? isDark
                ? "rgba(33, 150, 243, 0.25)"
                : "#bbdefb"
              : connectionMode === "include"
                ? isDark
                  ? "rgba(76, 175, 80, 0.25)"
                  : "#c8e6c9"
                : isDark
                  ? "rgba(244, 67, 54, 0.25)"
                  : "#ffcdd2"
            : isDark
              ? "#252b42"
              : "#f5f5f5",
          transform: isConnectTarget ? "scale(1.02)" : "none",
          borderColor: isConnectTarget
            ? connectionMode === "join"
              ? "#2196F3"
              : connectionMode === "include"
                ? "#4CAF50"
                : "#f44336"
            : isDark
              ? "#475569"
              : "#bbb",
        },
      }}
    >
      {/* Field Name & Type */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.75,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: isSelected ? 600 : 500,
              color: isSelected ? "#7c4dff" : isDark ? "#f1f5f9" : "#333",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {field.name}
          </Typography>
          <Chip
            label={field.type}
            size="small"
            sx={{
              height: 18,
              fontSize: "0.6rem",
              backgroundColor: isDark ? "#252b42" : "#f5f5f5",
              color: isDark ? "#94a3b8" : "#666",
            }}
          />
        </Box>

        {/* Status Indicators */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {hasAggregation && (
            <Chip
              label={hasAggregation}
              size="small"
              color="secondary"
              sx={{ height: 18, fontSize: "0.55rem" }}
            />
          )}
          {isGrouped && (
            <Chip
              label="GRP"
              size="small"
              sx={{
                height: 18,
                fontSize: "0.55rem",
                backgroundColor: "#ff5722",
                color: "white",
              }}
            />
          )}
          {hasFilter && (
            <Chip
              label="FILTER"
              size="small"
              sx={{
                height: 18,
                fontSize: "0.55rem",
                backgroundColor: "#ff9800",
                color: "white",
              }}
            />
          )}
        </Box>
      </Box>

      {/* Connection Target Hint */}
      {isConnectTarget && (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            if (!alreadyConnectedWithSource) {
              onCompleteConnection();
            }
          }}
          sx={{
            mb: 0.75,
            p: 0.75,
            borderRadius: 1,
            backgroundColor: alreadyConnectedWithSource
              ? "#9e9e9e"
              : connectionMode === "join"
                ? "#2196F3"
                : connectionMode === "include"
                  ? "#4CAF50"
                  : "#f44336",
            color: "white",
            textAlign: "center",
            cursor: alreadyConnectedWithSource ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "0.75rem",
            transition: "all 0.2s",
            opacity: alreadyConnectedWithSource ? 0.7 : 1,
            "&:hover": alreadyConnectedWithSource ? {} : {
              transform: "scale(1.02)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            },
          }}
        >
          {alreadyConnectedWithSource ? "🔗 Already connected" : "👆 Click to connect here"}
        </Box>
      )}

      {/* Connection Buttons - Only show when NOT in connection mode */}
      {connectionMode === "none" && (
        <Box sx={{ display: "flex", gap: 0.5, mb: 0.75 }}>
          <ConnectionButton
            type="join"
            connected={hasExistingJoin}
            onClick={() => onStartConnection("join")}
          />
          <ConnectionButton
            type="include"
            connected={hasExistingInclude}
            onClick={() => onStartConnection("include")}
          />
          <ConnectionButton
            type="exclude"
            connected={hasExistingExclude}
            onClick={() => onStartConnection("exclude")}
          />
        </Box>
      )}

      {/* Field Actions (when selected) */}
      {isSelected && connectionMode === "none" && (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            pt: 0.5,
            borderTop: `1px solid ${isDark ? "#334155" : "#eee"}`,
            mt: 0.5,
          }}
        >
          <Tooltip title="Sort Ascending">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSort("asc");
              }}
              sx={{
                p: 0.5,
                backgroundColor:
                  sortOrder === "asc"
                    ? "#2196F3"
                    : isDark
                      ? "#1a1f35"
                      : "#f5f5f5",
                color:
                  sortOrder === "asc" ? "white" : isDark ? "#94a3b8" : "#666",
                "&:hover": {
                  backgroundColor:
                    sortOrder === "asc"
                      ? "#1976d2"
                      : isDark
                        ? "#252b42"
                        : "#e0e0e0",
                },
              }}
            >
              <SortAscIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sort Descending">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSort("desc");
              }}
              sx={{
                p: 0.5,
                backgroundColor:
                  sortOrder === "desc"
                    ? "#2196F3"
                    : isDark
                      ? "#1a1f35"
                      : "#f5f5f5",
                color:
                  sortOrder === "desc" ? "white" : isDark ? "#94a3b8" : "#666",
                "&:hover": {
                  backgroundColor:
                    sortOrder === "desc"
                      ? "#1976d2"
                      : isDark
                        ? "#252b42"
                        : "#e0e0e0",
                },
              }}
            >
              <SortDescIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Filter">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFilter();
              }}
              sx={{
                p: 0.5,
                backgroundColor: hasFilter
                  ? "#ff9800"
                  : isDark
                    ? "#1a1f35"
                    : "#f5f5f5",
                color: hasFilter ? "white" : isDark ? "#94a3b8" : "#666",
                "&:hover": {
                  backgroundColor: hasFilter
                    ? "#f57c00"
                    : isDark
                      ? "#252b42"
                      : "#e0e0e0",
                },
              }}
            >
              <FilterIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Calculate (Sum, Avg, etc.)">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAggregation();
              }}
              sx={{
                p: 0.5,
                backgroundColor: hasAggregation
                  ? "#9c27b0"
                  : isDark
                    ? "#1a1f35"
                    : "#f5f5f5",
                color: hasAggregation ? "white" : isDark ? "#94a3b8" : "#666",
                "&:hover": {
                  backgroundColor: hasAggregation
                    ? "#7b1fa2"
                    : isDark
                      ? "#252b42"
                      : "#e0e0e0",
                },
              }}
            >
              <FunctionsIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Group By">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleGroup();
              }}
              sx={{
                p: 0.5,
                backgroundColor: isGrouped
                  ? "#ff5722"
                  : isDark
                    ? "#1a1f35"
                    : "#f5f5f5",
                color: isGrouped ? "white" : isDark ? "#94a3b8" : "#666",
                "&:hover": {
                  backgroundColor: isGrouped
                    ? "#e64a19"
                    : isDark
                      ? "#252b42"
                      : "#e0e0e0",
                },
              }}
            >
              <GroupIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Duplicate Column Warning & Alias Input */}
      {isSelected && hasDuplicateName && connectionMode === "none" && (
        <Box
          sx={{
            mt: 0.75,
            pt: 0.75,
            borderTop: `1px solid ${isDark ? "#334155" : "#eee"}`,
          }}
        >
          <Alert
            severity="warning"
            sx={{
              py: 0.25,
              px: 1,
              fontSize: "0.7rem",
              "& .MuiAlert-icon": { fontSize: 16, mr: 0.5 },
              "& .MuiAlert-message": { py: 0 },
            }}
          >
            Same column name exists in another table. Add an alias to
            distinguish them in results.
          </Alert>
          <TextField
            size="small"
            placeholder="Enter alias (e.g., user_id)"
            value={alias || ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onSetAlias(e.target.value)}
            sx={{
              mt: 0.75,
              width: "100%",
              "& .MuiInputBase-input": {
                fontSize: "0.75rem",
                py: 0.5,
                px: 1,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// TABLE CARD COMPONENT
// ============================================================================

interface TableCardComponentProps {
  table: SelectedTable;
  position: TablePosition;
  selectedFields: SelectedField[];
  visualFilters: VisualFilter[];
  groupingRules: GroupingRule[];
  tableConnections: TableConnection[];
  referenceFilters: ReferenceFilter[];
  connectionMode: ConnectionMode;
  connectingFrom: {
    tableId: string;
    column: string;
    columnType: string;
  } | null;
  onDragStart: (e: React.MouseEvent) => void;
  onRemove: () => void;
  onFieldSelect: (columnName: string, columnType: string) => void;
  onStartConnection: (
    column: string,
    columnType: string,
    mode: ConnectionMode,
  ) => void;
  onCompleteConnection: (column: string, columnType: string) => void;
  onToggleSort: (columnName: string, order: "asc" | "desc") => void;
  onOpenFilter: (columnName: string, type: string) => void;
  onOpenAggregation: (columnName: string, columnType: string) => void;
  onToggleGroup: (columnName: string) => void;
  onSetAlias: (columnName: string, alias: string) => void;
  duplicateColumnNames: Set<string>;
}

const TableCardComponent: React.FC<TableCardComponentProps> = ({
  table,
  position,
  selectedFields,
  visualFilters,
  groupingRules,
  tableConnections,
  referenceFilters,
  connectionMode,
  connectingFrom,
  onDragStart,
  onRemove,
  onFieldSelect,
  onStartConnection,
  onCompleteConnection,
  onToggleSort,
  onOpenFilter,
  onOpenAggregation,
  onToggleGroup,
  onSetAlias,
  duplicateColumnNames,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const selectedFieldsInTable = selectedFields.filter(
    (f) => f.tableId === table.id,
  );
  const hasConnectionFromThis = connectingFrom?.tableId === table.id;
  const isTargetCandidate = connectionMode !== "none" && !hasConnectionFromThis;

  return (
    <Paper
      elevation={isTargetCandidate ? 8 : 3}
      sx={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: TABLE_WIDTH,
        maxHeight: TABLE_HEIGHT,
        borderRadius: 2,
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
        backgroundColor: isDark ? "#1a1f35" : "#fff",
        border: isTargetCandidate
          ? `3px dashed ${connectionMode === "join" ? "#2196F3" : connectionMode === "include" ? "#4CAF50" : "#f44336"}`
          : hasConnectionFromThis
            ? `3px solid ${connectionMode === "join" ? "#2196F3" : connectionMode === "include" ? "#4CAF50" : "#f44336"}`
            : `1px solid ${isDark ? "#334155" : "#e0e0e0"}`,
        transform: isTargetCandidate ? "scale(1.02)" : "scale(1)",
      }}
    >
      {/* Table Header */}
      <Box
        onMouseDown={onDragStart}
        sx={{
          p: 1.5,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          gap: 1,
          "&:active": { cursor: "grabbing" },
        }}
      >
        <DragIcon sx={{ fontSize: 20, opacity: 0.8 }} />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, lineHeight: 1.2 }}
          >
            {table.name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {table.columns.length} columns • {selectedFieldsInTable.length}{" "}
            selected
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{ color: "white", p: 0.5 }}
        >
          <MoreIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              onRemove();
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Remove Table</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Connection Mode Hint for this table */}
      {isTargetCandidate && (
        <Box
          sx={{
            p: 1,
            backgroundColor:
              connectionMode === "join"
                ? isDark
                  ? "rgba(33, 150, 243, 0.15)"
                  : "#e3f2fd"
                : connectionMode === "include"
                  ? isDark
                    ? "rgba(76, 175, 80, 0.15)"
                    : "#e8f5e9"
                  : isDark
                    ? "rgba(244, 67, 54, 0.15)"
                    : "#ffebee",
            borderBottom: `1px solid ${isDark ? "#334155" : "#e0e0e0"}`,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            👇 Select a field below to connect
          </Typography>
        </Box>
      )}

      {/* Fields List */}
      <Box
        sx={{
          p: 1,
          maxHeight: 320,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
        }}
      >
        {table.columns.slice(0, 15).map((field) => {
          const fieldData = selectedFields.find(
            (f) => f.tableId === table.id && f.columnName === field.name,
          );
          const isSelected = !!fieldData;
          const hasFilter = visualFilters.some(
            (f) => f.tableId === table.id && f.columnName === field.name,
          );
          const isGrouped = groupingRules.some(
            (g) => g.tableId === table.id && g.columnName === field.name,
          );

          const hasExistingJoin = tableConnections.some(
            (c) =>
              (c.sourceTableId === table.id && c.sourceColumn === field.name) ||
              (c.targetTableId === table.id && c.targetColumn === field.name),
          );
          const hasExistingInclude = referenceFilters.some(
            (r) =>
              r.filterType === "include" &&
              ((r.sourceTableId === table.id &&
                r.sourceColumn === field.name) ||
                (r.targetTableId === table.id &&
                  r.targetColumn === field.name)),
          );
          const hasExistingExclude = referenceFilters.some(
            (r) =>
              r.filterType === "exclude" &&
              ((r.sourceTableId === table.id &&
                r.sourceColumn === field.name) ||
                (r.targetTableId === table.id &&
                  r.targetColumn === field.name)),
          );

          // Check if this field is already connected with the source field being dragged
          const alreadyConnectedWithSource = connectingFrom
            ? (connectionMode === "join"
                ? tableConnections.some(
                    (c) =>
                      (c.sourceTableId === connectingFrom.tableId &&
                        c.sourceColumn === connectingFrom.column &&
                        c.targetTableId === table.id &&
                        c.targetColumn === field.name) ||
                      (c.sourceTableId === table.id &&
                        c.sourceColumn === field.name &&
                        c.targetTableId === connectingFrom.tableId &&
                        c.targetColumn === connectingFrom.column)
                  )
                : referenceFilters.some(
                    (r) =>
                      (r.sourceTableId === connectingFrom.tableId &&
                        r.sourceColumn === connectingFrom.column &&
                        r.targetTableId === table.id &&
                        r.targetColumn === field.name) ||
                      (r.sourceTableId === table.id &&
                        r.sourceColumn === field.name &&
                        r.targetTableId === connectingFrom.tableId &&
                        r.targetColumn === connectingFrom.column)
                  ))
            : false;

          return (
            <FieldRow
              key={field.name}
              tableId={table.id}
              field={field}
              isSelected={isSelected}
              hasFilter={hasFilter}
              hasAggregation={fieldData?.aggregation || null}
              sortOrder={fieldData?.sortOrder || null}
              isGrouped={isGrouped}
              alias={fieldData?.alias}
              hasDuplicateName={duplicateColumnNames.has(field.name)}
              connectionMode={connectionMode}
              connectingFrom={connectingFrom}
              onSelect={() => onFieldSelect(field.name, field.type)}
              onStartConnection={(mode) =>
                onStartConnection(field.name, field.type, mode)
              }
              onCompleteConnection={() =>
                onCompleteConnection(field.name, field.type)
              }
              onToggleSort={(order) => onToggleSort(field.name, order)}
              onOpenFilter={() => onOpenFilter(field.name, field.type)}
              onOpenAggregation={() =>
                onOpenAggregation(field.name, field.type)
              }
              onToggleGroup={() => onToggleGroup(field.name)}
              onSetAlias={(alias) => onSetAlias(field.name, alias)}
              hasExistingJoin={hasExistingJoin}
              hasExistingInclude={hasExistingInclude}
              hasExistingExclude={hasExistingExclude}
              alreadyConnectedWithSource={alreadyConnectedWithSource}
            />
          );
        })}
        {table.columns.length > 15 && (
          <Typography
            variant="caption"
            sx={{
              color: isDark ? "#64748b" : "#999",
              textAlign: "center",
              py: 0.5,
            }}
          >
            +{table.columns.length - 15} more columns
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

// ============================================================================
// MINIMAP COMPONENT
// ============================================================================

interface MinimapProps {
  tables: SelectedTable[];
  positions: Record<string, TablePosition>;
  scrollLeft: number;
  scrollTop: number;
  containerWidth: number;
  containerHeight: number;
  onNavigate: (x: number, y: number) => void;
}

const Minimap: React.FC<MinimapProps> = ({
  tables,
  positions,
  scrollLeft,
  scrollTop,
  containerWidth,
  containerHeight,
  onNavigate,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const scale = 0.05;
  const minimapWidth = CANVAS_WIDTH * scale;
  const minimapHeight = CANVAS_HEIGHT * scale;

  const viewportWidth = containerWidth * scale;
  const viewportHeight = containerHeight * scale;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / scale;
    const clickY = (e.clientY - rect.top) / scale;
    onNavigate(clickX - containerWidth / 2, clickY - containerHeight / 2);
  };

  return (
    <Paper
      elevation={3}
      onClick={handleClick}
      sx={{
        position: "absolute",
        bottom: 16,
        left: 16,
        width: minimapWidth,
        height: minimapHeight,
        backgroundColor: isDark ? "#1a1f35" : "#f5f5f5",
        border: `1px solid ${isDark ? "#334155" : "#ccc"}`,
        borderRadius: 1,
        overflow: "hidden",
        cursor: "pointer",
        zIndex: 100,
      }}
    >
      {/* Tables */}
      {tables.map((t) => {
        const pos = positions[t.id];
        if (!pos) return null;
        return (
          <Box
            key={t.id}
            sx={{
              position: "absolute",
              left: pos.x * scale,
              top: pos.y * scale,
              width: TABLE_WIDTH * scale,
              height: 60 * scale,
              backgroundColor: "#667eea",
              borderRadius: 0.5,
            }}
          />
        );
      })}

      {/* Viewport indicator */}
      <Box
        sx={{
          position: "absolute",
          left: scrollLeft * scale,
          top: scrollTop * scale,
          width: viewportWidth,
          height: viewportHeight,
          border: "2px solid #f44336",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
        }}
      />
    </Paper>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function QueryBuilder({ connectedDatabase, onApiSaved }: QueryBuilderProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const databaseId = connectedDatabase?.id ? Number(connectedDatabase.id) : 0;
  const queryClient = useQueryClient();

  const { data: schemaData, isLoading: schemaLoading } = useFullSchema(
    databaseId || undefined,
  );

  const { mutateAsync: executeQuery, isPending: isExecuting } = useExecuteQuery(
    databaseId,
    {
      onError: (error) => {
        setApiTestResult({
          success: false,
          status: error.status || 500,
          rowCount: 0,
          executionTime: "0ms",
          timestamp: new Date().toLocaleTimeString(),
          error: error.message || "Query execution failed",
        });
        setPreviewLoading(false);
      },
    },
  );

  // Canvas State
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 800,
    height: 600,
  });
  const [scrollPosition, setScrollPosition] = useState({ left: 0, top: 0 });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);

  // Dragging State
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Tables & Positions
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([]);
  const [tablePositions, setTablePositions] = useState<
    Record<string, TablePosition>
  >({});
  const [tableConnections, setTableConnections] = useState<TableConnection[]>(
    [],
  );

  // Fields & Aggregations
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [groupingRules, setGroupingRules] = useState<GroupingRule[]>([]);

  // Filters & References
  const [visualFilters, setVisualFilters] = useState<VisualFilter[]>([]);
  const [referenceFilters, setReferenceFilters] = useState<ReferenceFilter[]>(
    [],
  );

  // Connection Mode State
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("none");
  const [connectingFrom, setConnectingFrom] = useState<{
    tableId: string;
    column: string;
    columnType: string;
  } | null>(null);

  // Dialogs
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [addTableDialogOpen, setAddTableDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [aggDialogOpen, setAggDialogOpen] = useState(false);
  const [testResultsOpen, setTestResultsOpen] = useState(false);

  // Add Table Dialog State
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [tablesToAdd, setTablesToAdd] = useState<string[]>([]);

  // Filter Dialog State
  const [filterField, setFilterField] = useState<{
    tableId: string;
    columnName: string;
    type: string;
  } | null>(null);
  const [filterOperator, setFilterOperator] = useState("equals");
  const [filterValue, setFilterValue] = useState("");
  const [filterRangeValue, setFilterRangeValue] = useState<[number, number]>([
    0, 100,
  ]);
  const [filterIsParameter, setFilterIsParameter] = useState(false);
  const [filterParameterName, setFilterParameterName] = useState("");

  // Aggregation Dialog State
  const [aggField, setAggField] = useState<{
    tableId: string;
    columnName: string;
    columnType?: string;
  } | null>(null);
  const [aggType, setAggType] = useState("count");

  // Computed Fields
  const [computedFields, setComputedFields] = useState<ComputedField[]>([]);
  const [computedFieldDialogOpen, setComputedFieldDialogOpen] = useState(false);
  const [computedFieldName, setComputedFieldName] = useState("");
  const [computedLeftTable, setComputedLeftTable] = useState("");
  const [computedLeftColumn, setComputedLeftColumn] = useState("");
  const [computedOperator, setComputedOperator] = useState<
    "*" | "+" | "-" | "/"
  >("*");
  const [computedRightTable, setComputedRightTable] = useState("");
  const [computedRightColumn, setComputedRightColumn] = useState("");
  const [computedAggregation, setComputedAggregation] = useState<
    "sum" | "avg" | "min" | "max" | "count" | ""
  >("sum");

  // Pagination Settings
  const [paginationEnabled, setPaginationEnabled] = useState(false);
  const [defaultPageSize, setDefaultPageSize] = useState(100);
  const [allowPageSizeParam, setAllowPageSizeParam] = useState(true); // Allow pagesize parameter
  const [allowPageCountParam, setAllowPageCountParam] = useState(true); // Allow pagecount (page number) parameter

  // Right Panel & Preview
  const [rightPanelTab, setRightPanelTab] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const [testParamValues, setTestParamValues] = useState<
    Record<string, string>
  >({});

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Sync test parameter values with current filters
  useEffect(() => {
    const currentParamNames = visualFilters
      .filter((f) => f.isParameter && f.parameterName)
      .map((f) => f.parameterName!);

    setTestParamValues((prev) => {
      const updated: Record<string, string> = {};
      // Only keep values for parameters that still exist
      currentParamNames.forEach((name) => {
        updated[name] = prev[name] || "";
      });
      return updated;
    });
  }, [visualFilters]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const tables = useMemo(
    () =>
      schemaData?.tables?.map((t: any) => ({
        id: t.name,
        name: t.name,
        columns: t.columns || [],
      })) || [],
    [schemaData],
  );

  // Detect type mismatches in table connections
  const connectionTypeErrors = useMemo(() => {
    return tableConnections
      .filter(
        (conn) =>
          !areTypesCompatible(conn.sourceColumnType, conn.targetColumnType),
      )
      .map((conn) => ({
        id: conn.id,
        message: `Type mismatch: ${conn.sourceTableId}.${conn.sourceColumn} (${conn.sourceColumnType || "unknown"}) cannot be joined with ${conn.targetTableId}.${conn.targetColumn} (${conn.targetColumnType || "unknown"})`,
        sourceTable: conn.sourceTableId,
        sourceColumn: conn.sourceColumn,
        sourceType: conn.sourceColumnType,
        targetTable: conn.targetTableId,
        targetColumn: conn.targetColumn,
        targetType: conn.targetColumnType,
      }));
  }, [tableConnections]);

  // Detect invalid aggregations (e.g., SUM on UUID)
  const aggregationErrors = useMemo(() => {
    return selectedFields
      .filter(
        (f) =>
          f.aggregation &&
          !isAggregationValidForType(f.aggregation, f.columnType),
      )
      .map((f) => ({
        tableId: f.tableId,
        columnName: f.columnName,
        columnType: f.columnType,
        aggregation: f.aggregation,
        message: `${f.aggregation?.toUpperCase()}() cannot be applied to ${f.tableId}.${f.columnName} (${getFriendlyTypeName(f.columnType)}). ${f.aggregation?.toUpperCase()} only works on numeric columns.`,
      }));
  }, [selectedFields]);

  // Detect computed fields referencing tables not in the query
  const computedFieldErrors = useMemo(() => {
    const errors: { id: string; message: string }[] = [];

    // Check which tables are actually joined (reachable from the primary table)
    const joinedTables = new Set<string>();
    if (selectedTables.length > 0) {
      joinedTables.add(selectedTables[0].id); // Primary table is always included

      // Add tables that are connected via JOINs
      let changed = true;
      while (changed) {
        changed = false;
        tableConnections.forEach((conn) => {
          if (
            joinedTables.has(conn.sourceTableId) &&
            !joinedTables.has(conn.targetTableId)
          ) {
            joinedTables.add(conn.targetTableId);
            changed = true;
          } else if (
            joinedTables.has(conn.targetTableId) &&
            !joinedTables.has(conn.sourceTableId)
          ) {
            joinedTables.add(conn.sourceTableId);
            changed = true;
          }
        });
      }
    }

    computedFields.forEach((cf) => {
      const leftTableInQuery = joinedTables.has(cf.expression.leftTableId);
      const rightTableInQuery = joinedTables.has(cf.expression.rightTableId);

      if (!leftTableInQuery) {
        errors.push({
          id: cf.id,
          message: `Calculated field "${cf.name}" uses table "${cf.expression.leftTableId}" which is not joined in the query. Add the table and create a JOIN.`,
        });
      }
      if (
        !rightTableInQuery &&
        cf.expression.rightTableId !== cf.expression.leftTableId
      ) {
        errors.push({
          id: cf.id,
          message: `Calculated field "${cf.name}" uses table "${cf.expression.rightTableId}" which is not joined in the query. Add the table and create a JOIN.`,
        });
      }
    });

    return errors;
  }, [computedFields, selectedTables, tableConnections]);

  // Combined validation errors
  const hasValidationErrors =
    connectionTypeErrors.length > 0 ||
    aggregationErrors.length > 0 ||
    computedFieldErrors.length > 0;

  const apiEndpoint = useMemo(() => {
    if (selectedTables.length === 0) return "";
    const base = selectedTables.map((t) => t.name).join("-");
    return `/api/v1/custom/${base}${visualFilters.length ? "-filtered" : ""}`;
  }, [selectedTables, visualFilters]);

  const generatedSql = useMemo(() => {
    if (selectedTables.length === 0) return "";

    const lines: string[] = [];

    // SELECT clause
    let selectFields: string[] = [];
    if (selectedFields.length === 0 && computedFields.length === 0) {
      selectFields = ["*"];
    } else {
      // Regular selected fields
      selectFields = selectedFields.map((f) => {
        const tableName = f.tableId;
        const colName = `${tableName}.${f.columnName}`;
        let fieldExpr: string;
        if (f.aggregation) {
          fieldExpr = `${f.aggregation.toUpperCase()}(${colName})`;
        } else if (f.distinct) {
          fieldExpr = `DISTINCT ${colName}`;
        } else {
          fieldExpr = colName;
        }
        // Add alias if specified
        if (f.alias) {
          fieldExpr += ` AS ${f.alias}`;
        }
        return fieldExpr;
      });

      // Computed fields (expressions like quantity * price)
      computedFields.forEach((cf) => {
        const leftCol = `${cf.expression.leftTableId}.${cf.expression.leftColumn}`;
        const rightCol = `${cf.expression.rightTableId}.${cf.expression.rightColumn}`;
        const expr = `${leftCol} ${cf.expression.operator} ${rightCol}`;

        let fieldExpr: string;
        if (cf.aggregation) {
          fieldExpr = `${cf.aggregation.toUpperCase()}(${expr})`;
        } else {
          fieldExpr = expr;
        }
        fieldExpr += ` AS ${cf.name}`;
        selectFields.push(fieldExpr);
      });
    }
    lines.push(`SELECT ${selectFields.join(",\n       ")}`);

    // FROM clause - use first table as primary
    const primaryTable = selectedTables[0].name;
    lines.push(`FROM ${primaryTable}`);

    // JOIN clauses - build a proper join order
    // Track which tables have been added to the query
    const joinedTables = new Set<string>([primaryTable]);

    // Process connections to build JOINs in correct order
    // We need to ensure each JOIN only references tables already in the query
    const remainingConnections = [...tableConnections];
    const maxIterations = remainingConnections.length * 2; // Prevent infinite loops
    let iterations = 0;

    while (remainingConnections.length > 0 && iterations < maxIterations) {
      iterations++;
      let foundConnection = false;

      for (let i = 0; i < remainingConnections.length; i++) {
        const conn = remainingConnections[i];
        const sourceInQuery = joinedTables.has(conn.sourceTableId);
        const targetInQuery = joinedTables.has(conn.targetTableId);

        // Skip if both tables are already joined (redundant connection)
        if (sourceInQuery && targetInQuery) {
          remainingConnections.splice(i, 1);
          foundConnection = true;
          break;
        }

        // Can only process this connection if at least one table is already in the query
        if (!sourceInQuery && !targetInQuery) {
          continue; // Skip for now, try other connections first
        }

        // Generate simple JOIN condition
        const joinCondition = generateJoinCondition(
          conn.sourceTableId,
          conn.sourceColumn,
          conn.targetTableId,
          conn.targetColumn,
        );

        if (sourceInQuery && !targetInQuery) {
          // Source is already in query, join the target table
          lines.push(`INNER JOIN ${conn.targetTableId}`);
          lines.push(`  ON ${joinCondition}`);
          joinedTables.add(conn.targetTableId);
        } else if (targetInQuery && !sourceInQuery) {
          // Target is already in query, join the source table
          lines.push(`INNER JOIN ${conn.sourceTableId}`);
          lines.push(`  ON ${joinCondition}`);
          joinedTables.add(conn.sourceTableId);
        }

        remainingConnections.splice(i, 1);
        foundConnection = true;
        break;
      }

      // If no connection could be processed, we might have disconnected tables
      if (!foundConnection && remainingConnections.length > 0) {
        // Try to add the first remaining connection anyway (might create invalid SQL)
        const conn = remainingConnections.shift()!;
        const joinCondition = generateJoinCondition(
          conn.sourceTableId,
          conn.sourceColumn,
          conn.targetTableId,
          conn.targetColumn,
        );
        lines.push(`INNER JOIN ${conn.sourceTableId}`);
        lines.push(`  ON ${joinCondition}`);
        joinedTables.add(conn.sourceTableId);
        joinedTables.add(conn.targetTableId);
      }
    }

    // WHERE clause
    const whereClauses: string[] = [];

    visualFilters.forEach((f) => {
      const col = `${f.tableId}.${f.columnName}`;
      const op = getSqlOperator(f.operator);
      if (f.operator === "is_null" || f.operator === "is_not_null") {
        whereClauses.push(`${col} ${op}`);
      } else if (f.isParameter && f.parameterName) {
        // Use parameter placeholder
        whereClauses.push(`${col} ${op} :${f.parameterName}`);
      } else {
        const val = formatSqlValue(f.operator, f.value);
        whereClauses.push(`${col} ${op} ${val}`);
      }
    });

    referenceFilters.forEach((r) => {
      const targetCol = `${r.targetTableId}.${r.targetColumn}`;
      const subquery = `(SELECT ${r.sourceColumn} FROM ${r.sourceTableId})`;
      if (r.filterType === "include") {
        whereClauses.push(`${targetCol} IN ${subquery}`);
      } else {
        whereClauses.push(`${targetCol} NOT IN ${subquery}`);
      }
    });

    if (whereClauses.length > 0) {
      lines.push(`WHERE ${whereClauses.join("\n  AND ")}`);
    }

    // GROUP BY clause
    if (groupingRules.length > 0) {
      const groupCols = groupingRules.map(
        (g) => `${g.tableId}.${g.columnName}`,
      );
      lines.push(`GROUP BY ${groupCols.join(", ")}`);
    }

    // ORDER BY clause
    const sortedFields = selectedFields.filter((f) => f.sortOrder);
    if (sortedFields.length > 0) {
      const orderCols = sortedFields.map(
        (f) => `${f.tableId}.${f.columnName} ${f.sortOrder?.toUpperCase()}`,
      );
      lines.push(`ORDER BY ${orderCols.join(", ")}`);
    }

    // LIMIT / OFFSET clause (pagination)
    if (paginationEnabled) {
      // Use :param syntax that backend will replace with actual values
      if (allowPageSizeParam) {
        lines.push(`LIMIT :pagesize`);
      } else {
        lines.push(`LIMIT ${defaultPageSize}`);
      }
      if (allowPageCountParam) {
        // pagecount is 1-indexed page number, backend calculates offset = (pagecount - 1) * pagesize
        lines.push(`OFFSET :offset`);
      }
    }

    return lines.join("\n");
  }, [
    selectedTables,
    selectedFields,
    tableConnections,
    visualFilters,
    referenceFilters,
    groupingRules,
    paginationEnabled,
    defaultPageSize,
    allowPageSizeParam,
    allowPageCountParam,
  ]);

  // ============================================================================
  // CANVAS HANDLERS
  // ============================================================================

  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.max(0.3, Math.min(2, prev + delta)));
  }, []);

  const handleAutoArrange = useCallback(() => {
    const cols = Math.ceil(Math.sqrt(selectedTables.length));
    const padding = 40;
    const newPositions: Record<string, TablePosition> = {};

    selectedTables.forEach((table, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      newPositions[table.id] = {
        x: padding + col * (TABLE_WIDTH + padding),
        y: padding + row * (TABLE_HEIGHT + padding),
      };
    });

    setTablePositions(newPositions);
    setZoom(1);
    // Scroll to top-left after arranging
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  }, [selectedTables]);

  const handleCenterView = useCallback(() => {
    if (selectedTables.length === 0 || !containerRef.current) return;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    selectedTables.forEach((t) => {
      const pos = tablePositions[t.id];
      if (pos) {
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + TABLE_WIDTH);
        maxY = Math.max(maxY, pos.y + TABLE_HEIGHT);
      }
    });

    const centerX = ((minX + maxX) / 2) * zoom;
    const centerY = ((minY + maxY) / 2) * zoom;

    containerRef.current.scrollLeft = centerX - containerSize.width / 2;
    containerRef.current.scrollTop = centerY - containerSize.height / 2;
  }, [selectedTables, tablePositions, containerSize, zoom]);

  // Mouse handlers for dragging tables
  const handleMouseDown = useCallback((_e: React.MouseEvent) => {
    // No longer using panning with viewport offset
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingTable && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollLeft = containerRef.current.scrollLeft;
        const scrollTop = containerRef.current.scrollTop;

        const newX = snapToGrid(
          (e.clientX - rect.left + scrollLeft - dragOffset.x) / zoom,
        );
        const newY = snapToGrid(
          (e.clientY - rect.top + scrollTop - dragOffset.y) / zoom,
        );
        setTablePositions((prev) => ({
          ...prev,
          [draggingTable]: { x: Math.max(0, newX), y: Math.max(0, newY) },
        }));
      }
    },
    [draggingTable, dragOffset, zoom],
  );

  const handleMouseUp = useCallback(() => {
    setDraggingTable(null);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
      }
    },
    [handleZoom],
  );

  // Add multiple tables at once with correct positions
  const handleAddMultipleTables = (tableIds: string[]) => {
    const tablesToAddData = tableIds
      .map((id) => tables.find((t: any) => t.id === id))
      .filter(
        (t): t is any => !!t && !selectedTables.find((s) => s.id === t.id),
      );

    if (tablesToAddData.length === 0) return;

    const startIndex = selectedTables.length;
    const totalTables = startIndex + tablesToAddData.length;
    const cols = Math.ceil(Math.sqrt(totalTables));

    const newTables = tablesToAddData.map((table) => ({
      id: table.id,
      name: table.name,
      columns: table.columns || [],
    }));

    const newPositions: Record<string, TablePosition> = {};
    tablesToAddData.forEach((table, i) => {
      const index = startIndex + i;
      const col = index % cols;
      const row = Math.floor(index / cols);
      newPositions[table.id] = {
        x: 40 + col * (TABLE_WIDTH + 40),
        y: 40 + row * (TABLE_HEIGHT + 40),
      };
    });

    setSelectedTables((prev) => [...prev, ...newTables]);
    setTablePositions((prev) => ({ ...prev, ...newPositions }));
  };

  const handleRemoveTable = (tableId: string) => {
    setTablePositions((prev) => {
      const p = { ...prev };
      delete p[tableId];
      return p;
    });
    setTableConnections((prev) =>
      prev.filter(
        (c) => c.sourceTableId !== tableId && c.targetTableId !== tableId,
      ),
    );
    setSelectedFields((prev) => prev.filter((f) => f.tableId !== tableId));
    setVisualFilters((prev) => prev.filter((f) => f.tableId !== tableId));
    setReferenceFilters((prev) =>
      prev.filter(
        (r) => r.sourceTableId !== tableId && r.targetTableId !== tableId,
      ),
    );
    setGroupingRules((prev) => prev.filter((g) => g.tableId !== tableId));
    setSelectedTables((prev) => {
      const updated = prev.filter((t) => t.id !== tableId);
      // Rearrange remaining tables after removal
      if (updated.length > 0) {
        const cols = Math.ceil(Math.sqrt(updated.length));
        const padding = 40;
        const newPositions: Record<string, TablePosition> = {};
        updated.forEach((table, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          newPositions[table.id] = {
            x: padding + col * (TABLE_WIDTH + padding),
            y: padding + row * (TABLE_HEIGHT + padding),
          };
        });
        setTablePositions(newPositions);
      } else {
        setTablePositions({});
      }
      return updated;
    });
  };
  const handleTableDragStart = (tableId: string, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = tablePositions[tableId] || { x: 0, y: 0 };
    setDraggingTable(tableId);
    setDragOffset({
      x: e.clientX - rect.left - pos.x * zoom + containerRef.current.scrollLeft,
      y: e.clientY - rect.top - pos.y * zoom + containerRef.current.scrollTop,
    });
  };

  // ============================================================================
  // CONNECTION HANDLERS
  // ============================================================================

  const startConnection = (
    tableId: string,
    column: string,
    columnType: string,
    mode: ConnectionMode,
  ) => {
    setConnectionMode(mode);
    setConnectingFrom({ tableId, column, columnType });
  };

  const completeConnection = (
    targetTableId: string,
    targetColumn: string,
    targetColumnType: string,
  ) => {
    if (!connectingFrom || connectingFrom.tableId === targetTableId) {
      resetConnection();
      return;
    }

    if (connectionMode === "join") {
      // Check if a connection already exists between these two columns (in either direction)
      const duplicateExists = tableConnections.some(
        (c) =>
          (c.sourceTableId === connectingFrom.tableId &&
            c.sourceColumn === connectingFrom.column &&
            c.targetTableId === targetTableId &&
            c.targetColumn === targetColumn) ||
          (c.sourceTableId === targetTableId &&
            c.sourceColumn === targetColumn &&
            c.targetTableId === connectingFrom.tableId &&
            c.targetColumn === connectingFrom.column)
      );

      if (duplicateExists) {
        resetConnection();
        return;
      }

      const conn: TableConnection = {
        id: `${connectingFrom.tableId}-${targetTableId}-${Date.now()}`,
        sourceTableId: connectingFrom.tableId,
        targetTableId: targetTableId,
        sourceColumn: connectingFrom.column,
        targetColumn: targetColumn,
        sourceColumnType: connectingFrom.columnType,
        targetColumnType: targetColumnType,
        connectionType: "matches",
      };
      setTableConnections((prev) => [...prev, conn]);
    } else if (connectionMode === "include" || connectionMode === "exclude") {
      // Check if a reference filter already exists between these two columns (in either direction)
      const duplicateExists = referenceFilters.some(
        (r) =>
          (r.sourceTableId === connectingFrom.tableId &&
            r.sourceColumn === connectingFrom.column &&
            r.targetTableId === targetTableId &&
            r.targetColumn === targetColumn) ||
          (r.sourceTableId === targetTableId &&
            r.sourceColumn === targetColumn &&
            r.targetTableId === connectingFrom.tableId &&
            r.targetColumn === connectingFrom.column)
      );

      if (duplicateExists) {
        resetConnection();
        return;
      }

      const ref: ReferenceFilter = {
        id: `ref-${Date.now()}`,
        sourceTableId: connectingFrom.tableId,
        sourceColumn: connectingFrom.column,
        targetTableId: targetTableId,
        targetColumn: targetColumn,
        filterType: connectionMode,
      };
      setReferenceFilters((prev) => [...prev, ref]);
    }

    resetConnection();
  };

  const resetConnection = () => {
    setConnectionMode("none");
    setConnectingFrom(null);
  };

  // ============================================================================
  // FIELD HANDLERS
  // ============================================================================

  const toggleFieldSelect = (
    tableId: string,
    columnName: string,
    columnType?: string,
  ) => {
    const exists = selectedFields.find(
      (f) => f.tableId === tableId && f.columnName === columnName,
    );
    if (exists) {
      setSelectedFields((prev) =>
        prev.filter(
          (f) => !(f.tableId === tableId && f.columnName === columnName),
        ),
      );
    } else {
      setSelectedFields((prev) => [
        ...prev,
        { tableId, columnName, columnType },
      ]);
    }
  };

  const toggleFieldSort = (
    tableId: string,
    columnName: string,
    order: "asc" | "desc",
  ) => {
    setSelectedFields((prev) =>
      prev.map((f) =>
        f.tableId === tableId && f.columnName === columnName
          ? { ...f, sortOrder: f.sortOrder === order ? null : order }
          : f,
      ),
    );
  };

  const handleSetAlias = (
    tableId: string,
    columnName: string,
    alias: string,
  ) => {
    setSelectedFields((prev) =>
      prev.map((f) =>
        f.tableId === tableId && f.columnName === columnName
          ? { ...f, alias: alias || undefined }
          : f,
      ),
    );
  };

  // Compute duplicate column names across all selected tables
  const duplicateColumnNames = useMemo(() => {
    const columnCounts: Record<string, number> = {};
    selectedTables.forEach((table) => {
      table.columns.forEach((col) => {
        columnCounts[col.name] = (columnCounts[col.name] || 0) + 1;
      });
    });
    return new Set(
      Object.keys(columnCounts).filter((name) => columnCounts[name] > 1),
    );
  }, [selectedTables]);

  const toggleGrouping = (tableId: string, columnName: string) => {
    const exists = groupingRules.find(
      (g) => g.tableId === tableId && g.columnName === columnName,
    );
    if (exists) {
      setGroupingRules((prev) =>
        prev.filter(
          (g) => !(g.tableId === tableId && g.columnName === columnName),
        ),
      );
    } else {
      setGroupingRules((prev) => [...prev, { tableId, columnName }]);
    }
  };

  // ============================================================================
  // FILTER & AGGREGATION
  // ============================================================================

  const openFilterDialog = (
    tableId: string,
    columnName: string,
    type: string,
  ) => {
    setFilterField({ tableId, columnName, type });
    setFilterOperator("equals");
    setFilterValue("");
    setFilterIsParameter(false);
    setFilterParameterName(columnName); // Default parameter name to column name
    setFilterDialogOpen(true);
  };

  const handleAddFilter = () => {
    if (!filterField) return;
    setVisualFilters((prev) => [
      ...prev,
      {
        id: `filter-${Date.now()}`,
        tableId: filterField.tableId,
        columnName: filterField.columnName,
        columnType: filterField.type,
        operator: filterOperator,
        value: filterOperator === "between" ? filterRangeValue : filterValue,
        isParameter: filterIsParameter,
        parameterName: filterIsParameter ? filterParameterName : undefined,
      },
    ]);
    setFilterDialogOpen(false);
  };

  const openAggDialog = (
    tableId: string,
    columnName: string,
    columnType?: string,
  ) => {
    setAggField({ tableId, columnName, columnType });
    setAggType("count");
    setAggDialogOpen(true);
  };

  const handleAddAggregation = () => {
    if (!aggField) return;
    const exists = selectedFields.find(
      (f) =>
        f.tableId === aggField.tableId && f.columnName === aggField.columnName,
    );
    if (exists) {
      setSelectedFields((prev) =>
        prev.map((f) =>
          f.tableId === aggField.tableId && f.columnName === aggField.columnName
            ? {
                ...f,
                aggregation: aggType as any,
                columnType: aggField.columnType,
              }
            : f,
        ),
      );
    } else {
      setSelectedFields((prev) => [
        ...prev,
        {
          tableId: aggField.tableId,
          columnName: aggField.columnName,
          columnType: aggField.columnType,
          aggregation: aggType as any,
        },
      ]);
    }
    setAggDialogOpen(false);
  };

  // ============================================================================
  // COMPUTED FIELD HANDLERS
  // ============================================================================

  const openComputedFieldDialog = () => {
    setComputedFieldName("");
    setComputedLeftTable(selectedTables[0]?.id || "");
    setComputedLeftColumn("");
    setComputedOperator("*");
    setComputedRightTable(selectedTables[0]?.id || "");
    setComputedRightColumn("");
    setComputedAggregation("sum");
    setComputedFieldDialogOpen(true);
  };

  const handleAddComputedField = () => {
    if (
      !computedFieldName ||
      !computedLeftTable ||
      !computedLeftColumn ||
      !computedRightTable ||
      !computedRightColumn
    ) {
      return;
    }

    const leftTable = selectedTables.find((t) => t.id === computedLeftTable);
    const rightTable = selectedTables.find((t) => t.id === computedRightTable);
    const leftCol = leftTable?.columns.find(
      (c) => c.name === computedLeftColumn,
    );
    const rightCol = rightTable?.columns.find(
      (c) => c.name === computedRightColumn,
    );

    const newField: ComputedField = {
      id: `computed-${Date.now()}`,
      name: computedFieldName,
      expression: {
        leftTableId: computedLeftTable,
        leftColumn: computedLeftColumn,
        leftColumnType: leftCol?.type,
        operator: computedOperator,
        rightTableId: computedRightTable,
        rightColumn: computedRightColumn,
        rightColumnType: rightCol?.type,
      },
      aggregation: computedAggregation || null,
    };

    setComputedFields((prev) => [...prev, newField]);
    setComputedFieldDialogOpen(false);
  };

  const removeComputedField = (id: string) => {
    setComputedFields((prev) => prev.filter((f) => f.id !== id));
  };

  // ============================================================================
  // QUERY EXECUTION
  // ============================================================================

  const runQuery = async () => {
    if (!generatedSql || !databaseId) {
      setApiTestResult({
        success: false,
        status: 400,
        rowCount: 0,
        executionTime: "0ms",
        timestamp: new Date().toLocaleTimeString(),
        error: !databaseId ? "No database connected" : "No SQL query generated",
      });
      return;
    }

    // Check for type mismatch errors before executing
    if (connectionTypeErrors.length > 0) {
      setApiTestResult({
        success: false,
        status: 400,
        rowCount: 0,
        executionTime: "0ms",
        timestamp: new Date().toLocaleTimeString(),
        error: `Type mismatch in JOIN: ${connectionTypeErrors.map((e) => e.message).join("; ")}`,
      });
      return;
    }

    // Check for invalid aggregation errors before executing
    if (aggregationErrors.length > 0) {
      setApiTestResult({
        success: false,
        status: 400,
        rowCount: 0,
        executionTime: "0ms",
        timestamp: new Date().toLocaleTimeString(),
        error: `Invalid aggregation: ${aggregationErrors.map((e) => e.message).join("; ")}`,
      });
      return;
    }

    // Check for computed field errors (missing tables)
    if (computedFieldErrors.length > 0) {
      setApiTestResult({
        success: false,
        status: 400,
        rowCount: 0,
        executionTime: "0ms",
        timestamp: new Date().toLocaleTimeString(),
        error: `Missing table: ${computedFieldErrors.map((e) => e.message).join("; ")}`,
      });
      return;
    }

    // Check if all parameters have values
    const paramFilters = visualFilters.filter(
      (f) => f.isParameter && f.parameterName,
    );
    const missingParams = paramFilters.filter(
      (f) => !testParamValues[f.parameterName!]?.trim(),
    );
    if (missingParams.length > 0) {
      setApiTestResult({
        success: false,
        status: 400,
        rowCount: 0,
        executionTime: "0ms",
        timestamp: new Date().toLocaleTimeString(),
        error: `Missing parameter values: ${missingParams.map((p) => p.parameterName).join(", ")}`,
      });
      return;
    }

    setApiTestResult({ loading: true });
    setPreviewLoading(true);
    setTestResultsOpen(true);

    const startTime = performance.now();

    try {
      // Replace parameters with test values
      let testSql = generatedSql;
      paramFilters.forEach((f) => {
        const value = testParamValues[f.parameterName!].trim();
        const colType = (f.columnType || "").toLowerCase();
        const operator = f.operator;

        // Only these types should NOT be quoted
        const numericTypes = [
          "int",
          "integer",
          "smallint",
          "bigint",
          "tinyint",
          "decimal",
          "numeric",
          "float",
          "double",
          "real",
          "money",
          "smallmoney",
          "serial",
          "bigserial",
        ];

        const isNumericType = numericTypes.some(
          (t) => colType === t || colType.startsWith(t + "("),
        );
        const isNumericValue = !isNaN(Number(value)) && value !== "";

        // Escape single quotes
        const escapedValue = value.replace(/'/g, "''");

        // Format value based on operator and type
        let formattedValue: string;
        if (operator === "contains") {
          formattedValue = `'%${escapedValue}%'`;
        } else if (operator === "starts_with") {
          formattedValue = `'${escapedValue}%'`;
        } else if (operator === "ends_with") {
          formattedValue = `'%${escapedValue}'`;
        } else if (isNumericType && isNumericValue) {
          formattedValue = value;
        } else {
          formattedValue = `'${escapedValue}'`;
        }

        testSql = testSql.replace(`:${f.parameterName}`, formattedValue);
      });

      // Handle pagination parameters - only apply if user provides values
      const userPagesize = testParamValues["pagesize"]?.trim();
      const userPagecount = testParamValues["pagecount"]?.trim();

      if (testSql.includes(":pagesize")) {
        if (userPagesize) {
          const pagesize = parseInt(userPagesize) || 100;
          testSql = testSql.split(":pagesize").join(String(pagesize));
        } else {
          // Remove LIMIT clause if no pagesize provided
          testSql = testSql
            .replace(/\nLIMIT\s+:pagesize/i, "")
            .replace(/LIMIT\s+:pagesize/i, "");
        }
      }

      if (testSql.includes(":offset")) {
        if (userPagecount && userPagesize) {
          const pagesize = parseInt(userPagesize) || 100;
          const pagecount = parseInt(userPagecount) || 1;
          const offset = (pagecount - 1) * pagesize;
          testSql = testSql.split(":offset").join(String(offset));
        } else {
          // Remove OFFSET clause if no pagecount provided
          testSql = testSql
            .replace(/\nOFFSET\s+:offset/i, "")
            .replace(/OFFSET\s+:offset/i, "");
        }
      }

      // Add LIMIT to prevent fetching too many rows for preview
      const previewSql = testSql.includes("LIMIT")
        ? testSql
        : `${testSql} LIMIT 100`;

      const result = await executeQuery({ sql: previewSql });
      const endTime = performance.now();

      // Transform result rows to preview data format
      const rows = result.rows || [];
      setPreviewData(rows);

      setApiTestResult({
        success: true,
        status: 200,
        rowCount: rows.length,
        executionTime: `${Math.round(endTime - startTime)}ms`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (error: any) {
      // Extract error message from various possible locations
      const errorMessage =
        error.message || error.body?.message || "Query execution failed";

      setApiTestResult({
        success: false,
        status: error.status || 500,
        rowCount: 0,
        executionTime: `${Math.round(performance.now() - startTime)}ms`,
        timestamp: new Date().toLocaleTimeString(),
        error: errorMessage,
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveApi = async (name: string, desc: string) => {
    if (!databaseId || !generatedSql) {
      setApiTestResult({
        success: false,
        error: "No database connected or no query generated",
      });
      return;
    }

    // Extract parameter definitions from filters that have isParameter=true
    const parameters = visualFilters
      .filter((f) => f.isParameter)
      .map((f) => ({
        name: f.parameterName || f.columnName.replace(/\./g, "_"),
        columnName: f.columnName,
        columnType: f.columnType || "text",
        operator: f.operator,
        required: true,
      }));

    // Add pagination parameters if enabled
    if (paginationEnabled) {
      if (allowPageSizeParam) {
        parameters.push({
          name: "pagesize",
          columnName: "_pagination",
          columnType: "integer",
          operator: "equals",
          required: false,
        });
      }
      if (allowPageCountParam) {
        parameters.push({
          name: "pagecount",
          columnName: "_pagination",
          columnType: "integer",
          operator: "equals",
          required: false,
        });
      }
    }

    try {
      const response = await SchemaService.saveQuery(
        databaseId,
        name,
        generatedSql,
        {
          description: desc,
          parameters,
          method: "GET",
          isPublic: false,
        },
      );

      const savedQuery = response.query;
      const baseUrl = window.location.origin;
      const apiEndpoint = `/api${savedQuery.endpoint}`;

      // Build example URL with parameters
      const exampleParams = parameters
        .map((p) => `${p.name}=<value>`)
        .join("&");
      const fullExampleUrl =
        parameters.length > 0
          ? `${baseUrl}${apiEndpoint}?${exampleParams}`
          : `${baseUrl}${apiEndpoint}`;

      setSaveDialogOpen(false);

      // Invalidate the saved queries cache so Open API tab shows the new API
      queryClient.invalidateQueries({
        queryKey: [...SAVED_QUERIES_KEY, databaseId],
      });
      // Also invalidate databases to update the apis count on dashboard
      queryClient.invalidateQueries({ queryKey: DATABASES_QUERY_KEY });

      // Notify parent that API was saved (for refreshing Open API tab)
      onApiSaved?.();

      // Show success with the endpoint information
      setApiTestResult({
        success: true,
        message: "API saved successfully!",
        endpoint: apiEndpoint,
        fullUrl: fullExampleUrl,
        parameters: parameters,
        rowCount: 0,
        executionTime: "0ms",
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (error: any) {
      setApiTestResult({
        success: false,
        error: error?.body?.message || error?.message || "Failed to save API",
      });
    }
  };

  // ============================================================================
  // DRAW CONNECTIONS
  // ============================================================================

  const renderConnections = () => {
    const lines: React.ReactElement[] = [];

    // Draw table joins (blue)
    tableConnections.forEach((conn) => {
      const from = tablePositions[conn.sourceTableId];
      const to = tablePositions[conn.targetTableId];
      if (!from || !to) return;

      const x1 = from.x + TABLE_WIDTH;
      const y1 = from.y + 80;
      const x2 = to.x;
      const y2 = to.y + 80;
      const midX = (x1 + x2) / 2;

      lines.push(
        <g key={`join-${conn.id}`}>
          <path
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            stroke="#2196F3"
            strokeWidth={3 / zoom}
            fill="none"
            strokeLinecap="round"
          />
          <rect
            x={midX - 45}
            y={(y1 + y2) / 2 - 14}
            width={90}
            height={28}
            rx={14}
            fill={isDark ? "rgba(33, 150, 243, 0.15)" : "#e3f2fd"}
            stroke="#2196F3"
            strokeWidth={1.5 / zoom}
          />
          <text
            x={midX}
            y={(y1 + y2) / 2 + 5}
            fill={isDark ? "#64b5f6" : "#1565c0"}
            fontSize={12 / zoom}
            textAnchor="middle"
            fontWeight="600"
          >
            🔗 Combined
          </text>
        </g>,
      );
    });

    // Draw reference filters (green/red)
    referenceFilters.forEach((ref) => {
      const from = tablePositions[ref.sourceTableId];
      const to = tablePositions[ref.targetTableId];
      if (!from || !to) return;

      const x1 = from.x + TABLE_WIDTH;
      const y1 = from.y + 140;
      const x2 = to.x;
      const y2 = to.y + 140;
      const midX = (x1 + x2) / 2;
      const color = ref.filterType === "include" ? "#4CAF50" : "#f44336";
      const bgColor = ref.filterType === "include" ? "#e8f5e9" : "#ffebee";

      lines.push(
        <g key={`ref-${ref.id}`}>
          <path
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            stroke={color}
            strokeWidth={2 / zoom}
            strokeDasharray={`${6 / zoom},${4 / zoom}`}
            fill="none"
            strokeLinecap="round"
          />
          <rect
            x={midX - 50}
            y={(y1 + y2) / 2 - 14}
            width={100}
            height={28}
            rx={14}
            fill={bgColor}
            stroke={color}
            strokeWidth={1.5 / zoom}
          />
          <text
            x={midX}
            y={(y1 + y2) / 2 + 5}
            fill={color}
            fontSize={11 / zoom}
            textAnchor="middle"
            fontWeight="600"
          >
            {ref.filterType === "include" ? "✅ Keep" : "🚫 Remove"}
          </text>
        </g>,
      );
    });

    return lines;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        backgroundColor: isDark ? "#0a0e1a" : "#f8f9fa",
        overflow: "hidden",
      }}
    >
      {/* Main Canvas Area */}
      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
      >
        {/* Header */}
        <Header sx={{ py: 1.5, px: 2 }}>
          <Box>
            <Title sx={{ fontSize: 18 }}>Visual Query Builder</Title>
            <Typography
              variant="caption"
              sx={{ color: isDark ? "#94a3b8" : "#666" }}
            >
              Click connection buttons on fields, then click target field to
              connect
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddTableDialogOpen(true)}
            >
              Add Table
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FunctionsIcon />}
              onClick={openComputedFieldDialog}
              disabled={selectedTables.length < 1}
              sx={{
                borderColor: "#9c27b0",
                color: "#9c27b0",
                "&:hover": {
                  borderColor: "#7b1fa2",
                  backgroundColor: "rgba(156, 39, 176, 0.08)",
                },
              }}
            >
              Add Calculation
            </Button>
            <SaveButton
              size="small"
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => setSaveDialogOpen(true)}
              disabled={!selectedTables.length || hasValidationErrors}
            >
              Save API
            </SaveButton>
          </Box>
        </Header>

        {/* Connection Mode Banner */}
        {connectionMode !== "none" && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              backgroundColor:
                connectionMode === "join"
                  ? isDark
                    ? "rgba(33, 150, 243, 0.15)"
                    : "#e3f2fd"
                  : connectionMode === "include"
                    ? isDark
                      ? "rgba(76, 175, 80, 0.15)"
                      : "#e8f5e9"
                    : isDark
                      ? "rgba(244, 67, 54, 0.15)"
                      : "#ffebee",
              borderBottom: "2px solid",
              borderColor:
                connectionMode === "join"
                  ? "#2196F3"
                  : connectionMode === "include"
                    ? "#4CAF50"
                    : "#f44336",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {connectionMode === "join" && (
                <JoinIcon sx={{ color: "#2196F3" }} />
              )}
              {connectionMode === "include" && (
                <IncludeIcon sx={{ color: "#4CAF50" }} />
              )}
              {connectionMode === "exclude" && (
                <ExcludeIcon sx={{ color: "#f44336" }} />
              )}
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {connectionMode === "join" && "🔗 Combining Tables"}
                  {connectionMode === "include" && "✅ Keep Matching Rows"}
                  {connectionMode === "exclude" && "🚫 Remove Matching Rows"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? "#94a3b8" : "#666" }}
                >
                  {connectionMode === "join" && "Merge data where values match"}
                  {connectionMode === "include" &&
                    "Only show rows that have a match"}
                  {connectionMode === "exclude" &&
                    "Hide rows that have a match"}
                  {" • "}From:{" "}
                  <strong>
                    {connectingFrom?.tableId}.{connectingFrom?.column}
                  </strong>{" "}
                  ({connectingFrom?.columnType || "unknown"})
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="inherit"
              onClick={resetConnection}
            >
              Cancel
            </Button>
          </Box>
        )}

        {/* Type Mismatch Error Banner */}
        {connectionTypeErrors.length > 0 && (
          <Alert
            severity="error"
            sx={{
              mx: 2,
              mt: 1,
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              ⚠️ Incompatible Column Types in JOIN
            </Typography>
            {connectionTypeErrors.map((err) => (
              <Typography
                key={err.id}
                variant="body2"
                sx={{ fontSize: "0.8rem" }}
              >
                •{" "}
                <strong>
                  {err.sourceTable}.{err.sourceColumn}
                </strong>{" "}
                ({err.sourceType || "unknown"}) cannot be joined with{" "}
                <strong>
                  {err.targetTable}.{err.targetColumn}
                </strong>{" "}
                ({err.targetType || "unknown"})
              </Typography>
            ))}
            <Typography
              variant="body2"
              sx={{ mt: 0.5, fontSize: "0.75rem", color: "text.secondary" }}
            >
              Please select columns with compatible types (e.g., integer with
              integer, uuid with uuid).
            </Typography>
          </Alert>
        )}

        {/* Invalid Aggregation Error Banner */}
        {aggregationErrors.length > 0 && (
          <Alert
            severity="error"
            sx={{
              mx: 2,
              mt: 1,
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              ⚠️ Invalid Aggregation Function
            </Typography>
            {aggregationErrors.map((err, idx) => (
              <Typography key={idx} variant="body2" sx={{ fontSize: "0.8rem" }}>
                • <strong>{err.aggregation?.toUpperCase()}</strong> cannot be
                applied to{" "}
                <strong>
                  {err.tableId}.{err.columnName}
                </strong>{" "}
                ({getFriendlyTypeName(err.columnType)})
              </Typography>
            ))}
            <Typography
              variant="body2"
              sx={{ mt: 0.5, fontSize: "0.75rem", color: "text.secondary" }}
            >
              SUM and AVG only work on numeric columns (integer, decimal,
              float). Use COUNT for non-numeric columns.
            </Typography>
          </Alert>
        )}

        {/* Missing Table Error Banner for Computed Fields */}
        {computedFieldErrors.length > 0 && (
          <Alert
            severity="error"
            sx={{
              mx: 2,
              mt: 1,
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              ⚠️ Missing Table in Calculated Field
            </Typography>
            {computedFieldErrors.map((err) => (
              <Typography
                key={err.id}
                variant="body2"
                sx={{ fontSize: "0.8rem" }}
              >
                • {err.message}
              </Typography>
            ))}
            <Typography
              variant="body2"
              sx={{ mt: 0.5, fontSize: "0.75rem", color: "text.secondary" }}
            >
              Add the missing table and create a JOIN connection to include it
              in the query.
            </Typography>
          </Alert>
        )}

        {/* Toolbar */}
        <Box
          sx={{
            px: 2,
            py: 1,
            backgroundColor: isDark ? "#141825" : "#fff",
            borderBottom: `1px solid ${isDark ? "#1e293b" : "#e0e0e0"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Zoom Out">
                <Button onClick={() => handleZoom(-0.1)} disabled={zoom <= 0.3}>
                  <ZoomOutIcon fontSize="small" />
                </Button>
              </Tooltip>
              <Button disabled sx={{ minWidth: 60 }}>
                {Math.round(zoom * 100)}%
              </Button>
              <Tooltip title="Zoom In">
                <Button onClick={() => handleZoom(0.1)} disabled={zoom >= 2}>
                  <ZoomInIcon fontSize="small" />
                </Button>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Tooltip title="Auto-arrange Tables">
              <Button
                size="small"
                variant="outlined"
                onClick={handleAutoArrange}
                disabled={selectedTables.length === 0}
                startIcon={<AutoArrangeIcon />}
              >
                Auto Arrange
              </Button>
            </Tooltip>

            <Tooltip title="Center View">
              <IconButton size="small" onClick={handleCenterView}>
                <CenterIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={showGrid ? "Hide Grid" : "Show Grid"}>
              <IconButton
                size="small"
                onClick={() => setShowGrid(!showGrid)}
                color={showGrid ? "primary" : "default"}
              >
                <GridIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={showMinimap ? "Hide Minimap" : "Show Minimap"}>
              <IconButton
                size="small"
                onClick={() => setShowMinimap(!showMinimap)}
                color={showMinimap ? "primary" : "default"}
              >
                <MinimapIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography
            variant="caption"
            sx={{ color: isDark ? "#64748b" : "#999" }}
          >
            {selectedTables.length} table(s) • {selectedFields.length} field(s)
            selected • Scroll to navigate • Ctrl+Scroll to zoom
          </Typography>
        </Box>

        {/* Canvas */}
        {selectedTables.length === 0 ? (
          <EmptyStateMessage>
            <StorageIcon
              sx={{ fontSize: 64, color: isDark ? "#475569" : "#ccc", mb: 2 }}
            />
            <Typography
              variant="h6"
              sx={{ color: isDark ? "#94a3b8" : "#666", mb: 1 }}
            >
              Start Building Your Query
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? "#64748b" : "#999",
                mb: 3,
                maxWidth: 400,
                textAlign: "center",
              }}
            >
              Add tables, then use the <strong>Join</strong>,{" "}
              <strong>Include</strong>, or <strong>Exclude</strong> buttons on
              each field to create connections.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddTableDialogOpen(true)}
              size="large"
            >
              Add First Table
            </Button>
          </EmptyStateMessage>
        ) : (
          <Box
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              setScrollPosition({
                left: target.scrollLeft,
                top: target.scrollTop,
              });
            }}
            sx={{
              flex: 1,
              position: "relative",
              overflow: "auto",
              cursor: draggingTable ? "grabbing" : "default",
              backgroundColor: isDark ? "#0f1629" : "#f8f9fa",
            }}
          >
            {/* Scalable Canvas Container */}
            <Box
              sx={{
                position: "relative",
                width: CANVAS_WIDTH * zoom,
                height: CANVAS_HEIGHT * zoom,
                minWidth: "100%",
                minHeight: "100%",
                transformOrigin: "0 0",
              }}
            >
              {/* Grid Background */}
              {showGrid && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* SVG Connections Layer */}
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: CANVAS_WIDTH * zoom,
                  height: CANVAS_HEIGHT * zoom,
                  pointerEvents: "none",
                }}
                viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                preserveAspectRatio="xMinYMin meet"
              >
                {renderConnections()}
              </svg>

              {/* Tables */}
              {selectedTables.map((table) => {
                const pos = tablePositions[table.id] || { x: 0, y: 0 };
                return (
                  <Box
                    key={table.id}
                    sx={{
                      position: "absolute",
                      left: pos.x * zoom,
                      top: pos.y * zoom,
                      width: TABLE_WIDTH * zoom,
                      transform: `scale(${zoom})`,
                      transformOrigin: "0 0",
                    }}
                  >
                    <TableCardComponent
                      table={table}
                      position={{ x: 0, y: 0 }}
                      selectedFields={selectedFields}
                      visualFilters={visualFilters}
                      groupingRules={groupingRules}
                      tableConnections={tableConnections}
                      referenceFilters={referenceFilters}
                      connectionMode={connectionMode}
                      connectingFrom={connectingFrom}
                      onDragStart={(e) => handleTableDragStart(table.id, e)}
                      onRemove={() => handleRemoveTable(table.id)}
                      onFieldSelect={(col, colType) =>
                        toggleFieldSelect(table.id, col, colType)
                      }
                      onStartConnection={(col, colType, mode) =>
                        startConnection(table.id, col, colType, mode)
                      }
                      onCompleteConnection={(col, colType) =>
                        completeConnection(table.id, col, colType)
                      }
                      onToggleSort={(col, order) =>
                        toggleFieldSort(table.id, col, order)
                      }
                      onOpenFilter={(col, type) =>
                        openFilterDialog(table.id, col, type)
                      }
                      onOpenAggregation={(col, colType) =>
                        openAggDialog(table.id, col, colType)
                      }
                      onToggleGroup={(col) => toggleGrouping(table.id, col)}
                      onSetAlias={(col, alias) =>
                        handleSetAlias(table.id, col, alias)
                      }
                      duplicateColumnNames={duplicateColumnNames}
                    />
                  </Box>
                );
              })}
            </Box>

            {/* Minimap - Fixed position overlay */}
            {showMinimap && selectedTables.length > 0 && (
              <Box
                sx={{ position: "fixed", bottom: 16, left: 16, zIndex: 100 }}
              >
                <Minimap
                  tables={selectedTables}
                  positions={tablePositions}
                  scrollLeft={scrollPosition.left}
                  scrollTop={scrollPosition.top}
                  containerWidth={containerSize.width}
                  containerHeight={containerSize.height}
                  onNavigate={(x, y) => {
                    if (containerRef.current) {
                      containerRef.current.scrollLeft = x;
                      containerRef.current.scrollTop = y;
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Right Panel */}
      {selectedTables.length > 0 && (
        <Box
          sx={{
            width: { xs: 300, md: 360 },
            minWidth: { xs: 300, md: 360 },
            flexShrink: 0,
            backgroundColor: isDark ? "#141825" : "white",
            borderLeft: `1px solid ${isDark ? "#1e293b" : "#e0e0e0"}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={rightPanelTab}
            onChange={(_, v) => setRightPanelTab(v)}
            variant="fullWidth"
            sx={{ borderBottom: `1px solid ${isDark ? "#1e293b" : "#e0e0e0"}` }}
          >
            <Tab
              icon={<ColumnIcon sx={{ fontSize: 16 }} />}
              label="Fields"
              sx={{ fontSize: "0.7rem", minHeight: 40 }}
            />
            <Tab
              icon={<LinkIcon sx={{ fontSize: 16 }} />}
              label="Links"
              sx={{ fontSize: "0.7rem", minHeight: 40 }}
            />
            <Tab
              icon={<CodeIcon sx={{ fontSize: 16 }} />}
              label="SQL"
              sx={{ fontSize: "0.7rem", minHeight: 40 }}
            />
            <Tab
              icon={<PlayIcon sx={{ fontSize: 16 }} />}
              label="Test"
              sx={{ fontSize: "0.7rem", minHeight: 40 }}
            />
          </Tabs>

          <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
            {/* Fields Tab */}
            {rightPanelTab === 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Selected Fields ({selectedFields.length})
                </Typography>
                {selectedFields.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
                    Click fields in tables to select them
                  </Alert>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    {selectedFields.map((f) => (
                      <Paper
                        key={`${f.tableId}-${f.columnName}`}
                        sx={{
                          p: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {f.aggregation
                              ? `${getAggLabel(f.aggregation)}(${f.columnName})`
                              : f.columnName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: isDark ? "#64748b" : "#999" }}
                          >
                            {f.tableId}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.25 }}>
                          {f.sortOrder === "asc" && (
                            <Chip label="↑" size="small" sx={{ height: 18 }} />
                          )}
                          {f.sortOrder === "desc" && (
                            <Chip label="↓" size="small" sx={{ height: 18 }} />
                          )}
                          <IconButton
                            size="small"
                            onClick={() =>
                              toggleFieldSelect(f.tableId, f.columnName)
                            }
                          >
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}

                {visualFilters.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Filters ({visualFilters.length})
                    </Typography>
                    {visualFilters.map((f) => (
                      <Paper
                        key={f.id}
                        sx={{
                          p: 1,
                          mb: 0.5,
                          backgroundColor: f.isParameter
                            ? isDark
                              ? "rgba(33, 150, 243, 0.15)"
                              : "#e3f2fd"
                            : isDark
                              ? "rgba(255, 193, 7, 0.15)"
                              : "#fff8e1",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ display: "block" }}
                            >
                              {f.columnName} {getOperatorLabel(f.operator)}{" "}
                              {f.isParameter ? (
                                <Chip
                                  label={`:${f.parameterName}`}
                                  size="small"
                                  color="primary"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.65rem",
                                    ml: 0.5,
                                  }}
                                />
                              ) : (
                                String(f.value)
                              )}
                            </Typography>
                            {f.isParameter && (
                              <Typography
                                variant="caption"
                                sx={{ color: "#1976d2", fontSize: "0.65rem" }}
                              >
                                📥 API parameter
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setVisualFilters((prev) =>
                                prev.filter((x) => x.id !== f.id),
                              )
                            }
                          >
                            <CloseIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}

                {groupingRules.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Group By
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {groupingRules.map((g) => (
                        <Chip
                          key={`${g.tableId}-${g.columnName}`}
                          label={g.columnName}
                          onDelete={() =>
                            toggleGrouping(g.tableId, g.columnName)
                          }
                          size="small"
                          sx={{ backgroundColor: "#ff5722", color: "white" }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Computed Fields */}
                {computedFields.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <FunctionsIcon sx={{ fontSize: 16, color: "#9c27b0" }} />
                      Calculated Fields ({computedFields.length})
                    </Typography>
                    {computedFields.map((cf) => (
                      <Paper
                        key={cf.id}
                        sx={{
                          p: 1,
                          mb: 0.5,
                          backgroundColor: isDark
                            ? "rgba(156, 39, 176, 0.15)"
                            : "#f3e5f5",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#9c27b0" }}
                            >
                              {cf.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: "monospace",
                                color: isDark ? "#94a3b8" : "#666",
                                display: "block",
                              }}
                            >
                              {cf.aggregation
                                ? `${cf.aggregation.toUpperCase()}(`
                                : ""}
                              {cf.expression.leftColumn}{" "}
                              {cf.expression.operator}{" "}
                              {cf.expression.rightColumn}
                              {cf.aggregation ? ")" : ""}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeComputedField(cf.id)}
                          >
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}

                {/* Add Calculation Button */}
                {selectedTables.length > 0 && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FunctionsIcon />}
                    onClick={openComputedFieldDialog}
                    sx={{
                      mt: 2,
                      borderColor: "#9c27b0",
                      color: "#9c27b0",
                      "&:hover": {
                        borderColor: "#7b1fa2",
                        backgroundColor: "rgba(156, 39, 176, 0.08)",
                      },
                    }}
                  >
                    Add Calculated Field
                  </Button>
                )}

                {/* Pagination Settings */}
                {selectedTables.length > 0 && (
                  <Box
                    sx={{
                      mt: 3,
                      pt: 2,
                      borderTop: `1px solid ${isDark ? "#334155" : "#e0e0e0"}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        📄 Pagination
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={paginationEnabled}
                            onChange={(e) =>
                              setPaginationEnabled(e.target.checked)
                            }
                            size="small"
                          />
                        }
                        label=""
                        sx={{ m: 0 }}
                      />
                    </Box>

                    {paginationEnabled && (
                      <Paper
                        sx={{
                          p: 1.5,
                          backgroundColor: isDark
                            ? "rgba(33, 150, 243, 0.1)"
                            : "#f5f5f5",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                          }}
                        >
                          {/* Default Page Size */}
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: isDark ? "#94a3b8" : "#666",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Default Page Size (rows per page)
                            </Typography>
                            <TextField
                              size="small"
                              type="number"
                              value={defaultPageSize}
                              onChange={(e) =>
                                setDefaultPageSize(
                                  Math.max(1, parseInt(e.target.value) || 100),
                                )
                              }
                              fullWidth
                              InputProps={{
                                inputProps: { min: 1, max: 10000 },
                              }}
                            />
                          </Box>

                          {/* Parameterize options */}
                          <Box>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={allowPageSizeParam}
                                  onChange={(e) =>
                                    setAllowPageSizeParam(e.target.checked)
                                  }
                                  size="small"
                                />
                              }
                              label={
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.8rem" }}
                                >
                                  Allow{" "}
                                  <code
                                    style={{
                                      backgroundColor: isDark
                                        ? "#1e293b"
                                        : "#e0e0e0",
                                      padding: "2px 4px",
                                      borderRadius: 3,
                                    }}
                                  >
                                    ?pagesize=N
                                  </code>{" "}
                                  parameter
                                </Typography>
                              }
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={allowPageCountParam}
                                  onChange={(e) =>
                                    setAllowPageCountParam(e.target.checked)
                                  }
                                  size="small"
                                />
                              }
                              label={
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.8rem" }}
                                >
                                  Allow{" "}
                                  <code
                                    style={{
                                      backgroundColor: isDark
                                        ? "#1e293b"
                                        : "#e0e0e0",
                                      padding: "2px 4px",
                                      borderRadius: 3,
                                    }}
                                  >
                                    ?pagecount=N
                                  </code>{" "}
                                  parameter
                                </Typography>
                              }
                            />
                          </Box>

                          <Alert
                            severity="info"
                            sx={{ py: 0.5, fontSize: "0.75rem" }}
                          >
                            API will support:{" "}
                            <code>?pagesize=50&pagecount=2</code>
                          </Alert>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* Links Tab */}
            {rightPanelTab === 1 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Combined Tables ({tableConnections.length})
                </Typography>
                {tableConnections.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
                    Click <strong>Combine</strong> on a field to merge data from
                    two tables
                  </Alert>
                ) : (
                  tableConnections.map((c) => (
                    <Paper
                      key={c.id}
                      sx={{
                        p: 1,
                        mb: 0.5,
                        backgroundColor: isDark
                          ? "rgba(33, 150, 243, 0.15)"
                          : "#e3f2fd",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption">
                          🔗 {c.sourceTableId} + {c.targetTableId} (matched by{" "}
                          {c.sourceColumn})
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setTableConnections((prev) =>
                              prev.filter((x) => x.id !== c.id),
                            )
                          }
                        >
                          <CloseIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))
                )}

                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, mt: 2 }}
                >
                  Row Filters ({referenceFilters.length})
                </Typography>
                {referenceFilters.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
                    Use <strong>Keep if found</strong> or{" "}
                    <strong>Remove if found</strong> to filter rows based on
                    another table
                  </Alert>
                ) : (
                  referenceFilters.map((r) => (
                    <Paper
                      key={r.id}
                      sx={{
                        p: 1,
                        mb: 0.5,
                        backgroundColor:
                          r.filterType === "include"
                            ? isDark
                              ? "rgba(76, 175, 80, 0.15)"
                              : "#e8f5e9"
                            : isDark
                              ? "rgba(244, 67, 54, 0.15)"
                              : "#ffebee",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption">
                          {r.filterType === "include" ? "✅ Keep" : "🚫 Remove"}{" "}
                          {r.targetTableId} rows where {r.targetColumn} matches{" "}
                          {r.sourceTableId}.{r.sourceColumn}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setReferenceFilters((prev) =>
                              prev.filter((x) => x.id !== r.id),
                            )
                          }
                        >
                          <CloseIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))
                )}
              </Box>
            )}

            {/* SQL Tab */}
            {rightPanelTab === 2 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Generated SQL
                  </Typography>
                  <Tooltip title="Copy SQL">
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigator.clipboard.writeText(generatedSql)
                      }
                      disabled={!generatedSql}
                    >
                      <CopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {!generatedSql ? (
                  <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
                    Add tables and select fields to generate SQL
                  </Alert>
                ) : (
                  <Paper
                    sx={{
                      p: 1.5,
                      backgroundColor: "#1e1e1e",
                      borderRadius: 1,
                      maxHeight: 400,
                      overflow: "auto",
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        fontFamily: '"Fira Code", "Consolas", monospace',
                        fontSize: "0.75rem",
                        lineHeight: 1.6,
                        color: "#d4d4d4",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {generatedSql.split("\n").map((line, i) => {
                        const highlighted = line
                          .replace(
                            /\b(SELECT|FROM|WHERE|AND|OR|INNER JOIN|LEFT JOIN|RIGHT JOIN|ON|GROUP BY|ORDER BY|HAVING|DISTINCT|IN|NOT IN|LIKE|BETWEEN|IS NULL|IS NOT NULL|ASC|DESC|COUNT|SUM|AVG|MIN|MAX)\b/gi,
                            (match) =>
                              `<span style="color: #569cd6; font-weight: 600">${match.toUpperCase()}</span>`,
                          )
                          .replace(
                            /'[^']*'/g,
                            (match) =>
                              `<span style="color: #ce9178">${match}</span>`,
                          )
                          .replace(
                            /\b\d+\b/g,
                            (match) =>
                              `<span style="color: #b5cea8">${match}</span>`,
                          );
                        return (
                          <Box
                            key={i}
                            component="span"
                            sx={{ display: "block" }}
                          >
                            <span
                              style={{
                                color: "#6a9955",
                                marginRight: 8,
                                userSelect: "none",
                              }}
                            >
                              {String(i + 1).padStart(2, " ")}
                            </span>
                            <span
                              dangerouslySetInnerHTML={{ __html: highlighted }}
                            />
                          </Box>
                        );
                      })}
                    </pre>
                  </Paper>
                )}

                <Divider sx={{ my: 2 }} />

                {/* API Parameters Section */}
                {visualFilters.some((f) => f.isParameter) && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      API Parameters
                    </Typography>
                    <Paper
                      sx={{
                        p: 1.5,
                        mb: 2,
                        backgroundColor: isDark
                          ? "rgba(33, 150, 243, 0.15)"
                          : "#e3f2fd",
                      }}
                    >
                      {visualFilters
                        .filter((f) => f.isParameter)
                        .map((f) => (
                          <Box
                            key={f.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <Chip
                              label={f.parameterName}
                              size="small"
                              color="primary"
                              sx={{ fontFamily: "monospace" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: isDark ? "#94a3b8" : "#666" }}
                            >
                              filters {f.columnName} ({f.operator})
                            </Typography>
                          </Box>
                        ))}
                      <Divider sx={{ my: 1 }} />
                      <Typography
                        variant="caption"
                        sx={{ color: "#1976d2", display: "block" }}
                      >
                        📋 Example call:{" "}
                        <code
                          style={{
                            backgroundColor: isDark ? "#1a1f35" : "#fff",
                            padding: "2px 4px",
                            borderRadius: 2,
                          }}
                        >
                          /api/endpoint?
                          {visualFilters
                            .filter((f) => f.isParameter)
                            .map((f) => `${f.parameterName}=value`)
                            .join("&")}
                        </code>
                      </Typography>
                    </Paper>
                  </>
                )}

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Query Summary
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Chip
                    label={`${selectedTables.length} table(s)`}
                    size="small"
                    variant="outlined"
                    sx={{ alignSelf: "flex-start" }}
                  />
                  <Chip
                    label={`${selectedFields.length || "All"} field(s)`}
                    size="small"
                    variant="outlined"
                    sx={{ alignSelf: "flex-start" }}
                  />
                  {tableConnections.length > 0 && (
                    <Chip
                      label={`${tableConnections.length} combined`}
                      size="small"
                      color="primary"
                      sx={{ alignSelf: "flex-start" }}
                    />
                  )}
                  {visualFilters.length > 0 && (
                    <Chip
                      label={`${visualFilters.length} filter(s)`}
                      size="small"
                      color="warning"
                      sx={{ alignSelf: "flex-start" }}
                    />
                  )}
                  {referenceFilters.length > 0 && (
                    <Chip
                      label={`${referenceFilters.length} row filter(s)`}
                      size="small"
                      color="secondary"
                      sx={{ alignSelf: "flex-start" }}
                    />
                  )}
                  {groupingRules.length > 0 && (
                    <Chip
                      label={`Grouped by ${groupingRules.length} field(s)`}
                      size="small"
                      sx={{
                        alignSelf: "flex-start",
                        backgroundColor: "#ff5722",
                        color: "white",
                      }}
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Test Tab */}
            {rightPanelTab === 3 && (
              <Box>
                {/* Big Run Query Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={
                    previewLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <PlayIcon />
                    )
                  }
                  onClick={runQuery}
                  disabled={!generatedSql || previewLoading || isExecuting}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                    },
                  }}
                >
                  {previewLoading ? "Running..." : "▶ Run Query"}
                </Button>

                {/* Test Parameters Input */}
                {visualFilters.some((f) => f.isParameter) && (
                  <Paper
                    sx={{
                      p: 1.5,
                      mb: 2,
                      backgroundColor: isDark
                        ? "rgba(33, 150, 243, 0.15)"
                        : "#e3f2fd",
                      border: `1px solid ${isDark ? "#2196F3" : "#90caf9"}`,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      📝 Test Parameters
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {visualFilters
                        .filter((f) => f.isParameter && f.parameterName)
                        .map((f) => {
                          const isUuid = f.columnType
                            ?.toLowerCase()
                            .includes("uuid");
                          const value = testParamValues[f.parameterName!] || "";
                          const uuidRegex =
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                          const isValidUuid =
                            !isUuid || !value || uuidRegex.test(value);

                          return (
                            <TextField
                              key={f.id}
                              size="small"
                              label={f.parameterName}
                              placeholder={
                                isUuid
                                  ? "e.g. 550e8400-e29b-41d4-a716-446655440000"
                                  : `Enter ${f.columnName} value...`
                              }
                              value={value}
                              onChange={(e) =>
                                setTestParamValues((prev) => ({
                                  ...prev,
                                  [f.parameterName!]: e.target.value,
                                }))
                              }
                              helperText={
                                isUuid && value && !isValidUuid
                                  ? "⚠️ Invalid UUID format. Use format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                  : `${f.tableId}.${f.columnName} (${f.columnType || "unknown"})`
                              }
                              error={isUuid && !!value && !isValidUuid}
                              fullWidth
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: isDark ? "#1a1f35" : "white",
                                },
                                "& .MuiFormHelperText-root": {
                                  fontSize: "0.65rem",
                                  mt: 0.25,
                                },
                              }}
                            />
                          );
                        })}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mt: 1, color: "#1565c0" }}
                    >
                      ℹ️ Enter values to test the query with real parameters
                    </Typography>
                  </Paper>
                )}

                {/* Quick Stats */}
                {apiTestResult &&
                  !apiTestResult.loading &&
                  apiTestResult.success && (
                    <Paper
                      sx={{
                        p: 1.5,
                        mb: 2,
                        backgroundColor: isDark
                          ? "rgba(76, 175, 80, 0.15)"
                          : "#e8f5e9",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#2e7d32" }}
                          >
                            ✅ Query Successful
                          </Typography>
                          <Box>
                            {apiTestResult.message && (
                              <Typography
                                variant="body2"
                                sx={{ color: "#2e7d32", fontWeight: 500 }}
                              >
                                {apiTestResult.message}
                              </Typography>
                            )}
                            {apiTestResult.fullUrl ? (
                              <Box sx={{ mt: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: isDark ? "#94a3b8" : "#666",
                                    display: "block",
                                  }}
                                >
                                  Test your API in Postman:
                                </Typography>
                                <Paper
                                  sx={{
                                    p: 1,
                                    mt: 0.5,
                                    backgroundColor: isDark
                                      ? "#252b42"
                                      : "#f0f0f0",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: "monospace",
                                      color: isDark ? "#f1f5f9" : "#333",
                                      wordBreak: "break-all",
                                      display: "block",
                                    }}
                                  >
                                    GET {apiTestResult.fullUrl}
                                  </Typography>
                                </Paper>
                                {apiTestResult.parameters &&
                                  apiTestResult.parameters.length > 0 && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: isDark ? "#94a3b8" : "#666",
                                        display: "block",
                                        mt: 1,
                                      }}
                                    >
                                      Parameters:{" "}
                                      {apiTestResult.parameters
                                        .map((p: any) => p.name)
                                        .join(", ")}
                                    </Typography>
                                  )}
                              </Box>
                            ) : (
                              <Typography
                                variant="caption"
                                sx={{ color: isDark ? "#94a3b8" : "#666" }}
                              >
                                {apiTestResult.rowCount} rows •{" "}
                                {apiTestResult.executionTime} •{" "}
                                {apiTestResult.timestamp}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        {!apiTestResult.fullUrl && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setTestResultsOpen(true)}
                            disabled={previewData.length === 0}
                          >
                            View Results
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  )}

                {/* Preview Data */}
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Results Preview
                </Typography>
                {previewLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : apiTestResult &&
                  !apiTestResult.success &&
                  apiTestResult.error ? (
                  <Alert severity="error" sx={{ fontSize: "0.8rem" }}>
                    {apiTestResult.error}
                  </Alert>
                ) : previewData.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
                    Click "Run Query" to see results
                  </Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ maxHeight: 250 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {Object.keys(previewData[0]).map((k) => (
                            <TableCell
                              key={k}
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                backgroundColor: isDark ? "#1a1f35" : "#f5f5f5",
                              }}
                            >
                              {k}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {previewData.slice(0, 5).map((row, i) => (
                          <TableRow key={i}>
                            {Object.values(row).map((v: any, j) => (
                              <TableCell key={j} sx={{ fontSize: "0.75rem" }}>
                                {String(v)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                {previewData.length > 5 && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      mt: 1,
                      color: isDark ? "#64748b" : "#999",
                    }}
                  >
                    Showing 5 of {previewData.length} rows • Click "View
                    Results" for full data
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  API Endpoint
                </Typography>
                <Paper
                  sx={{
                    p: 1,
                    backgroundColor: isDark ? "#1a1f35" : "#f5f5f5",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {apiEndpoint || "Save to generate endpoint"}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ====== DIALOGS ====== */}

      {/* Add Table Dialog */}
      <Dialog
        open={addTableDialogOpen}
        onClose={() => {
          setAddTableDialogOpen(false);
          setTableSearchQuery("");
          setTablesToAdd([]);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Tables</DialogTitle>
        <DialogContent>
          {schemaLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              {/* Search Input */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search tables..."
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: isDark ? "#64748b" : "#999" }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Select All / Clear */}
              {tables.filter(
                (t: any) => !selectedTables.find((s) => s.id === t.id),
              ).length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => {
                      const availableTables = tables
                        .filter(
                          (t: any) =>
                            !selectedTables.find((s) => s.id === t.id),
                        )
                        .filter((t: any) =>
                          t.name
                            .toLowerCase()
                            .includes(tableSearchQuery.toLowerCase()),
                        )
                        .map((t: any) => t.id);
                      setTablesToAdd(availableTables);
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setTablesToAdd([])}
                    disabled={tablesToAdd.length === 0}
                  >
                    Clear Selection
                  </Button>
                </Box>
              )}

              {/* Selected count */}
              {tablesToAdd.length > 0 && (
                <Alert severity="info" sx={{ mb: 1, py: 0 }}>
                  {tablesToAdd.length} table(s) selected
                </Alert>
              )}

              {/* Table List */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  maxHeight: 350,
                  overflowY: "auto",
                }}
              >
                {tables
                  .filter(
                    (t: any) => !selectedTables.find((s) => s.id === t.id),
                  )
                  .filter((t: any) =>
                    t.name
                      .toLowerCase()
                      .includes(tableSearchQuery.toLowerCase()),
                  )
                  .map((t: any) => (
                    <Paper
                      key={t.id}
                      onClick={() => {
                        setTablesToAdd((prev) =>
                          prev.includes(t.id)
                            ? prev.filter((id) => id !== t.id)
                            : [...prev, t.id],
                        );
                      }}
                      sx={{
                        p: 1.5,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        backgroundColor: tablesToAdd.includes(t.id)
                          ? isDark
                            ? "rgba(33, 150, 243, 0.15)"
                            : "#e3f2fd"
                          : isDark
                            ? "#1a1f35"
                            : "#fff",
                        border: tablesToAdd.includes(t.id)
                          ? "2px solid #2196f3"
                          : `1px solid ${isDark ? "#334155" : "#e0e0e0"}`,
                        "&:hover": {
                          backgroundColor: tablesToAdd.includes(t.id)
                            ? isDark
                              ? "rgba(33, 150, 243, 0.25)"
                              : "#bbdefb"
                            : isDark
                              ? "#252b42"
                              : "#f5f5f5",
                        },
                      }}
                    >
                      <Checkbox
                        checked={tablesToAdd.includes(t.id)}
                        size="small"
                        sx={{ p: 0 }}
                      />
                      <StorageIcon sx={{ color: "#667eea" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {t.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: isDark ? "#64748b" : "#999" }}
                        >
                          {t.columns?.length || 0} columns
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                {tables
                  .filter(
                    (t: any) => !selectedTables.find((s) => s.id === t.id),
                  )
                  .filter((t: any) =>
                    t.name
                      .toLowerCase()
                      .includes(tableSearchQuery.toLowerCase()),
                  ).length === 0 && (
                  <Alert severity="info">
                    {tableSearchQuery
                      ? "No tables match your search"
                      : "All tables added"}
                  </Alert>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddTableDialogOpen(false);
              setTableSearchQuery("");
              setTablesToAdd([]);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={tablesToAdd.length === 0}
            onClick={() => {
              // Add all selected tables with proper positions
              handleAddMultipleTables(tablesToAdd);
              setAddTableDialogOpen(false);
              setTableSearchQuery("");
              setTablesToAdd([]);
            }}
          >
            Add{" "}
            {tablesToAdd.length > 0
              ? `${tablesToAdd.length} Table(s)`
              : "Tables"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Filter: {filterField?.columnName}</DialogTitle>
        <DialogContent>
          {/* Show column type hint */}
          {filterField?.type && (
            <Typography
              variant="caption"
              sx={{
                color: isDark ? "#94a3b8" : "#666",
                display: "block",
                mb: 1,
              }}
            >
              Column type: {filterField.type}
            </Typography>
          )}
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Condition</InputLabel>
            <Select
              value={filterOperator}
              onChange={(e) => setFilterOperator(e.target.value)}
              label="Condition"
            >
              <MenuItem value="equals">Equals (=)</MenuItem>
              <MenuItem value="not_equals">Not Equals (≠)</MenuItem>
              {/* Hide text operators for UUID columns */}
              {!filterField?.type?.toLowerCase().includes("uuid") && (
                <MenuItem value="contains">Contains</MenuItem>
              )}
              {/* Hide comparison operators for UUID/text columns */}
              {!filterField?.type?.toLowerCase().includes("uuid") && (
                <>
                  <MenuItem value="gt">Greater Than (&gt;)</MenuItem>
                  <MenuItem value="lt">Less Than (&lt;)</MenuItem>
                  <MenuItem value="gte">Greater or Equal (≥)</MenuItem>
                  <MenuItem value="lte">Less or Equal (≤)</MenuItem>
                  <MenuItem value="between">Between</MenuItem>
                </>
              )}
              <MenuItem value="is_null">Is Empty</MenuItem>
              <MenuItem value="is_not_null">Is Not Empty</MenuItem>
            </Select>
          </FormControl>

          {/* Parameter Toggle - only show for operators that need a value */}
          {!["is_null", "is_not_null", "between"].includes(filterOperator) && (
            <Paper
              sx={{
                p: 1.5,
                mb: 2,
                backgroundColor: filterIsParameter
                  ? isDark
                    ? "rgba(33, 150, 243, 0.15)"
                    : "#e3f2fd"
                  : isDark
                    ? "#1a1f35"
                    : "#f5f5f5",
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={filterIsParameter}
                    onChange={(e) => setFilterIsParameter(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Use as API Parameter
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: isDark ? "#94a3b8" : "#666" }}
                    >
                      Value will be passed when calling the API
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          )}

          {filterOperator === "between" ? (
            <Box sx={{ px: 1 }}>
              <Typography variant="body2">
                Range: {filterRangeValue[0]} - {filterRangeValue[1]}
              </Typography>
              <Slider
                value={filterRangeValue}
                onChange={(_, v) => setFilterRangeValue(v as [number, number])}
                min={0}
                max={1000}
              />
            </Box>
          ) : (
            !["is_null", "is_not_null"].includes(filterOperator) &&
            (filterIsParameter ? (
              <Box>
                <TextField
                  fullWidth
                  label="Parameter Name"
                  value={filterParameterName}
                  onChange={(e) =>
                    setFilterParameterName(
                      e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                    )
                  }
                  helperText={`API will expect: ?${filterParameterName}=value`}
                  sx={{ mb: 1 }}
                />
                <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
                  Example: <code>/api/endpoint?{filterParameterName}=123</code>
                </Alert>
              </Box>
            ) : (
              <TextField
                fullWidth
                label="Fixed Value"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddFilter}
            disabled={filterIsParameter && !filterParameterName}
          >
            Add Filter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Aggregation Dialog */}
      <Dialog
        open={aggDialogOpen}
        onClose={() => setAggDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Calculate: {aggField?.columnName}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Calculation</InputLabel>
            <Select
              value={aggType}
              onChange={(e) => setAggType(e.target.value)}
              label="Calculation"
            >
              <MenuItem value="count">Count (how many)</MenuItem>
              <MenuItem value="sum">Sum (total)</MenuItem>
              <MenuItem value="avg">Average</MenuItem>
              <MenuItem value="min">Minimum</MenuItem>
              <MenuItem value="max">Maximum</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAggDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAggregation}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Computed Field Dialog */}
      <Dialog
        open={computedFieldDialogOpen}
        onClose={() => setComputedFieldDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FunctionsIcon sx={{ color: "#9c27b0" }} />
            Create Calculated Field
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{ color: isDark ? "#94a3b8" : "#666", mb: 2 }}
          >
            Create a calculation using two columns (e.g., quantity × price for
            order totals)
          </Typography>

          <TextField
            fullWidth
            label="Field Name (alias)"
            placeholder="e.g., total_price"
            value={computedFieldName}
            onChange={(e) => setComputedFieldName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box
            sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 2 }}
          >
            {/* Left Column */}
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel>Table</InputLabel>
                <Select
                  value={computedLeftTable}
                  onChange={(e) => {
                    setComputedLeftTable(e.target.value);
                    setComputedLeftColumn("");
                  }}
                  label="Table"
                >
                  {selectedTables.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Column</InputLabel>
                <Select
                  value={computedLeftColumn}
                  onChange={(e) => setComputedLeftColumn(e.target.value)}
                  label="Column"
                  disabled={!computedLeftTable}
                >
                  {selectedTables
                    .find((t) => t.id === computedLeftTable)
                    ?.columns.filter((c) => {
                      const t = c.type.toLowerCase();
                      return (
                        t.includes("int") ||
                        t.includes("decimal") ||
                        t.includes("numeric") ||
                        t.includes("float") ||
                        t.includes("double") ||
                        t.includes("real") ||
                        t.includes("money")
                      );
                    })
                    .map((c) => (
                      <MenuItem key={c.name} value={c.name}>
                        {c.name} ({c.type})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>

            {/* Operator */}
            <FormControl sx={{ minWidth: 80 }} size="small">
              <InputLabel>Op</InputLabel>
              <Select
                value={computedOperator}
                onChange={(e) =>
                  setComputedOperator(e.target.value as "*" | "+" | "-" | "/")
                }
                label="Op"
              >
                <MenuItem value="*">× (multiply)</MenuItem>
                <MenuItem value="+">+ (add)</MenuItem>
                <MenuItem value="-">− (subtract)</MenuItem>
                <MenuItem value="/">÷ (divide)</MenuItem>
              </Select>
            </FormControl>

            {/* Right Column */}
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel>Table</InputLabel>
                <Select
                  value={computedRightTable}
                  onChange={(e) => {
                    setComputedRightTable(e.target.value);
                    setComputedRightColumn("");
                  }}
                  label="Table"
                >
                  {selectedTables.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Column</InputLabel>
                <Select
                  value={computedRightColumn}
                  onChange={(e) => setComputedRightColumn(e.target.value)}
                  label="Column"
                  disabled={!computedRightTable}
                >
                  {selectedTables
                    .find((t) => t.id === computedRightTable)
                    ?.columns.filter((c) => {
                      const t = c.type.toLowerCase();
                      return (
                        t.includes("int") ||
                        t.includes("decimal") ||
                        t.includes("numeric") ||
                        t.includes("float") ||
                        t.includes("double") ||
                        t.includes("real") ||
                        t.includes("money")
                      );
                    })
                    .map((c) => (
                      <MenuItem key={c.name} value={c.name}>
                        {c.name} ({c.type})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Aggregation (optional)</InputLabel>
            <Select
              value={computedAggregation}
              onChange={(e) => setComputedAggregation(e.target.value as any)}
              label="Aggregation (optional)"
            >
              <MenuItem value="">None (raw value)</MenuItem>
              <MenuItem value="sum">SUM - Total of all values</MenuItem>
              <MenuItem value="avg">AVG - Average value</MenuItem>
              <MenuItem value="min">MIN - Minimum value</MenuItem>
              <MenuItem value="max">MAX - Maximum value</MenuItem>
              <MenuItem value="count">COUNT - Number of rows</MenuItem>
            </Select>
          </FormControl>

          {computedFieldName && computedLeftColumn && computedRightColumn && (
            <Paper
              sx={{
                p: 1.5,
                backgroundColor: isDark ? "#1a1f35" : "#f5f5f5",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: isDark ? "#94a3b8" : "#666" }}
              >
                Preview:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: "monospace", fontWeight: 500 }}
              >
                {computedAggregation
                  ? `${computedAggregation.toUpperCase()}(`
                  : ""}
                {computedLeftTable}.{computedLeftColumn} {computedOperator}{" "}
                {computedRightTable}.{computedRightColumn}
                {computedAggregation ? ")" : ""} AS {computedFieldName}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComputedFieldDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddComputedField}
            disabled={
              !computedFieldName || !computedLeftColumn || !computedRightColumn
            }
          >
            Add Calculated Field
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save API Dialog */}
      <SaveApiDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveApi}
        selectedTables={selectedTables.map((t) => ({ id: t.id, name: t.name }))}
        selectedFields={selectedFields}
      />

      {/* Test Results Dialog */}
      <Dialog
        open={testResultsOpen}
        onClose={() => setTestResultsOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: "80vh" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Query Results
            </Typography>
            {apiTestResult && (
              <Typography
                variant="caption"
                sx={{ color: isDark ? "#94a3b8" : "#666" }}
              >
                {apiTestResult.rowCount} rows returned •{" "}
                {apiTestResult.executionTime} • {apiTestResult.timestamp}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={() => {
                const csv =
                  previewData.length > 0
                    ? [
                        Object.keys(previewData[0]).join(","),
                        ...previewData.map((row) =>
                          Object.values(row).join(","),
                        ),
                      ].join("\n")
                    : "";
                navigator.clipboard.writeText(csv);
              }}
            >
              Copy CSV
            </Button>
            <IconButton onClick={() => setTestResultsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          {/* SQL Query Section */}
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                SQL Query
              </Typography>
              <Tooltip title="Copy SQL">
                <IconButton
                  size="small"
                  onClick={() => navigator.clipboard.writeText(generatedSql)}
                >
                  <CopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Paper
              sx={{
                p: 1.5,
                backgroundColor: "#1e1e1e",
                borderRadius: 1,
                maxHeight: 120,
                overflow: "auto",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: '"Fira Code", "Consolas", monospace',
                  fontSize: "0.75rem",
                  lineHeight: 1.4,
                  color: "#d4d4d4",
                  whiteSpace: "pre-wrap",
                }}
              >
                {generatedSql || "No query generated"}
              </pre>
            </Paper>
          </Box>

          {/* Results Table */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Results ({previewData.length} rows)
            </Typography>
            {apiTestResult?.loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <CircularProgress />
              </Box>
            ) : apiTestResult && !apiTestResult.success ? (
              <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>
                {apiTestResult.error || "Query execution failed"}
              </Alert>
            ) : previewData.length === 0 ? (
              <Alert severity="info">
                No data returned. Try running the query first.
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                sx={{ flex: 1, overflow: "auto" }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          backgroundColor: isDark ? "#1a1f35" : "#f0f0f0",
                          width: 50,
                        }}
                      >
                        #
                      </TableCell>
                      {Object.keys(previewData[0]).map((k) => (
                        <TableCell
                          key={k}
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            backgroundColor: isDark ? "#1a1f35" : "#f0f0f0",
                          }}
                        >
                          {k}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.map((row, i) => (
                      <TableRow key={i} hover>
                        <TableCell
                          sx={{
                            fontSize: "0.75rem",
                            color: isDark ? "#64748b" : "#999",
                          }}
                        >
                          {i + 1}
                        </TableCell>
                        {Object.values(row).map((v: any, j) => (
                          <TableCell key={j} sx={{ fontSize: "0.75rem" }}>
                            {v === null ? (
                              <em
                                style={{ color: isDark ? "#64748b" : "#999" }}
                              >
                                null
                              </em>
                            ) : (
                              String(v)
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e0e0e0" }}>
          <Button variant="outlined" onClick={() => setTestResultsOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={runQuery}
            disabled={previewLoading}
          >
            Run Again
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default QueryBuilder;
