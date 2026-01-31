import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  InputAdornment,
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
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Storage as StorageIcon,
  ViewColumn as ColumnIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
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
  ConnectionPoint,
  FieldItem,
  EmptyStateMessage,
} from './QueryBuilder.styles';
import type { QueryConfig, TableConnection, FilterCondition } from './QueryBuilder.types';

// ============================================================================
// INTERFACES
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
  alias?: string;
}

interface VisualFilter {
  id: string;
  tableId: string;
  columnName: string;
  columnType: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between' | 'is_null' | 'is_not_null';
  value: string | number | string[] | [number, number];
  label: string; // Human-readable label
}

interface Subquery {
  id: string;
  name: string;
  description: string;
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getOperatorLabel = (operator: string): string => {
  const labels: Record<string, string> = {
    equals: 'is exactly',
    not_equals: 'is not',
    contains: 'contains',
    starts_with: 'starts with',
    ends_with: 'ends with',
    gt: 'is greater than',
    lt: 'is less than',
    gte: 'is at least',
    lte: 'is at most',
    in: 'is one of',
    between: 'is between',
    is_null: 'is empty',
    is_not_null: 'is not empty',
  };
  return labels[operator] || operator;
};

const getAggregationLabel = (agg: string): string => {
  const labels: Record<string, string> = {
    count: 'Count',
    sum: 'Total',
    avg: 'Average',
    min: 'Minimum',
    max: 'Maximum',
  };
  return labels[agg] || agg;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function QueryBuilderComplete({ connectedDatabase }: QueryBuilderProps) {
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
  
  // Filters & Subqueries
  const [visualFilters, setVisualFilters] = useState<VisualFilter[]>([]);
  const [subqueries, setSubqueries] = useState<Subquery[]>([]);
  
  // Dialogs
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [addTableDialogOpen, setAddTableDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [aggregationDialogOpen, setAggregationDialogOpen] = useState(false);
  const [subqueryDialogOpen, setSubqueryDialogOpen] = useState(false);
  
  // Right Panel
  const [rightPanelTab, setRightPanelTab] = useState(0);
  
  // Preview & API
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState<string>('');
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  
  // Connection State
  const connectionInitiatedRef = useRef(false);
  const [connectingFrom, setConnectingFrom] = useState<{ tableId: string; columnName: string } | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectingTo, setConnectingTo] = useState<{ tableId: string; columnName: string } | null>(null);
  
  // Filter Dialog State
  const [filterField, setFilterField] = useState<{ tableId: string; columnName: string; type: string } | null>(null);
  const [filterOperator, setFilterOperator] = useState<string>('equals');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filterRangeValue, setFilterRangeValue] = useState<[number, number]>([0, 100]);
  
  // Aggregation Dialog State
  const [aggField, setAggField] = useState<{ tableId: string; columnName: string } | null>(null);
  const [aggType, setAggType] = useState<string>('count');
  
  // Subquery Dialog State
  const [subquerySource, setSubquerySource] = useState<{ tableId: string; column: string }>({ tableId: '', column: '' });
  const [subqueryTarget, setSubqueryTarget] = useState<{ tableId: string; column: string }>({ tableId: '', column: '' });
  const [subqueryType, setSubqueryType] = useState<'include' | 'exclude'>('include');
  const [subqueryName, setSubqueryName] = useState('');

  // Available tables from schema
  const tables = useMemo(() => 
    schemaData?.tables?.map((table: any) => ({
      id: table.name,
      name: table.name,
      columns: table.columns || [],
    })) || []
  , [schemaData]);

  // Generate preview query description
  const queryDescription = useMemo(() => {
    if (selectedTables.length === 0) return '';
    
    let desc = `Showing `;
    
    if (selectedFields.length === 0) {
      desc += `all columns`;
    } else {
      const fieldDescs = selectedFields.map(f => {
        let fieldDesc = f.columnName;
        if (f.aggregation) {
          fieldDesc = `${getAggregationLabel(f.aggregation)} of ${f.columnName}`;
        }
        if (f.distinct) {
          fieldDesc = `unique ${fieldDesc}`;
        }
        return fieldDesc;
      });
      desc += fieldDescs.join(', ');
    }
    
    desc += ` from ${selectedTables.map(t => t.name).join(' + ')}`;
    
    if (tableConnections.length > 0) {
      desc += ` (combined where matching)`;
    }
    
    if (visualFilters.length > 0) {
      desc += ` filtered by ${visualFilters.length} condition${visualFilters.length > 1 ? 's' : ''}`;
    }
    
    if (subqueries.length > 0) {
      desc += ` with ${subqueries.length} reference filter${subqueries.length > 1 ? 's' : ''}`;
    }
    
    if (groupingRules.length > 0) {
      desc += ` grouped by ${groupingRules.map(g => g.columnName).join(', ')}`;
    }
    
    const sortedFields = selectedFields.filter(f => f.sortOrder);
    if (sortedFields.length > 0) {
      desc += ` sorted by ${sortedFields.map(f => `${f.columnName} ${f.sortOrder === 'asc' ? '↑' : '↓'}`).join(', ')}`;
    }
    
    return desc;
  }, [selectedTables, selectedFields, tableConnections, visualFilters, subqueries, groupingRules]);

  // ============================================================================
  // TABLE HANDLERS
  // ============================================================================

  const handleAddTable = (table: any) => {
    if (!selectedTables.find((t) => t.id === table.id)) {
      const newPosition: TablePosition = {
        x: 50 + selectedTables.length * 280,
        y: 50,
      };
      const newTable: SelectedTable = {
        id: table.id,
        name: table.name,
        columns: table.columns || [],
      };
      setSelectedTables((prev) => [...prev, newTable]);
      setTablePositions((prev) => ({ ...prev, [table.id]: newPosition }));
    }
    setAddTableDialogOpen(false);
  };

  const handleRemoveTable = (tableId: string) => {
    setSelectedTables((prev) => prev.filter((t) => t.id !== tableId));
    const newPos = { ...tablePositions };
    delete newPos[tableId];
    setTablePositions(newPos);
    setTableConnections((prev) =>
      prev.filter((c) => c.sourceTableId !== tableId && c.targetTableId !== tableId),
    );
    setSelectedFields((prev) => prev.filter((f) => f.tableId !== tableId));
    setVisualFilters((prev) => prev.filter((f) => f.tableId !== tableId));
    setGroupingRules((prev) => prev.filter((g) => g.tableId !== tableId));
    setSubqueries((prev) => prev.filter((s) => s.sourceTableId !== tableId && s.targetTableId !== tableId));
  };

  const handleTableDragStart = (e: React.DragEvent<any>, tableId: string) => {
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('tableId', tableId);
  };

  const handleCanvasDragOver = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
  };

