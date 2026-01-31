import React, { useState, useRef, useMemo } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  DragHandle as DragIcon,
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
  Circle as DotIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useFullSchema } from '../../../../api/entities/schema/useFullSchema';
import { SaveApiDialog } from './components/SaveApiDialog';
import {
  Header,
  Title,
  SaveButton,
  Canvas,
  TableCard,
  TableCardTitle,
  TableCardFields,
  EmptyStateMessage,
} from './QueryBuilder.styles';
import type { QueryConfig, TableConnection, FilterCondition } from './QueryBuilder.types';

// ============================================================================
// TYPES
// ============================================================================

interface QueryBuilderProps {
  connectedDatabase: { id: string | number; name: string } | null;
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
  aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max' | null;
  sortOrder?: 'asc' | 'desc' | null;
  distinct?: boolean;
}

interface VisualFilter {
  id: string;
  tableId: string;
  columnName: string;
  columnType: string;
  operator: string;
  value: string | number | string[] | [number, number];
}

interface ReferenceFilter {
  id: string;
  sourceTableId: string;
  sourceColumn: string;
  targetTableId: string;
  targetColumn: string;
  filterType: 'include' | 'exclude';
}

interface GroupingRule {
  tableId: string;
  columnName: string;
}

type ConnectionMode = 'none' | 'join' | 'include' | 'exclude';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getOperatorLabel = (op: string): string => {
  const labels: Record<string, string> = {
    equals: '=', not_equals: '≠', contains: '∋', starts_with: 'A..', ends_with: '..Z',
    gt: '>', lt: '<', gte: '≥', lte: '≤', between: '↔', is_null: '∅', is_not_null: '≠∅',
  };
  return labels[op] || op;
};

const getAggLabel = (agg: string): string => {
  const labels: Record<string, string> = {
    count: 'COUNT', sum: 'SUM', avg: 'AVG', min: 'MIN', max: 'MAX',
  };
  return labels[agg] || agg;
};

const getSqlOperator = (op: string): string => {
  const ops: Record<string, string> = {
    equals: '=', not_equals: '<>', contains: 'LIKE', starts_with: 'LIKE', ends_with: 'LIKE',
    gt: '>', lt: '<', gte: '>=', lte: '<=', between: 'BETWEEN', is_null: 'IS NULL', is_not_null: 'IS NOT NULL',
  };
  return ops[op] || '=';
};

const formatSqlValue = (op: string, value: any): string => {
  if (op === 'is_null' || op === 'is_not_null') return '';
  if (op === 'contains') return `'%${value}%'`;
  if (op === 'starts_with') return `'${value}%'`;
  if (op === 'ends_with') return `'%${value}'`;
  if (op === 'between' && Array.isArray(value)) return `${value[0]} AND ${value[1]}`;
  if (typeof value === 'string') return `'${value}'`;
  return String(value);
};

// ============================================================================
// VISUAL CONNECTOR POINT COMPONENT
// ============================================================================

interface ConnectorPointProps {
  type: 'join' | 'include' | 'exclude' | 'filter' | 'aggregate';
  position: 'left' | 'right';
  active?: boolean;
  connected?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  tooltip: string;
}

const ConnectorPoint: React.FC<ConnectorPointProps> = ({
  type, position, active, connected, onClick, onDragStart, onDrop, tooltip
}) => {
  const colors = {
    join: { bg: '#2196F3', border: '#1565c0' },
    include: { bg: '#4CAF50', border: '#2e7d32' },
    exclude: { bg: '#f44336', border: '#c62828' },
    filter: { bg: '#ff9800', border: '#ef6c00' },
    aggregate: { bg: '#9c27b0', border: '#6a1b9a' },
  };

  const color = colors[type];

  return (
    <Tooltip title={tooltip} arrow placement={position === 'left' ? 'left' : 'right'}>
      <Box
        draggable={!!onDragStart}
        onClick={onClick}
        onDragStart={onDragStart}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        sx={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          backgroundColor: connected ? color.bg : active ? color.bg : 'transparent',
          border: `2px solid ${color.bg}`,
          cursor: onDragStart ? 'grab' : onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          '&:hover': {
            backgroundColor: color.bg,
            transform: 'scale(1.2)',
            boxShadow: `0 0 8px ${color.bg}`,
          },
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        {connected && (
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'white' }} />
        )}
      </Box>
    </Tooltip>
  );
};

// ============================================================================
// FIELD ACTION ICONS COMPONENT  
// ============================================================================

interface FieldActionsProps {
  tableId: string;
  field: { name: string; type: string };
  isSelected: boolean;
  hasFilter: boolean;
  hasAggregation: string | null;
  sortOrder: 'asc' | 'desc' | null;
  isGrouped: boolean;
  onToggleSelect: () => void;
  onToggleSort: (order: 'asc' | 'desc') => void;
  onOpenFilter: () => void;
  onOpenAggregation: () => void;
  onToggleGroup: () => void;
}

const FieldActions: React.FC<FieldActionsProps> = ({
  hasFilter, hasAggregation, sortOrder, isGrouped,
  onToggleSort, onOpenFilter, onOpenAggregation, onToggleGroup
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
      {/* Sort Icons */}
      <Tooltip title="Sort Ascending">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onToggleSort('asc'); }}
          sx={{
            p: 0.25,
            color: sortOrder === 'asc' ? '#2196F3' : '#bbb',
            '&:hover': { color: '#2196F3' },
          }}
        >
          <SortAscIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Sort Descending">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onToggleSort('desc'); }}
          sx={{
            p: 0.25,
            color: sortOrder === 'desc' ? '#2196F3' : '#bbb',
            '&:hover': { color: '#2196F3' },
          }}
        >
          <SortDescIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      {/* Filter Icon */}
      <Tooltip title="Add Filter">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onOpenFilter(); }}
          sx={{
            p: 0.25,
            color: hasFilter ? '#ff9800' : '#bbb',
            '&:hover': { color: '#ff9800' },
          }}
        >
          <FilterIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      {/* Aggregation Icon */}
      <Tooltip title="Calculate (Sum, Avg, etc.)">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onOpenAggregation(); }}
          sx={{
            p: 0.25,
            color: hasAggregation ? '#9c27b0' : '#bbb',
            '&:hover': { color: '#9c27b0' },
          }}
        >
          <FunctionsIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      {/* Group Icon */}
      <Tooltip title="Group By">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onToggleGroup(); }}
          sx={{
            p: 0.25,
            color: isGrouped ? '#ff5722' : '#bbb',
            '&:hover': { color: '#ff5722' },
          }}
        >
          <GroupIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function QueryBuilderVisual({ connectedDatabase }: QueryBuilderProps) {
  const { data: schemaData, isLoading: schemaLoading } = useFullSchema(
    connectedDatabase?.id ? Number(connectedDatabase.id) : undefined,
  );

  // Canvas & Tables
  const canvasRef = useRef<SVGSVGElement>(null);
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([]);
  const [tablePositions, setTablePositions] = useState<Record<string, TablePosition>>({});
  const [tableConnections, setTableConnections] = useState<TableConnection[]>([]);

  // Fields & Aggregations
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [groupingRules, setGroupingRules] = useState<GroupingRule[]>([]);

  // Filters & References
  const [visualFilters, setVisualFilters] = useState<VisualFilter[]>([]);
  const [referenceFilters, setReferenceFilters] = useState<ReferenceFilter[]>([]);

  // Connection Mode State
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('none');
  const [connectingFrom, setConnectingFrom] = useState<{ tableId: string; column: string } | null>(null);

  // Dialogs
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [addTableDialogOpen, setAddTableDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [aggDialogOpen, setAggDialogOpen] = useState(false);

  // Filter Dialog State
  const [filterField, setFilterField] = useState<{ tableId: string; columnName: string; type: string } | null>(null);
  const [filterOperator, setFilterOperator] = useState('equals');
  const [filterValue, setFilterValue] = useState('');
  const [filterRangeValue, setFilterRangeValue] = useState<[number, number]>([0, 100]);

  // Aggregation Dialog State
  const [aggField, setAggField] = useState<{ tableId: string; columnName: string } | null>(null);
  const [aggType, setAggType] = useState('count');

  // Right Panel & Preview
  const [rightPanelTab, setRightPanelTab] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<any>(null);

  // Available tables
  const tables = useMemo(() =>
    schemaData?.tables?.map((t: any) => ({
      id: t.name, name: t.name, columns: t.columns || [],
    })) || []
  , [schemaData]);

  // API Endpoint
  const apiEndpoint = useMemo(() => {
    if (selectedTables.length === 0) return '';
    const base = selectedTables.map(t => t.name).join('-');
    return `/api/v1/custom/${base}${visualFilters.length ? '-filtered' : ''}`;
  }, [selectedTables, visualFilters]);

  // Generate SQL Query
  const generatedSql = useMemo(() => {
    if (selectedTables.length === 0) return '';

    const lines: string[] = [];
    
    // SELECT clause
    let selectFields: string[] = [];
    if (selectedFields.length === 0) {
      selectFields = ['*'];
    } else {
      selectFields = selectedFields.map(f => {
        const tableName = f.tableId;
        const colName = `${tableName}.${f.columnName}`;
        if (f.aggregation) {
          return `${f.aggregation.toUpperCase()}(${colName})`;
        }
        if (f.distinct) {
          return `DISTINCT ${colName}`;
        }
        return colName;
      });
    }
    lines.push(`SELECT ${selectFields.join(',\n       ')}`);

    // FROM clause
    const primaryTable = selectedTables[0].name;
    lines.push(`FROM ${primaryTable}`);

    // JOIN clauses
    tableConnections.forEach(conn => {
      lines.push(`INNER JOIN ${conn.targetTableId}`);
      lines.push(`  ON ${conn.sourceTableId}.${conn.sourceColumn} = ${conn.targetTableId}.${conn.targetColumn}`);
    });

    // WHERE clause
    const whereClauses: string[] = [];
    
    // Regular filters
    visualFilters.forEach(f => {
      const col = `${f.tableId}.${f.columnName}`;
      const op = getSqlOperator(f.operator);
      const val = formatSqlValue(f.operator, f.value);
      if (f.operator === 'is_null' || f.operator === 'is_not_null') {
        whereClauses.push(`${col} ${op}`);
      } else {
        whereClauses.push(`${col} ${op} ${val}`);
      }
    });

    // Reference filters (subqueries)
    referenceFilters.forEach(r => {
      const targetCol = `${r.targetTableId}.${r.targetColumn}`;
      const subquery = `(SELECT ${r.sourceColumn} FROM ${r.sourceTableId})`;
      if (r.filterType === 'include') {
        whereClauses.push(`${targetCol} IN ${subquery}`);
      } else {
        whereClauses.push(`${targetCol} NOT IN ${subquery}`);
      }
    });

    if (whereClauses.length > 0) {
      lines.push(`WHERE ${whereClauses.join('\n  AND ')}`);
    }

    // GROUP BY clause
    if (groupingRules.length > 0) {
      const groupCols = groupingRules.map(g => `${g.tableId}.${g.columnName}`);
      lines.push(`GROUP BY ${groupCols.join(', ')}`);
    }

    // ORDER BY clause
    const sortedFields = selectedFields.filter(f => f.sortOrder);
    if (sortedFields.length > 0) {
      const orderCols = sortedFields.map(f => 
        `${f.tableId}.${f.columnName} ${f.sortOrder?.toUpperCase()}`
      );
      lines.push(`ORDER BY ${orderCols.join(', ')}`);
    }

    return lines.join('\n');
  }, [selectedTables, selectedFields, tableConnections, visualFilters, referenceFilters, groupingRules]);

  // Query Description
  const queryDescription = useMemo(() => {
    if (selectedTables.length === 0) return '';
    let desc = selectedFields.length ? selectedFields.map(f => 
      f.aggregation ? `${getAggLabel(f.aggregation)}(${f.columnName})` : f.columnName
    ).join(', ') : 'all columns';
    desc = `SELECT ${desc} FROM ${selectedTables.map(t => t.name).join(' + ')}`;
    if (tableConnections.length) desc += ` (joined)`;
    if (visualFilters.length) desc += ` WHERE ${visualFilters.length} filter(s)`;
    if (referenceFilters.length) desc += ` with ${referenceFilters.length} reference(s)`;
    if (groupingRules.length) desc += ` GROUP BY ${groupingRules.map(g => g.columnName).join(', ')}`;
    return desc;
  }, [selectedTables, selectedFields, tableConnections, visualFilters, referenceFilters, groupingRules]);

  // ============================================================================
  // TABLE HANDLERS
  // ============================================================================

  const handleAddTable = (table: any) => {
    if (!selectedTables.find(t => t.id === table.id)) {
      setSelectedTables(prev => [...prev, {
        id: table.id, name: table.name, columns: table.columns || [],
      }]);
      setTablePositions(prev => ({
        ...prev,
        [table.id]: { x: 50 + selectedTables.length * 300, y: 50 },
      }));
    }
    setAddTableDialogOpen(false);
  };

  const handleRemoveTable = (tableId: string) => {
    setSelectedTables(prev => prev.filter(t => t.id !== tableId));
    setTablePositions(prev => { const p = { ...prev }; delete p[tableId]; return p; });
    setTableConnections(prev => prev.filter(c => c.sourceTableId !== tableId && c.targetTableId !== tableId));
    setSelectedFields(prev => prev.filter(f => f.tableId !== tableId));
    setVisualFilters(prev => prev.filter(f => f.tableId !== tableId));
    setReferenceFilters(prev => prev.filter(r => r.sourceTableId !== tableId && r.targetTableId !== tableId));
    setGroupingRules(prev => prev.filter(g => g.tableId !== tableId));
  };

  const handleTableDrag = (e: React.DragEvent, tableId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('tableId', tableId);
  };

  const handleCanvasDrop = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    const tableId = e.dataTransfer.getData('tableId');
    if (!tableId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setTablePositions(prev => ({
      ...prev,
      [tableId]: { x: Math.max(0, e.clientX - rect.left - 120), y: Math.max(0, e.clientY - rect.top - 20) },
    }));
  };

  // ============================================================================
  // VISUAL CONNECTION HANDLERS
  // ============================================================================

  const startConnection = (mode: ConnectionMode, tableId: string, column: string) => {
    setConnectionMode(mode);
    setConnectingFrom({ tableId, column });
  };

  const handleConnectionDrop = (targetTableId: string, targetColumn: string) => {
    if (!connectingFrom || connectingFrom.tableId === targetTableId) {
      resetConnection();
      return;
    }

    if (connectionMode === 'join') {
      // Create table join
      const conn: TableConnection = {
        id: `${connectingFrom.tableId}-${targetTableId}-${Date.now()}`,
        sourceTableId: connectingFrom.tableId,
        targetTableId: targetTableId,
        sourceColumn: connectingFrom.column,
        targetColumn: targetColumn,
        connectionType: 'matches',
      };
      setTableConnections(prev => [...prev.filter(c => 
        !(c.sourceTableId === conn.sourceTableId && c.targetTableId === conn.targetTableId)
      ), conn]);
    } else if (connectionMode === 'include' || connectionMode === 'exclude') {
      // Create reference filter
      const ref: ReferenceFilter = {
        id: `ref-${Date.now()}`,
        sourceTableId: connectingFrom.tableId,
        sourceColumn: connectingFrom.column,
        targetTableId: targetTableId,
        targetColumn: targetColumn,
        filterType: connectionMode,
      };
      setReferenceFilters(prev => [...prev, ref]);
    }

    resetConnection();
  };

  const resetConnection = () => {
    setConnectionMode('none');
    setConnectingFrom(null);
  };

  // ============================================================================
  // FIELD HANDLERS
  // ============================================================================

  const toggleFieldSelect = (tableId: string, columnName: string) => {
    const exists = selectedFields.find(f => f.tableId === tableId && f.columnName === columnName);
    if (exists) {
      setSelectedFields(prev => prev.filter(f => !(f.tableId === tableId && f.columnName === columnName)));
    } else {
      setSelectedFields(prev => [...prev, { tableId, columnName }]);
    }
  };

  const toggleFieldSort = (tableId: string, columnName: string, order: 'asc' | 'desc') => {
    setSelectedFields(prev => prev.map(f =>
      f.tableId === tableId && f.columnName === columnName
        ? { ...f, sortOrder: f.sortOrder === order ? null : order }
        : f
    ));
  };

  const toggleGrouping = (tableId: string, columnName: string) => {
    const exists = groupingRules.find(g => g.tableId === tableId && g.columnName === columnName);
    if (exists) {
      setGroupingRules(prev => prev.filter(g => !(g.tableId === tableId && g.columnName === columnName)));
    } else {
      setGroupingRules(prev => [...prev, { tableId, columnName }]);
    }
  };

  // ============================================================================
  // FILTER & AGGREGATION
  // ============================================================================

  const openFilterDialog = (tableId: string, columnName: string, type: string) => {
    setFilterField({ tableId, columnName, type });
    setFilterOperator('equals');
    setFilterValue('');
    setFilterDialogOpen(true);
  };

  const handleAddFilter = () => {
    if (!filterField) return;
    setVisualFilters(prev => [...prev, {
      id: `filter-${Date.now()}`,
      tableId: filterField.tableId,
      columnName: filterField.columnName,
      columnType: filterField.type,
      operator: filterOperator,
      value: filterOperator === 'between' ? filterRangeValue : filterValue,
    }]);
    setFilterDialogOpen(false);
  };

  const openAggDialog = (tableId: string, columnName: string) => {
    setAggField({ tableId, columnName });
    setAggType('count');
    setAggDialogOpen(true);
  };

  const handleAddAggregation = () => {
    if (!aggField) return;
    const exists = selectedFields.find(f => f.tableId === aggField.tableId && f.columnName === aggField.columnName);
    if (exists) {
      setSelectedFields(prev => prev.map(f =>
        f.tableId === aggField.tableId && f.columnName === aggField.columnName
          ? { ...f, aggregation: aggType as any }
          : f
      ));
    } else {
      setSelectedFields(prev => [...prev, {
        tableId: aggField.tableId,
        columnName: aggField.columnName,
        aggregation: aggType as any,
      }]);
    }
    setAggDialogOpen(false);
  };

  // ============================================================================
  // PREVIEW & SAVE
  // ============================================================================

  const refreshPreview = () => {
    setPreviewLoading(true);
    setTimeout(() => {
      const data = Array.from({ length: 5 }, (_, i) => {
        const row: Record<string, any> = {};
        selectedFields.forEach(f => {
          row[f.aggregation ? `${f.aggregation}(${f.columnName})` : f.columnName] = 
            f.aggregation ? Math.floor(Math.random() * 1000) : `Value ${i + 1}`;
        });
        return row;
      });
      setPreviewData(data);
      setPreviewLoading(false);
    }, 500);
  };

  const testApi = () => {
    setApiTestResult({ loading: true });
    setTimeout(() => {
      setApiTestResult({ success: true, status: 200, data: previewData, time: '42ms' });
    }, 600);
  };

  const handleSaveApi = async (name: string, desc: string) => {
    const config: QueryConfig = {
      tables: selectedTables.map(t => ({ name: t.name, alias: t.name })),
      tableConnections,
      selectedFields,
      filters: visualFilters.map(f => ({
        id: f.id, tableName: f.tableId, fieldName: f.columnName, operator: f.operator as any, value: f.value,
      })) as FilterCondition[],
      grouping: groupingRules.map(g => ({ tableName: g.tableId, fieldName: g.columnName })),
      having: [],
      apiName: name,
      description: desc,
    };
    console.log('Saving API:', config);
    setSaveDialogOpen(false);
  };

  // ============================================================================
  // DRAWING CONNECTIONS
  // ============================================================================

  const drawConnections = () => {
    const lines: React.ReactElement[] = [];

    // Draw table joins (blue)
    tableConnections.forEach(conn => {
      const from = tablePositions[conn.sourceTableId];
      const to = tablePositions[conn.targetTableId];
      if (!from || !to) return;

      const x1 = from.x + 260, y1 = from.y + 80;
      const x2 = to.x, y2 = to.y + 80;
      const midX = (x1 + x2) / 2;

      lines.push(
        <g key={`join-${conn.id}`}>
          <path
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            stroke="#2196F3"
            strokeWidth="3"
            fill="none"
            markerEnd="url(#arrow-blue)"
          />
          <rect x={midX - 40} y={(y1 + y2) / 2 - 12} width="80" height="24" rx="12" fill="#e3f2fd" stroke="#2196F3" />
          <text x={midX} y={(y1 + y2) / 2 + 4} fill="#1565c0" fontSize="10" textAnchor="middle" fontWeight="600">
            🔗 JOIN
          </text>
        </g>
      );
    });

    // Draw reference filters (green/red)
    referenceFilters.forEach(ref => {
      const from = tablePositions[ref.sourceTableId];
      const to = tablePositions[ref.targetTableId];
      if (!from || !to) return;

      const x1 = from.x + 260, y1 = from.y + 120;
      const x2 = to.x, y2 = to.y + 120;
      const midX = (x1 + x2) / 2;
      const color = ref.filterType === 'include' ? '#4CAF50' : '#f44336';
      const bgColor = ref.filterType === 'include' ? '#e8f5e9' : '#ffebee';

      lines.push(
        <g key={`ref-${ref.id}`}>
          <path
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            stroke={color}
            strokeWidth="2"
            strokeDasharray="6,4"
            fill="none"
            markerEnd={`url(#arrow-${ref.filterType})`}
          />
          <rect x={midX - 45} y={(y1 + y2) / 2 - 12} width="90" height="24" rx="12" fill={bgColor} stroke={color} />
          <text x={midX} y={(y1 + y2) / 2 + 4} fill={color} fontSize="10" textAnchor="middle" fontWeight="600">
            {ref.filterType === 'include' ? '✓ INCLUDE' : '✗ EXCLUDE'}
          </text>
        </g>
      );
    });

    return lines;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ display: 'flex', height: '100%', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
      {/* Main Canvas */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <Header sx={{ py: 1.5, px: 2 }}>
          <Box>
            <Title sx={{ fontSize: 18 }}>Visual Query Builder</Title>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Drag connectors between fields to create relationships
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAddTableDialogOpen(true)}>
              Add Table
            </Button>
            <SaveButton size="small" variant="contained" startIcon={<SaveIcon />} onClick={() => setSaveDialogOpen(true)} disabled={!selectedTables.length}>
              Save API
            </SaveButton>
          </Box>
        </Header>

        {/* Connection Mode Indicator */}
        {connectionMode !== 'none' && (
          <Box sx={{ 
            px: 2, py: 1, 
            backgroundColor: connectionMode === 'join' ? '#e3f2fd' : connectionMode === 'include' ? '#e8f5e9' : '#ffebee',
            borderBottom: '1px solid',
            borderColor: connectionMode === 'join' ? '#90caf9' : connectionMode === 'include' ? '#a5d6a7' : '#ef9a9a',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {connectionMode === 'join' && '🔗 Creating JOIN: Drop on target field to connect tables'}
              {connectionMode === 'include' && '✓ Creating INCLUDE filter: Drop on target to include matching rows'}
              {connectionMode === 'exclude' && '✗ Creating EXCLUDE filter: Drop on target to exclude matching rows'}
            </Typography>
            <Button size="small" variant="outlined" onClick={resetConnection}>Cancel</Button>
          </Box>
        )}

        {/* Query Description */}
        {queryDescription && (
          <Box sx={{ px: 2, py: 0.75, backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="caption" sx={{ color: '#666', fontFamily: 'monospace' }}>
              {queryDescription}
            </Typography>
          </Box>
        )}

        {/* Canvas Area */}
        {selectedTables.length === 0 ? (
          <EmptyStateMessage>
            <StorageIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>Start Building Your Query</Typography>
            <Typography variant="body2" sx={{ color: '#999', mb: 3, maxWidth: 400, textAlign: 'center' }}>
              Add tables, then use the visual connectors on each field to create joins, filters, and references.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddTableDialogOpen(true)}>
              Add First Table
            </Button>
          </EmptyStateMessage>
        ) : (
          <Canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', minHeight: 500 }}
            viewBox="0 0 1400 800"
            preserveAspectRatio="xMinYMin meet"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCanvasDrop}
          >
            <defs>
              <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#2196F3" />
              </marker>
              <marker id="arrow-include" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#4CAF50" />
              </marker>
              <marker id="arrow-exclude" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#f44336" />
              </marker>
            </defs>

            {drawConnections()}

            {/* Tables */}
            {selectedTables.map(table => {
              const pos = tablePositions[table.id] || { x: 0, y: 0 };

              return (
                <foreignObject key={table.id} x={pos.x} y={pos.y} width="260" height="450" style={{ overflow: 'visible' }}>
                  <TableCard
                    draggable
                    onDragStart={(e) => handleTableDrag(e, table.id)}
                    sx={{ cursor: 'grab', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', '&:active': { cursor: 'grabbing' } }}
                  >
                    {/* Table Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <DragIcon sx={{ color: '#999', fontSize: 18 }} />
                      <TableCardTitle sx={{ flex: 1, textAlign: 'center' }}>{table.name}</TableCardTitle>
                      <IconButton size="small" onClick={() => handleRemoveTable(table.id)} sx={{ color: '#d32f2f', p: 0.25 }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    <Divider sx={{ mb: 1 }} />

                    {/* Connection Mode Legend */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip icon={<DotIcon sx={{ fontSize: 10, color: '#2196F3 !important' }} />} label="Join" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                      <Chip icon={<DotIcon sx={{ fontSize: 10, color: '#4CAF50 !important' }} />} label="Include" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                      <Chip icon={<DotIcon sx={{ fontSize: 10, color: '#f44336 !important' }} />} label="Exclude" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                    </Box>

                    {/* Fields */}
                    <TableCardFields>
                      {table.columns.slice(0, 12).map(field => {
                        const isSelected = selectedFields.some(f => f.tableId === table.id && f.columnName === field.name);
                        const fieldData = selectedFields.find(f => f.tableId === table.id && f.columnName === field.name);
                        const hasFilter = visualFilters.some(f => f.tableId === table.id && f.columnName === field.name);
                        const isGrouped = groupingRules.some(g => g.tableId === table.id && g.columnName === field.name);
                        const hasJoin = tableConnections.some(c => 
                          (c.sourceTableId === table.id && c.sourceColumn === field.name) ||
                          (c.targetTableId === table.id && c.targetColumn === field.name)
                        );
                        const hasRef = referenceFilters.some(r =>
                          (r.sourceTableId === table.id && r.sourceColumn === field.name) ||
                          (r.targetTableId === table.id && r.targetColumn === field.name)
                        );

                        return (
                          <Box
                            key={field.name}
                            onClick={() => toggleFieldSelect(table.id, field.name)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              p: 0.75,
                              borderRadius: 1,
                              backgroundColor: isSelected ? '#e3f2fd' : '#fafafa',
                              border: `1px solid ${isSelected ? '#2196F3' : '#e0e0e0'}`,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              '&:hover': { backgroundColor: '#f0f7ff', borderColor: '#90caf9' },
                            }}
                          >
                            {/* Left Connectors: Join, Include, Exclude */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                              <ConnectorPoint
                                type="join"
                                position="left"
                                connected={hasJoin}
                                tooltip="Drag to JOIN tables"
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  startConnection('join', table.id, field.name);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleConnectionDrop(table.id, field.name);
                                }}
                              />
                              <ConnectorPoint
                                type="include"
                                position="left"
                                connected={hasRef && referenceFilters.some(r => r.filterType === 'include' && (
                                  (r.sourceTableId === table.id && r.sourceColumn === field.name) ||
                                  (r.targetTableId === table.id && r.targetColumn === field.name)
                                ))}
                                tooltip="Drag to INCLUDE matching rows"
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  startConnection('include', table.id, field.name);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleConnectionDrop(table.id, field.name);
                                }}
                              />
                              <ConnectorPoint
                                type="exclude"
                                position="left"
                                connected={hasRef && referenceFilters.some(r => r.filterType === 'exclude' && (
                                  (r.sourceTableId === table.id && r.sourceColumn === field.name) ||
                                  (r.targetTableId === table.id && r.targetColumn === field.name)
                                ))}
                                tooltip="Drag to EXCLUDE matching rows"
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  startConnection('exclude', table.id, field.name);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleConnectionDrop(table.id, field.name);
                                }}
                              />
                            </Box>

                            {/* Field Info */}
                            <Box sx={{ flex: 1, minWidth: 0, mx: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400, fontSize: '0.8rem' }} noWrap>
                                  {field.name}
                                </Typography>
                                {fieldData?.aggregation && (
                                  <Chip label={getAggLabel(fieldData.aggregation)} size="small" color="secondary" sx={{ height: 16, fontSize: '0.6rem' }} />
                                )}
                                {isGrouped && (
                                  <Chip label="GRP" size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: '#ff5722', color: 'white' }} />
                                )}
                                {hasFilter && (
                                  <Chip label="⚡" size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: '#ff9800', color: 'white' }} />
                                )}
                              </Box>
                              <Typography variant="caption" sx={{ color: '#999', fontSize: '0.65rem' }}>
                                {field.type}
                              </Typography>
                            </Box>

                            {/* Right Actions */}
                            {isSelected && (
                              <FieldActions
                                tableId={table.id}
                                field={field}
                                isSelected={isSelected}
                                hasFilter={hasFilter}
                                hasAggregation={fieldData?.aggregation || null}
                                sortOrder={fieldData?.sortOrder || null}
                                isGrouped={isGrouped}
                                onToggleSelect={() => toggleFieldSelect(table.id, field.name)}
                                onToggleSort={(order) => toggleFieldSort(table.id, field.name, order)}
                                onOpenFilter={() => openFilterDialog(table.id, field.name, field.type)}
                                onOpenAggregation={() => openAggDialog(table.id, field.name)}
                                onToggleGroup={() => toggleGrouping(table.id, field.name)}
                              />
                            )}
                          </Box>
                        );
                      })}
                      {table.columns.length > 12 && (
                        <Typography variant="caption" sx={{ color: '#999', textAlign: 'center', py: 0.5 }}>
                          +{table.columns.length - 12} more
                        </Typography>
                      )}
                    </TableCardFields>
                  </TableCard>
                </foreignObject>
              );
            })}
          </Canvas>
        )}
      </Box>

      {/* Right Panel */}
      {selectedTables.length > 0 && (
        <Box sx={{
          width: { xs: 300, md: 360 },
          minWidth: { xs: 300, md: 360 },
          flexShrink: 0,
          backgroundColor: 'white',
          borderLeft: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <Tabs value={rightPanelTab} onChange={(_, v) => setRightPanelTab(v)} variant="fullWidth" sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Tab icon={<ColumnIcon sx={{ fontSize: 16 }} />} label="Fields" sx={{ fontSize: '0.7rem', minHeight: 40 }} />
            <Tab icon={<LinkIcon sx={{ fontSize: 16 }} />} label="Links" sx={{ fontSize: '0.7rem', minHeight: 40 }} />
            <Tab icon={<CodeIcon sx={{ fontSize: 16 }} />} label="SQL" sx={{ fontSize: '0.7rem', minHeight: 40 }} />
            <Tab icon={<PlayIcon sx={{ fontSize: 16 }} />} label="Preview" sx={{ fontSize: '0.7rem', minHeight: 40 }} />
          </Tabs>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
            {/* Fields Tab */}
            {rightPanelTab === 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Selected Fields ({selectedFields.length})</Typography>
                {selectedFields.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: '0.8rem' }}>Click fields in tables to select them</Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {selectedFields.map(f => (
                      <Paper key={`${f.tableId}-${f.columnName}`} sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {f.aggregation ? `${getAggLabel(f.aggregation)}(${f.columnName})` : f.columnName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>{f.tableId}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                          {f.sortOrder === 'asc' && <Chip label="↑" size="small" sx={{ height: 18 }} />}
                          {f.sortOrder === 'desc' && <Chip label="↓" size="small" sx={{ height: 18 }} />}
                          <IconButton size="small" onClick={() => toggleFieldSelect(f.tableId, f.columnName)}>
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}

                {/* Filters Summary */}
                {visualFilters.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Filters ({visualFilters.length})</Typography>
                    {visualFilters.map(f => (
                      <Paper key={f.id} sx={{ p: 1, mb: 0.5, backgroundColor: '#fff8e1' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption">
                            {f.columnName} {getOperatorLabel(f.operator)} {String(f.value)}
                          </Typography>
                          <IconButton size="small" onClick={() => setVisualFilters(prev => prev.filter(x => x.id !== f.id))}>
                            <CloseIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}

                {/* Grouping Summary */}
                {groupingRules.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Group By</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {groupingRules.map(g => (
                        <Chip
                          key={`${g.tableId}-${g.columnName}`}
                          label={g.columnName}
                          onDelete={() => toggleGrouping(g.tableId, g.columnName)}
                          size="small"
                          sx={{ backgroundColor: '#ff5722', color: 'white' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* Links Tab */}
            {rightPanelTab === 1 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Table Joins ({tableConnections.length})</Typography>
                {tableConnections.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: '0.8rem' }}>Drag blue connectors between fields to join tables</Alert>
                ) : (
                  tableConnections.map(c => (
                    <Paper key={c.id} sx={{ p: 1, mb: 0.5, backgroundColor: '#e3f2fd' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption">
                          🔗 {c.sourceTableId}.{c.sourceColumn} = {c.targetTableId}.{c.targetColumn}
                        </Typography>
                        <IconButton size="small" onClick={() => setTableConnections(prev => prev.filter(x => x.id !== c.id))}>
                          <CloseIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))
                )}

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>Reference Filters ({referenceFilters.length})</Typography>
                {referenceFilters.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: '0.8rem' }}>Drag green/red connectors to filter by related data</Alert>
                ) : (
                  referenceFilters.map(r => (
                    <Paper key={r.id} sx={{ p: 1, mb: 0.5, backgroundColor: r.filterType === 'include' ? '#e8f5e9' : '#ffebee' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption">
                          {r.filterType === 'include' ? '✓' : '✗'} {r.targetTableId}.{r.targetColumn} {r.filterType === 'include' ? 'IN' : 'NOT IN'} {r.sourceTableId}.{r.sourceColumn}
                        </Typography>
                        <IconButton size="small" onClick={() => setReferenceFilters(prev => prev.filter(x => x.id !== r.id))}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Generated SQL</Typography>
                  <Tooltip title="Copy SQL">
                    <IconButton 
                      size="small" 
                      onClick={() => navigator.clipboard.writeText(generatedSql)}
                      disabled={!generatedSql}
                    >
                      <CopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {!generatedSql ? (
                  <Alert severity="info" sx={{ fontSize: '0.8rem' }}>Add tables and select fields to generate SQL</Alert>
                ) : (
                  <Paper 
                    sx={{ 
                      p: 1.5, 
                      backgroundColor: '#1e1e1e', 
                      borderRadius: 1,
                      maxHeight: 400,
                      overflow: 'auto',
                    }}
                  >
                    <pre style={{ 
                      margin: 0, 
                      fontFamily: '"Fira Code", "Consolas", monospace',
                      fontSize: '0.75rem',
                      lineHeight: 1.6,
                      color: '#d4d4d4',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}>
                      {generatedSql.split('\n').map((line, i) => {
                        // Syntax highlighting
                        const highlighted = line
                          .replace(/\b(SELECT|FROM|WHERE|AND|OR|INNER JOIN|LEFT JOIN|RIGHT JOIN|ON|GROUP BY|ORDER BY|HAVING|DISTINCT|IN|NOT IN|LIKE|BETWEEN|IS NULL|IS NOT NULL|ASC|DESC|COUNT|SUM|AVG|MIN|MAX)\b/gi, 
                            match => `<span style="color: #569cd6; font-weight: 600">${match.toUpperCase()}</span>`)
                          .replace(/'[^']*'/g, match => `<span style="color: #ce9178">${match}</span>`)
                          .replace(/\b\d+\b/g, match => `<span style="color: #b5cea8">${match}</span>`);
                        return (
                          <Box key={i} component="span" sx={{ display: 'block' }}>
                            <span style={{ color: '#6a9955', marginRight: 8, userSelect: 'none' }}>{String(i + 1).padStart(2, ' ')}</span>
                            <span dangerouslySetInnerHTML={{ __html: highlighted }} />
                          </Box>
                        );
                      })}
                    </pre>
                  </Paper>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Query Summary</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Chip label={`${selectedTables.length} table(s)`} size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  <Chip label={`${selectedFields.length || 'All'} field(s)`} size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  {tableConnections.length > 0 && <Chip label={`${tableConnections.length} join(s)`} size="small" color="primary" sx={{ alignSelf: 'flex-start' }} />}
                  {visualFilters.length > 0 && <Chip label={`${visualFilters.length} filter(s)`} size="small" color="warning" sx={{ alignSelf: 'flex-start' }} />}
                  {referenceFilters.length > 0 && <Chip label={`${referenceFilters.length} subquery(ies)`} size="small" color="secondary" sx={{ alignSelf: 'flex-start' }} />}
                  {groupingRules.length > 0 && <Chip label={`Grouped by ${groupingRules.length} field(s)`} size="small" sx={{ alignSelf: 'flex-start', backgroundColor: '#ff5722', color: 'white' }} />}
                </Box>
              </Box>
            )}

            {/* Preview Tab */}
            {rightPanelTab === 3 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Data Preview</Typography>
                  <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={refreshPreview} disabled={previewLoading || !selectedFields.length}>
                    Refresh
                  </Button>
                </Box>

                {previewLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
                ) : previewData.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: '0.8rem' }}>Select fields and click Refresh to preview data</Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {Object.keys(previewData[0]).map(k => (
                            <TableCell key={k} sx={{ fontWeight: 600, fontSize: '0.7rem' }}>{k}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {previewData.map((row, i) => (
                          <TableRow key={i}>
                            {Object.values(row).map((v: any, j) => (
                              <TableCell key={j} sx={{ fontSize: '0.75rem' }}>{String(v)}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>API Endpoint</Typography>
                <Paper sx={{ p: 1, backgroundColor: '#f5f5f5', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{apiEndpoint || 'No endpoint yet'}</Typography>
                </Paper>
                <Button fullWidth size="small" variant="contained" startIcon={<PlayIcon />} onClick={testApi} disabled={!apiEndpoint}>
                  Test API
                </Button>
                {apiTestResult && !apiTestResult.loading && (
                  <Alert severity={apiTestResult.success ? 'success' : 'error'} sx={{ mt: 1, fontSize: '0.75rem' }}>
                    Status: {apiTestResult.status} ({apiTestResult.time})
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ====== DIALOGS ====== */}

      {/* Add Table Dialog */}
      <Dialog open={addTableDialogOpen} onClose={() => setAddTableDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Table</DialogTitle>
        <DialogContent>
          {schemaLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tables.filter((t: any) => !selectedTables.find(s => s.id === t.id)).map((t: any) => (
                <Button key={t.id} variant="outlined" onClick={() => handleAddTable(t)} fullWidth sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  <StorageIcon sx={{ mr: 1 }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{t.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>{t.columns?.length || 0} columns</Typography>
                  </Box>
                </Button>
              ))}
              {tables.filter((t: any) => !selectedTables.find(s => s.id === t.id)).length === 0 && (
                <Alert severity="info">All tables added</Alert>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Filter: {filterField?.columnName}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Condition</InputLabel>
            <Select value={filterOperator} onChange={(e) => setFilterOperator(e.target.value)} label="Condition">
              <MenuItem value="equals">Equals (=)</MenuItem>
              <MenuItem value="not_equals">Not Equals (≠)</MenuItem>
              <MenuItem value="contains">Contains</MenuItem>
              <MenuItem value="gt">Greater Than (&gt;)</MenuItem>
              <MenuItem value="lt">Less Than (&lt;)</MenuItem>
              <MenuItem value="gte">Greater or Equal (≥)</MenuItem>
              <MenuItem value="lte">Less or Equal (≤)</MenuItem>
              <MenuItem value="between">Between</MenuItem>
              <MenuItem value="is_null">Is Empty</MenuItem>
              <MenuItem value="is_not_null">Is Not Empty</MenuItem>
            </Select>
          </FormControl>
          {filterOperator === 'between' ? (
            <Box sx={{ px: 1 }}>
              <Typography variant="body2">Range: {filterRangeValue[0]} - {filterRangeValue[1]}</Typography>
              <Slider value={filterRangeValue} onChange={(_, v) => setFilterRangeValue(v as [number, number])} min={0} max={1000} />
            </Box>
          ) : !['is_null', 'is_not_null'].includes(filterOperator) && (
            <TextField fullWidth label="Value" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddFilter}>Add Filter</Button>
        </DialogActions>
      </Dialog>

      {/* Aggregation Dialog */}
      <Dialog open={aggDialogOpen} onClose={() => setAggDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Calculate: {aggField?.columnName}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Calculation</InputLabel>
            <Select value={aggType} onChange={(e) => setAggType(e.target.value)} label="Calculation">
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
          <Button variant="contained" onClick={handleAddAggregation}>Apply</Button>
        </DialogActions>
      </Dialog>

      {/* Save API Dialog */}
      <SaveApiDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveApi}
        selectedTables={selectedTables.map(t => ({ id: t.id, name: t.name }))}
        selectedFields={selectedFields}
      />
    </Box>
  );
}

export default QueryBuilderVisual;