  const handleCanvasDrop = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    const tableId = e.dataTransfer!.getData('tableId');
    if (!tableId || !canvasRef.current) return;

    const svgRect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, e.clientX - svgRect.left - 100);
    const newY = Math.max(0, e.clientY - svgRect.top - 40);

    setTablePositions((prev) => ({
      ...prev,
      [tableId]: { x: newX, y: newY },
    }));
  };

  // ============================================================================
  // CONNECTION HANDLERS
  // ============================================================================

  const handleConnectionDragStart = (e: React.DragEvent<HTMLDivElement>, fromTableId: string, columnName: string) => {
    e.stopPropagation();
    e.dataTransfer!.effectAllowed = 'link';
    e.dataTransfer!.setData('sourceTableId', fromTableId);
    e.dataTransfer!.setData('sourceColumnName', columnName);
    setConnectingFrom({ tableId: fromTableId, columnName });
  };

  const handleConnectionDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'link';
  };

  const handleConnectionDrop = (e: React.DragEvent<HTMLDivElement>, toTableId: string, toColumnName: string) => {
    e.preventDefault();
    e.stopPropagation();

    const sourceTableId = e.dataTransfer!.getData('sourceTableId');
    const sourceColumnName = e.dataTransfer!.getData('sourceColumnName');

    if (sourceTableId && sourceColumnName && sourceTableId !== toTableId) {
      connectionInitiatedRef.current = true;
      setConnectingFrom({ tableId: sourceTableId, columnName: sourceColumnName });
      setConnectingTo({ tableId: toTableId, columnName: toColumnName });
      setConnectDialogOpen(true);
    }
    setConnectingFrom(null);
  };

  const handleConfirmConnection = () => {
    if (connectingFrom && connectingTo) {
      const connection: TableConnection = {
        id: `${connectingFrom.tableId}-${connectingTo.tableId}`,
        sourceTableId: connectingFrom.tableId,
        targetTableId: connectingTo.tableId,
        sourceColumn: connectingFrom.columnName,
        targetColumn: connectingTo.columnName,
        connectionType: 'matches',
      };

      setTableConnections((prev) => {
        const filtered = prev.filter(
          (c) => !(c.sourceTableId === connection.sourceTableId && c.targetTableId === connection.targetTableId),
        );
        return [...filtered, connection];
      });

      setConnectDialogOpen(false);
      setConnectingFrom(null);
      setConnectingTo(null);
    }
  };

  const handleCloseConnectionDialog = () => {
    connectionInitiatedRef.current = false;
    setConnectDialogOpen(false);
    setConnectingFrom(null);
    setConnectingTo(null);
  };

  // ============================================================================
  // FIELD SELECTION HANDLERS
  // ============================================================================

  const handleSelectField = (tableId: string, columnName: string) => {
    const existing = selectedFields.find((f) => f.tableId === tableId && f.columnName === columnName);
    if (existing) {
      setSelectedFields((prev) => prev.filter((f) => !(f.tableId === tableId && f.columnName === columnName)));
    } else {
      setSelectedFields((prev) => [...prev, { tableId, columnName }]);
    }
  };

  const toggleFieldSort = (tableId: string, columnName: string, order: 'asc' | 'desc') => {
    setSelectedFields((prev) =>
      prev.map((f) =>
        f.tableId === tableId && f.columnName === columnName
          ? { ...f, sortOrder: f.sortOrder === order ? null : order }
          : f
      )
    );
  };

  const toggleFieldDistinct = (tableId: string, columnName: string) => {
    setSelectedFields((prev) =>
      prev.map((f) =>
        f.tableId === tableId && f.columnName === columnName
          ? { ...f, distinct: !f.distinct }
          : f
      )
    );
  };

  const setFieldAggregation = (tableId: string, columnName: string, aggregation: string | null) => {
    setSelectedFields((prev) =>
      prev.map((f) =>
        f.tableId === tableId && f.columnName === columnName
          ? { ...f, aggregation: aggregation as any }
          : f
      )
    );
  };

  // ============================================================================
  // FILTER HANDLERS
  // ============================================================================

  const openFilterDialog = (tableId: string, columnName: string, columnType: string) => {
    setFilterField({ tableId, columnName, type: columnType });
    setFilterOperator('equals');
    setFilterValue('');
    setFilterRangeValue([0, 100]);
    setFilterDialogOpen(true);
  };

  const handleAddFilter = () => {
    if (!filterField) return;
    
    const newFilter: VisualFilter = {
      id: `filter-${Date.now()}`,
      tableId: filterField.tableId,
      columnName: filterField.columnName,
      columnType: filterField.type,
      operator: filterOperator as any,
      value: filterOperator === 'between' ? filterRangeValue : filterValue,
      label: `${filterField.columnName} ${getOperatorLabel(filterOperator)} ${filterOperator === 'between' ? `${filterRangeValue[0]} and ${filterRangeValue[1]}` : filterValue}`,
    };
    
    setVisualFilters((prev) => [...prev, newFilter]);
    setFilterDialogOpen(false);
    setFilterField(null);
  };

  const removeFilter = (filterId: string) => {
    setVisualFilters((prev) => prev.filter((f) => f.id !== filterId));
  };

  // ============================================================================
  // AGGREGATION HANDLERS
  // ============================================================================

  const openAggregationDialog = (tableId: string, columnName: string) => {
    setAggField({ tableId, columnName });
    setAggType('count');
    setAggregationDialogOpen(true);
  };

  const handleAddAggregation = () => {
    if (!aggField) return;
    
    // Check if field is already selected
    const existing = selectedFields.find(f => f.tableId === aggField.tableId && f.columnName === aggField.columnName);
    
    if (existing) {
      setFieldAggregation(aggField.tableId, aggField.columnName, aggType);
    } else {
      setSelectedFields((prev) => [...prev, {
        tableId: aggField.tableId,
        columnName: aggField.columnName,
        aggregation: aggType as any,
      }]);
    }
    
    setAggregationDialogOpen(false);
    setAggField(null);
  };

  // ============================================================================
  // GROUPING HANDLERS
  // ============================================================================

  const toggleGrouping = (tableId: string, columnName: string) => {
    const existing = groupingRules.find(g => g.tableId === tableId && g.columnName === columnName);
    if (existing) {
      setGroupingRules((prev) => prev.filter(g => !(g.tableId === tableId && g.columnName === columnName)));
    } else {
      setGroupingRules((prev) => [...prev, { tableId, columnName }]);
    }
  };

  // ============================================================================
  // SUBQUERY HANDLERS
  // ============================================================================

  const openSubqueryDialog = () => {
    setSubquerySource({ tableId: '', column: '' });
    setSubqueryTarget({ tableId: '', column: '' });
    setSubqueryType('include');
    setSubqueryName('');
    setSubqueryDialogOpen(true);
  };

  const handleAddSubquery = () => {
    if (!subquerySource.tableId || !subquerySource.column || !subqueryTarget.tableId || !subqueryTarget.column) return;
    
    const newSubquery: Subquery = {
      id: `subquery-${Date.now()}`,
      name: subqueryName || `Reference from ${subquerySource.tableId}`,
      description: `${subqueryType === 'include' ? 'Include' : 'Exclude'} ${subqueryTarget.tableId} where ${subqueryTarget.column} matches ${subquerySource.tableId}.${subquerySource.column}`,
      sourceTableId: subquerySource.tableId,
      sourceColumn: subquerySource.column,
      targetTableId: subqueryTarget.tableId,
      targetColumn: subqueryTarget.column,
      filterType: subqueryType,
    };
    
    setSubqueries((prev) => [...prev, newSubquery]);
    setSubqueryDialogOpen(false);
  };

  const removeSubquery = (subqueryId: string) => {
    setSubqueries((prev) => prev.filter((s) => s.id !== subqueryId));
  };

  // ============================================================================
  // PREVIEW & API HANDLERS
  // ============================================================================

  const refreshPreview = async () => {
    setPreviewLoading(true);
    // Simulate API call for preview data
    setTimeout(() => {
      const mockData = Array.from({ length: 5 }, (_, i) => {
        const row: Record<string, any> = {};
        selectedFields.forEach(f => {
          if (f.aggregation) {
            row[`${f.aggregation}_${f.columnName}`] = Math.floor(Math.random() * 1000);
          } else {
            row[f.columnName] = `Sample ${i + 1}`;
          }
        });
        return row;
      });
      setPreviewData(mockData);
      setPreviewLoading(false);
    }, 500);
  };

  const generateApiEndpoint = () => {
    if (selectedTables.length === 0) return '';
    
    const tablePart = selectedTables.map(t => t.name).join('-');
    const filterPart = visualFilters.length > 0 ? '-filtered' : '';
    const aggPart = selectedFields.some(f => f.aggregation) ? '-aggregated' : '';
    
    return `/api/v1/custom/${tablePart}${filterPart}${aggPart}`;
  };

  useEffect(() => {
    setApiEndpoint(generateApiEndpoint());
  }, [selectedTables, visualFilters, selectedFields]);

  const testApiEndpoint = async () => {
    setApiTestResult({ loading: true });
    // Simulate API test
    setTimeout(() => {
      setApiTestResult({
        success: true,
        status: 200,
        data: previewData,
        responseTime: '45ms',
      });
    }, 800);
  };

  const copyApiEndpoint = () => {
    navigator.clipboard.writeText(apiEndpoint);
  };

  // ============================================================================
  // SAVE HANDLER
  // ============================================================================

  const handleSaveApi = async (apiName: string, description: string) => {
    const queryConfig: QueryConfig = {
      tables: selectedTables.map((t) => ({ name: t.name, alias: t.name })),
      tableConnections,
      selectedFields,
      filters: visualFilters.map(vf => ({
        id: vf.id,
        tableName: vf.tableId,
        fieldName: vf.columnName,
        operator: vf.operator as any,
        value: vf.value,
      })) as FilterCondition[],
      grouping: groupingRules.map(g => ({ tableName: g.tableId, fieldName: g.columnName })),
      having: [],
      apiName,
      description,
    };
    console.log('Query Config:', queryConfig);
    setSaveDialogOpen(false);
  };

  // ============================================================================
  // DRAWING HELPERS
  // ============================================================================

  const drawConnectionLines = () => {
    return tableConnections
      .map((conn) => {
        const fromPos = tablePositions[conn.sourceTableId];
        const toPos = tablePositions[conn.targetTableId];
        if (!fromPos || !toPos) return null;

        const fromX = fromPos.x + 240;
        const fromY = fromPos.y + 100;
        const toX = toPos.x;
        const toY = toPos.y + 100;

        // Create a curved path
        const midX = (fromX + toX) / 2;
        const pathD = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;

        return (
          <g key={`conn-${conn.id}`}>
            <path
              d={pathD}
              stroke="#2196F3"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrowhead)"
              style={{ pointerEvents: 'none' }}
            />
            <text
              x={midX}
              y={(fromY + toY) / 2 - 10}
              fill="#666"
              fontSize="11"
              textAnchor="middle"
              style={{ pointerEvents: 'none' }}
            >
              {conn.sourceColumn} = {conn.targetColumn}
            </text>
          </g>
        );
      })
      .filter((line) => line !== null);
  };

  const drawSubqueryLines = () => {
    return subqueries
      .map((sq) => {
        const fromPos = tablePositions[sq.sourceTableId];
        const toPos = tablePositions[sq.targetTableId];
        if (!fromPos || !toPos) return null;

        const fromX = fromPos.x + 120;
        const fromY = fromPos.y + 380;
        const toX = toPos.x + 120;
        const toY = toPos.y + 380;

        return (
          <g key={`subquery-${sq.id}`}>
            <line
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke={sq.filterType === 'include' ? '#4CAF50' : '#f44336'}
              strokeWidth="2"
              strokeDasharray="5,5"
              markerEnd="url(#subquery-arrow)"
              style={{ pointerEvents: 'none' }}
            />
            <text
              x={(fromX + toX) / 2}
              y={(fromY + toY) / 2 + 15}
              fill={sq.filterType === 'include' ? '#4CAF50' : '#f44336'}
              fontSize="10"
              textAnchor="middle"
              style={{ pointerEvents: 'none' }}
            >
              {sq.filterType === 'include' ? '✓ Include' : '✗ Exclude'} matching
            </text>
          </g>
        );
      })
      .filter((line) => line !== null);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ display: 'flex', height: '100%', backgroundColor: '#fafafa', overflow: 'hidden' }}>
      {/* Main Canvas Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Header sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ minWidth: 200 }}>
            <Title>Visual Query Builder</Title>
            <Typography variant="caption" sx={{ color: '#666', display: { xs: 'none', md: 'flex' }, gap: 2, mt: 0.5 }}>
              <span>🔗 Combine</span>
              <span>🔍 Filter</span>
              <span>📊 Totals</span>
              <span>📋 Reference</span>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Tooltip title="Add a table from your database">
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAddTableDialogOpen(true)}>
                Add Table
              </Button>
            </Tooltip>
            <Tooltip title="Add a filter to narrow down results">
              <Button 
                size="small"
                variant="outlined" 
                startIcon={<FilterIcon />} 
                onClick={() => {
                  if (selectedTables.length > 0 && selectedTables[0].columns.length > 0) {
                    const col = selectedTables[0].columns[0];
                    openFilterDialog(selectedTables[0].id, col.name, col.type);
                  }
                }}
                disabled={selectedTables.length === 0}
              >
                Filter
              </Button>
            </Tooltip>
            <Tooltip title="Reference data from another table">
              <Button 
                size="small"
                variant="outlined" 
                startIcon={<LinkIcon />} 
                onClick={openSubqueryDialog}
                disabled={selectedTables.length < 2}
              >
                Ref
              </Button>
            </Tooltip>
            <SaveButton 
              size="small"
              variant="contained" 
              startIcon={<SaveIcon />} 
              onClick={() => setSaveDialogOpen(true)} 
              disabled={selectedTables.length === 0}
            >
              Save API
            </SaveButton>
          </Box>
        </Header>

        {/* Query Description Bar */}
        {queryDescription && (
          <Box sx={{ 
            px: 2, 
            py: 1, 
            backgroundColor: '#e3f2fd', 
            borderBottom: '1px solid #90caf9',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <Typography variant="caption" sx={{ flex: 1, color: '#1565c0', fontSize: '0.75rem' }}>
              📋 {queryDescription}
            </Typography>
            <Tooltip title="Refresh preview data">
              <IconButton size="small" onClick={refreshPreview} disabled={selectedFields.length === 0}>
                <RefreshIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {selectedTables.length === 0 ? (
          <EmptyStateMessage>
            <Box sx={{ textAlign: 'center' }}>
              <StorageIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1, color: '#666' }}>
                Start Building Your Query
              </Typography>
              <Typography variant="body2" sx={{ color: '#999', mb: 3, maxWidth: 400 }}>
                Add tables from your database, select the columns you need, 
                and connect related data. No SQL required!
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => setAddTableDialogOpen(true)}
                size="large"
              >
                Add Your First Table
              </Button>
            </Box>
          </EmptyStateMessage>
        ) : (
          <Canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', minHeight: 500 }}
            viewBox="0 0 1200 700"
            preserveAspectRatio="xMinYMin meet"
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#2196F3" />
              </marker>
              <marker id="subquery-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#4CAF50" />
              </marker>
            </defs>

            {drawConnectionLines()}
            {drawSubqueryLines()}

            {selectedTables.map((table) => {
              const pos = tablePositions[table.id] || { x: 0, y: 0 };

              return (
                <foreignObject
                  key={`table-${table.id}`}
                  x={pos.x}
                  y={pos.y}
                  width="240"
                  height="400"
                  style={{ overflow: 'visible' }}
                >
                  <TableCard
                    draggable
                    onDragStart={(e) => handleTableDragStart(e, table.id)}
                    sx={{
                      cursor: 'grab',
                      '&:active': { cursor: 'grabbing' },
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Tooltip title="Drag to move table">
                        <DragIcon sx={{ cursor: 'grab', color: '#999', fontSize: '1.2rem' }} />
                      </Tooltip>
                      <TableCardTitle>{table.name}</TableCardTitle>
                      <Tooltip title="Remove table">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveTable(table.id)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Divider sx={{ mb: 1 }} />

                    <TableCardFields>
                      {table.columns.slice(0, 10).map((field) => {
                        const isSelected = selectedFields.some(
                          (f) => f.tableId === table.id && f.columnName === field.name
                        );
                        const isGrouped = groupingRules.some(
                          (g) => g.tableId === table.id && g.columnName === field.name
                        );
                        const fieldData = selectedFields.find(
                          (f) => f.tableId === table.id && f.columnName === field.name
                        );

                        return (
                          <Tooltip
                            key={`${table.id}-${field.name}`}
                            title={
                              <Box>
                                <Typography variant="caption" display="block">Click: Select/deselect column</Typography>
                                <Typography variant="caption" display="block">Drag: Connect to another table</Typography>
                                <Typography variant="caption" display="block">Right-click: Add filter or aggregation</Typography>
                              </Box>
                            }
                            arrow
                          >
                            <FieldItem
                              draggable
                              onDragStart={(e) => handleConnectionDragStart(e, table.id, field.name)}
                              onDragOver={handleConnectionDragOver}
                              onDrop={(e) => handleConnectionDrop(e, table.id, field.name)}
                              onClick={() => handleSelectField(table.id, field.name)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                openFilterDialog(table.id, field.name, field.type);
                              }}
                              sx={{
                                cursor: 'grab',
                                backgroundColor: isSelected ? '#e3f2fd' : isGrouped ? '#fff3e0' : '#f5f5f5',
                                border: isSelected ? '2px solid #2196F3' : isGrouped ? '2px solid #ff9800' : '1px solid #ddd',
                                position: 'relative',
                              }}
                            >
                              <ConnectionPoint isSelected={isSelected} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                                    {field.name}
                                  </Typography>
                                  {fieldData?.aggregation && (
                                    <Chip 
                                      label={getAggregationLabel(fieldData.aggregation)} 
                                      size="small" 
                                      color="primary"
                                      sx={{ height: 18, fontSize: '0.65rem' }}
                                    />
                                  )}
                                  {fieldData?.distinct && (
                                    <Chip 
                                      label="Unique" 
                                      size="small" 
                                      color="secondary"
                                      sx={{ height: 18, fontSize: '0.65rem' }}
                                    />
                                  )}
                                  {isGrouped && (
                                    <Chip 
                                      label="Grouped" 
                                      size="small" 
                                      sx={{ height: 18, fontSize: '0.65rem', backgroundColor: '#ff9800', color: 'white' }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="caption" sx={{ color: '#999' }}>
                                  {field.type}
                                </Typography>
                              </Box>
                              {isSelected && (
                                <Box sx={{ display: 'flex', gap: 0.25 }}>
                                  <Tooltip title="Calculate total/average">
                                    <IconButton 
                                      size="small" 
                                      onClick={(e) => { e.stopPropagation(); openAggregationDialog(table.id, field.name); }}
                                      sx={{ p: 0.25 }}
                                    >
                                      <FunctionsIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Group by this column">
                                    <IconButton 
                                      size="small" 
                                      onClick={(e) => { e.stopPropagation(); toggleGrouping(table.id, field.name); }}
                                      sx={{ p: 0.25, color: isGrouped ? '#ff9800' : undefined }}
                                    >
                                      <ColumnIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                            </FieldItem>
                          </Tooltip>
                        );
                      })}
                      {table.columns.length > 10 && (
                        <Typography variant="caption" sx={{ color: '#999', p: 1, textAlign: 'center' }}>
                          +{table.columns.length - 10} more columns
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

      {/* Right Sidebar Panel */}
      {selectedTables.length > 0 && (
        <Box
          sx={{
            width: { xs: 320, sm: 360, md: 400 },
            minWidth: { xs: 320, sm: 360, md: 400 },
            maxWidth: { xs: 320, sm: 360, md: 400 },
            flexShrink: 0,
            backgroundColor: 'white',
            borderLeft: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
          }}
        >
          <Tabs 
            value={rightPanelTab} 
            onChange={(_, v) => setRightPanelTab(v)} 
            sx={{ 
              borderBottom: '1px solid #e0e0e0',
              minHeight: 44,
              '& .MuiTab-root': { minHeight: 44, py: 1, px: 1 }
            }}
            variant="fullWidth"
          >
            <Tab label="Columns" icon={<ColumnIcon sx={{ fontSize: 16 }} />} iconPosition="start" sx={{ fontSize: '0.75rem', minWidth: 0 }} />
            <Tab label="Filters" icon={<FilterIcon sx={{ fontSize: 16 }} />} iconPosition="start" sx={{ fontSize: '0.75rem', minWidth: 0 }} />
            <Tab label="Preview" icon={<PlayIcon sx={{ fontSize: 16 }} />} iconPosition="start" sx={{ fontSize: '0.75rem', minWidth: 0 }} />
            <Tab label="API" icon={<LinkIcon sx={{ fontSize: 16 }} />} iconPosition="start" sx={{ fontSize: '0.75rem', minWidth: 0 }} />
          </Tabs>

          <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: 1.5 }}>
            {/* Columns Tab */}
            {rightPanelTab === 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ColumnIcon fontSize="small" />
                  Selected Columns
                </Typography>
                
                {selectedFields.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                    Click on column names in the tables to select what data to show in your API
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedFields.map((field, idx) => (
                      <Paper key={`${field.tableId}-${field.columnName}`} sx={{ p: 1.5, backgroundColor: '#f8f9fa' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {field.aggregation ? `${getAggregationLabel(field.aggregation)} of ` : ''}
                              {field.columnName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#999' }}>
                              from {field.tableId}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => setSelectedFields((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          <Tooltip title="Sort smallest to largest">
                            <Button
                              size="small"
                              variant={field.sortOrder === 'asc' ? 'contained' : 'outlined'}
                              onClick={() => toggleFieldSort(field.tableId, field.columnName, 'asc')}
                              sx={{ fontSize: '0.65rem', minWidth: 'auto', px: 0.75, py: 0.25 }}
                            >
                              ↑ Asc
                            </Button>
                          </Tooltip>
                          <Tooltip title="Sort largest to smallest">
                            <Button
                              size="small"
                              variant={field.sortOrder === 'desc' ? 'contained' : 'outlined'}
                              onClick={() => toggleFieldSort(field.tableId, field.columnName, 'desc')}
                              sx={{ fontSize: '0.65rem', minWidth: 'auto', px: 0.75, py: 0.25 }}
                            >
                              ↓ Desc
                            </Button>
                          </Tooltip>
                          <Tooltip title="Show only unique values">
                            <Button
                              size="small"
                              variant={field.distinct ? 'contained' : 'outlined'}
                              color="secondary"
                              onClick={() => toggleFieldDistinct(field.tableId, field.columnName)}
                              sx={{ fontSize: '0.65rem', minWidth: 'auto', px: 0.75, py: 0.25 }}
                            >
                              Unique
                            </Button>
                          </Tooltip>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}

                {/* Connections Summary */}
                {tableConnections.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      🔗 Combined Tables
                    </Typography>
                    {tableConnections.map((conn) => (
                      <Paper key={conn.id} sx={{ p: 1.5, backgroundColor: '#e3f2fd', mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">
                            <strong>{conn.sourceTableId}</strong> + <strong>{conn.targetTableId}</strong>
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => setTableConnections((prev) => prev.filter((c) => c.id !== conn.id))}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#1565c0' }}>
                          where {conn.sourceColumn} matches {conn.targetColumn}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}

                {/* Grouping Summary */}
                {groupingRules.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      📊 Grouped By
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {groupingRules.map((g) => (
                        <Chip
                          key={`${g.tableId}-${g.columnName}`}
                          label={`${g.tableId}.${g.columnName}`}
                          onDelete={() => toggleGrouping(g.tableId, g.columnName)}
                          sx={{ backgroundColor: '#fff3e0' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* Filters Tab */}
            {rightPanelTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon fontSize="small" />
                    Filter Conditions
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      if (selectedTables.length > 0 && selectedTables[0].columns.length > 0) {
                        const col = selectedTables[0].columns[0];
                        openFilterDialog(selectedTables[0].id, col.name, col.type);
                      }
                    }}
                  >
                    Add
                  </Button>
                </Box>

                {visualFilters.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      No filters applied yet
                    </Typography>
                    Filters let you narrow down results. For example: "Show only orders where status is 'pending'" or "Show products where price is greater than 50"
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {visualFilters.map((filter) => (
                      <Paper key={filter.id} sx={{ p: 1.5, backgroundColor: '#fff8e1', border: '1px solid #ffe082' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {filter.columnName} {getOperatorLabel(filter.operator)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#f57c00' }}>
                              {Array.isArray(filter.value) 
                                ? filter.value.join(' and ') 
                                : filter.value || '(any value)'}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={() => removeFilter(filter.id)}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}

                {/* Subqueries / Reference Filters */}
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinkIcon fontSize="small" />
                      Reference Filters
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={openSubqueryDialog}
                      disabled={selectedTables.length < 2}
                    >
                      Add
                    </Button>
                  </Box>

                  {subqueries.length === 0 ? (
                    <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Reference data from another table
                      </Typography>
                      Example: "Show orders where the user is in the 'premium users' list" - without needing to write complex queries
                    </Alert>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {subqueries.map((sq) => (
                        <Paper 
                          key={sq.id} 
                          sx={{ 
                            p: 1.5, 
                            backgroundColor: sq.filterType === 'include' ? '#e8f5e9' : '#ffebee',
                            border: `1px solid ${sq.filterType === 'include' ? '#a5d6a7' : '#ef9a9a'}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {sq.filterType === 'include' ? '✓ Include' : '✗ Exclude'}: {sq.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: sq.filterType === 'include' ? '#2e7d32' : '#c62828' }}>
                                {sq.description}
                              </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => removeSubquery(sq.id)}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Preview Tab */}
            {rightPanelTab === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    👁️ Data Preview
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={previewLoading ? <CircularProgress size={14} /> : <RefreshIcon />}
                    onClick={refreshPreview}
                    disabled={selectedFields.length === 0 || previewLoading}
                  >
                    Refresh
                  </Button>
                </Box>

                {selectedFields.length === 0 ? (
                  <Alert severity="info">
                    Select some columns to see a preview of your data
                  </Alert>
                ) : previewData.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Click "Refresh" to load preview data
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {Object.keys(previewData[0]).map((key) => (
                            <TableCell key={key} sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>
                              {key}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {previewData.map((row, idx) => (
                          <TableRow key={idx}>
                            {Object.values(row).map((value: any, i) => (
                              <TableCell key={i}>{String(value)}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
                  Showing sample data. Actual results may differ.
                </Typography>
              </Box>
            )}

            {/* API Tab */}
            {rightPanelTab === 3 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  🔗 API Endpoint
                </Typography>

                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Endpoint URL
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={apiEndpoint}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Chip label="GET" size="small" color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                    />
                    <Tooltip title="Copy endpoint">
                      <IconButton onClick={copyApiEndpoint}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={apiTestResult?.loading ? <CircularProgress size={16} color="inherit" /> : <PlayIcon />}
                  onClick={testApiEndpoint}
                  disabled={apiTestResult?.loading}
                  sx={{ mb: 2 }}
                >
                  Test API Endpoint
                </Button>

                {apiTestResult && !apiTestResult.loading && (
                  <Paper sx={{ p: 2, backgroundColor: apiTestResult.success ? '#e8f5e9' : '#ffebee' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {apiTestResult.success ? (
                        <CheckIcon color="success" />
                      ) : (
                        <WarningIcon color="error" />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Status: {apiTestResult.status}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        ({apiTestResult.responseTime})
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {apiTestResult.success 
                        ? `✓ Returned ${apiTestResult.data?.length || 0} records`
                        : '✗ Request failed'}
                    </Typography>
                  </Paper>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Query Parameters (Optional)
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                  After saving, users can pass these as URL parameters:
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Chip label="?limit=100" size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  <Chip label="?offset=0" size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  {visualFilters.map(f => (
                    <Chip 
                      key={f.id}
                      label={`?${f.columnName}=value`} 
                      size="small" 
                      variant="outlined" 
                      sx={{ alignSelf: 'flex-start' }} 
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ====================================================================== */}
      {/* DIALOGS */}
      {/* ====================================================================== */}

      {/* Add Table Dialog */}
      <Dialog open={addTableDialogOpen} onClose={() => setAddTableDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon />
            Add Table to Query
          </Box>
        </DialogTitle>
        <DialogContent>
          {schemaLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tables
                .filter((t: any) => !selectedTables.find((st) => st.id === t.id))
                .map((table: any) => (
                  <Button
                    key={table.id}
                    variant="outlined"
                    onClick={() => handleAddTable(table)}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', p: 1.5 }}
                  >
                    <StorageIcon sx={{ mr: 1.5, color: '#1976d2' }} />
                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {table.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {table.columns?.length || 0} columns
                      </Typography>
                    </Box>
                  </Button>
                ))}
              {tables.filter((t: any) => !selectedTables.find((st) => st.id === t.id)).length === 0 && (
                <Alert severity="info">All available tables have been added</Alert>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Connection Dialog */}
      <Dialog open={connectDialogOpen} onClose={handleCloseConnectionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon />
            Combine Tables
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            When these columns match, data from both tables will be combined into one result
          </Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
              <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 500 }}>
                From Table
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                {connectingFrom?.tableId} <Chip label={connectingFrom?.columnName} size="small" />
              </Typography>
            </Paper>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                ↓ matches ↓
              </Typography>
            </Box>
            <Paper sx={{ p: 2, backgroundColor: '#f3e5f5' }}>
              <Typography variant="caption" sx={{ color: '#7b1fa2', fontWeight: 500 }}>
                To Table
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                {connectingTo?.tableId} <Chip label={connectingTo?.columnName} size="small" />
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConnectionDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmConnection}>
            Combine Tables
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Add Filter Condition
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Filter your results to show only the data you need
          </Alert>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Column to filter</InputLabel>
            <Select
              value={filterField ? `${filterField.tableId}.${filterField.columnName}` : ''}
              onChange={(e) => {
                const [tableId, columnName] = e.target.value.split('.');
                const table = selectedTables.find(t => t.id === tableId);
                const col = table?.columns.find(c => c.name === columnName);
                if (col) {
                  setFilterField({ tableId, columnName, type: col.type });
                }
              }}
              label="Column to filter"
            >
              {selectedTables.flatMap(table =>
                table.columns.map(col => (
                  <MenuItem key={`${table.id}.${col.name}`} value={`${table.id}.${col.name}`}>
                    {table.name}.{col.name} ({col.type})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Condition</InputLabel>
            <Select
              value={filterOperator}
              onChange={(e) => setFilterOperator(e.target.value)}
              label="Condition"
            >
              <MenuItem value="equals">is exactly</MenuItem>
              <MenuItem value="not_equals">is not</MenuItem>
              <MenuItem value="contains">contains</MenuItem>
              <MenuItem value="starts_with">starts with</MenuItem>
              <MenuItem value="ends_with">ends with</MenuItem>
              <MenuItem value="gt">is greater than</MenuItem>
              <MenuItem value="lt">is less than</MenuItem>
              <MenuItem value="gte">is at least</MenuItem>
              <MenuItem value="lte">is at most</MenuItem>
              <MenuItem value="between">is between</MenuItem>
              <MenuItem value="is_null">is empty</MenuItem>
              <MenuItem value="is_not_null">is not empty</MenuItem>
            </Select>
          </FormControl>

          {filterOperator === 'between' ? (
            <Box sx={{ px: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Value range: {filterRangeValue[0]} - {filterRangeValue[1]}
              </Typography>
              <Slider
                value={filterRangeValue}
                onChange={(_, newValue) => setFilterRangeValue(newValue as [number, number])}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
              />
            </Box>
          ) : !['is_null', 'is_not_null'].includes(filterOperator) && (
            <TextField
              fullWidth
              label="Value"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Enter the value to filter by"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddFilter}>
            Add Filter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Aggregation Dialog */}
      <Dialog open={aggregationDialogOpen} onClose={() => setAggregationDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FunctionsIcon />
            Calculate Total / Average
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Calculate a summary value for {aggField?.columnName}
          </Alert>
          
          <FormControl fullWidth>
            <InputLabel>Calculation type</InputLabel>
            <Select
              value={aggType}
              onChange={(e) => setAggType(e.target.value)}
              label="Calculation type"
            >
              <MenuItem value="count">Count (how many)</MenuItem>
              <MenuItem value="sum">Total (add up all values)</MenuItem>
              <MenuItem value="avg">Average (mean value)</MenuItem>
              <MenuItem value="min">Minimum (smallest value)</MenuItem>
              <MenuItem value="max">Maximum (largest value)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAggregationDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAggregation}>
            Apply Calculation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subquery Dialog */}
      <Dialog open={subqueryDialogOpen} onClose={() => setSubqueryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon />
            Reference Data from Another Table
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Filter one table based on values from another. For example: "Show orders where customer is in the 'VIP customers' list"
          </Alert>

          <TextField
            fullWidth
            label="Name this filter (optional)"
            value={subqueryName}
            onChange={(e) => setSubqueryName(e.target.value)}
            placeholder="e.g., VIP Customers Only"
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Reference table (source data)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Table</InputLabel>
              <Select
                value={subquerySource.tableId}
                onChange={(e) => setSubquerySource({ ...subquerySource, tableId: e.target.value })}
                label="Table"
              >
                {selectedTables.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Column</InputLabel>
              <Select
                value={subquerySource.column}
                onChange={(e) => setSubquerySource({ ...subquerySource, column: e.target.value })}
                label="Column"
                disabled={!subquerySource.tableId}
              >
                {selectedTables
                  .find(t => t.id === subquerySource.tableId)
                  ?.columns.map(c => (
                    <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Filter type</InputLabel>
            <Select
              value={subqueryType}
              onChange={(e) => setSubqueryType(e.target.value as 'include' | 'exclude')}
              label="Filter type"
            >
              <MenuItem value="include">✓ Include rows that match</MenuItem>
              <MenuItem value="exclude">✗ Exclude rows that match</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Target table (to filter)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Table</InputLabel>
              <Select
                value={subqueryTarget.tableId}
                onChange={(e) => setSubqueryTarget({ ...subqueryTarget, tableId: e.target.value })}
                label="Table"
              >
                {selectedTables
                  .filter(t => t.id !== subquerySource.tableId)
                  .map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Column</InputLabel>
              <Select
                value={subqueryTarget.column}
                onChange={(e) => setSubqueryTarget({ ...subqueryTarget, column: e.target.value })}
                label="Column"
                disabled={!subqueryTarget.tableId}
              >
                {selectedTables
                  .find(t => t.id === subqueryTarget.tableId)
                  ?.columns.map(c => (
                    <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubqueryDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddSubquery}
            disabled={!subquerySource.tableId || !subquerySource.column || !subqueryTarget.tableId || !subqueryTarget.column}
          >
            Add Reference Filter
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
    </Box>
  );
}

export default QueryBuilderComplete;
