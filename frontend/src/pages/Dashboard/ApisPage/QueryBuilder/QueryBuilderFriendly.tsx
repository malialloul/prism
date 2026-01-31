import React, { useState, useMemo } from 'react';
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
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  ViewColumn as ColumnIcon,
  ArrowUpward as SortAscIcon,
  ArrowDownward as SortDescIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  TableChart as TableIcon,
  Merge as MergeIcon,
  FilterAlt as FilterAltIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useFullSchema } from '../../../../api/entities/schema/useFullSchema';
import { SaveApiDialog } from './components/SaveApiDialog';
import type { QueryConfig, FilterCondition } from './QueryBuilder.types';

// ============================================================================
// TYPES
// ============================================================================

interface QueryBuilderProps {
  connectedDatabase: { id: string | number; name: string } | null;
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

interface Relationship {
  id: string;
  type: 'combine' | 'must-exist' | 'must-not-exist';
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  description: string;
}

interface GroupingRule {
  tableId: string;
  columnName: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getOperatorLabel = (op: string): string => {
  const labels: Record<string, string> = {
    equals: 'is exactly', not_equals: 'is not', contains: 'contains',
    starts_with: 'starts with', ends_with: 'ends with',
    gt: 'is more than', lt: 'is less than', gte: 'is at least', lte: 'is at most',
    between: 'is between', is_null: 'is empty', is_not_null: 'has a value',
  };
  return labels[op] || op;
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
// STEP CARD COMPONENT
// ============================================================================

interface StepCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
  color?: string;
  count?: number;
}

const StepCard: React.FC<StepCardProps> = ({ title, subtitle, icon, children, actionButton, color = '#2196F3', count }) => (
  <Card sx={{ mb: 2, border: `2px solid ${color}20`, borderRadius: 2 }}>
    <CardContent sx={{ pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box sx={{ 
          width: 40, height: 40, borderRadius: '50%', 
          backgroundColor: `${color}15`, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
        }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {title}
            {count !== undefined && count > 0 && (
              <Chip label={count} size="small" sx={{ ml: 1, height: 20, backgroundColor: color, color: 'white' }} />
            )}
          </Typography>
          {subtitle && <Typography variant="caption" sx={{ color: '#666' }}>{subtitle}</Typography>}
        </Box>
        {actionButton}
      </Box>
      {children}
    </CardContent>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function QueryBuilderFriendly({ connectedDatabase }: QueryBuilderProps) {
  const { data: schemaData, isLoading: schemaLoading } = useFullSchema(
    connectedDatabase?.id ? Number(connectedDatabase.id) : undefined,
  );

  // State
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([]);
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [visualFilters, setVisualFilters] = useState<VisualFilter[]>([]);
  const [groupingRules, setGroupingRules] = useState<GroupingRule[]>([]);

  // Dialog States
  const [addTableOpen, setAddTableOpen] = useState(false);
  const [addRelationshipOpen, setAddRelationshipOpen] = useState(false);
  const [addFilterOpen, setAddFilterOpen] = useState(false);
  const [addCalculationOpen, setAddCalculationOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Relationship Dialog State
  const [relType, setRelType] = useState<'combine' | 'must-exist' | 'must-not-exist'>('combine');
  const [relFromTable, setRelFromTable] = useState('');
  const [relFromColumn, setRelFromColumn] = useState('');
  const [relToTable, setRelToTable] = useState('');
  const [relToColumn, setRelToColumn] = useState('');

  // Filter Dialog State
  const [filterTable, setFilterTable] = useState('');
  const [filterColumn, setFilterColumn] = useState('');
  const [filterOperator, setFilterOperator] = useState('equals');
  const [filterValue, setFilterValue] = useState('');
  const [filterRangeValue, setFilterRangeValue] = useState<[number, number]>([0, 100]);

  // Calculation Dialog State
  const [calcTable, setCalcTable] = useState('');
  const [calcColumn, setCalcColumn] = useState('');
  const [calcType, setCalcType] = useState('count');

  // Right Panel
  const [rightPanelTab, setRightPanelTab] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Available tables
  const tables = useMemo(() =>
    schemaData?.tables?.map((t: any) => ({
      id: t.name, name: t.name, columns: t.columns || [],
    })) || []
  , [schemaData]);

  // ============================================================================
  // SQL GENERATION
  // ============================================================================

  const generatedSql = useMemo(() => {
    if (selectedTables.length === 0) return '';

    const lines: string[] = [];
    
    // SELECT
    let selectFields: string[] = [];
    if (selectedFields.length === 0) {
      selectFields = ['*'];
    } else {
      selectFields = selectedFields.map(f => {
        const col = `${f.tableId}.${f.columnName}`;
        if (f.aggregation) return `${f.aggregation.toUpperCase()}(${col})`;
        if (f.distinct) return `DISTINCT ${col}`;
        return col;
      });
    }
    lines.push(`SELECT ${selectFields.join(',\n       ')}`);

    // FROM
    lines.push(`FROM ${selectedTables[0].name}`);

    // JOINs (combine relationships)
    relationships.filter(r => r.type === 'combine').forEach(r => {
      lines.push(`INNER JOIN ${r.toTable}`);
      lines.push(`  ON ${r.fromTable}.${r.fromColumn} = ${r.toTable}.${r.toColumn}`);
    });

    // WHERE
    const whereClauses: string[] = [];
    
    visualFilters.forEach(f => {
      const col = `${f.tableId}.${f.columnName}`;
      const op = getSqlOperator(f.operator);
      const val = formatSqlValue(f.operator, f.value);
      whereClauses.push(f.operator === 'is_null' || f.operator === 'is_not_null' 
        ? `${col} ${op}` 
        : `${col} ${op} ${val}`);
    });

    // Subqueries (must-exist / must-not-exist)
    relationships.filter(r => r.type === 'must-exist').forEach(r => {
      whereClauses.push(`${r.toTable}.${r.toColumn} IN (SELECT ${r.fromColumn} FROM ${r.fromTable})`);
    });
    relationships.filter(r => r.type === 'must-not-exist').forEach(r => {
      whereClauses.push(`${r.toTable}.${r.toColumn} NOT IN (SELECT ${r.fromColumn} FROM ${r.fromTable})`);
    });

    if (whereClauses.length > 0) {
      lines.push(`WHERE ${whereClauses.join('\n  AND ')}`);
    }

    // GROUP BY
    if (groupingRules.length > 0) {
      lines.push(`GROUP BY ${groupingRules.map(g => `${g.tableId}.${g.columnName}`).join(', ')}`);
    }

    // ORDER BY
    const sorted = selectedFields.filter(f => f.sortOrder);
    if (sorted.length > 0) {
      lines.push(`ORDER BY ${sorted.map(f => `${f.tableId}.${f.columnName} ${f.sortOrder?.toUpperCase()}`).join(', ')}`);
    }

    return lines.join('\n');
  }, [selectedTables, selectedFields, relationships, visualFilters, groupingRules]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddTable = (table: any) => {
    if (!selectedTables.find(t => t.id === table.id)) {
      setSelectedTables(prev => [...prev, { id: table.id, name: table.name, columns: table.columns || [] }]);
    }
    setAddTableOpen(false);
  };

  const handleRemoveTable = (tableId: string) => {
    setSelectedTables(prev => prev.filter(t => t.id !== tableId));
    setSelectedFields(prev => prev.filter(f => f.tableId !== tableId));
    setRelationships(prev => prev.filter(r => r.fromTable !== tableId && r.toTable !== tableId));
    setVisualFilters(prev => prev.filter(f => f.tableId !== tableId));
    setGroupingRules(prev => prev.filter(g => g.tableId !== tableId));
  };

  const toggleField = (tableId: string, columnName: string) => {
    const exists = selectedFields.find(f => f.tableId === tableId && f.columnName === columnName);
    if (exists) {
      setSelectedFields(prev => prev.filter(f => !(f.tableId === tableId && f.columnName === columnName)));
    } else {
      setSelectedFields(prev => [...prev, { tableId, columnName }]);
    }
  };

  const handleAddRelationship = () => {
    if (!relFromTable || !relFromColumn || !relToTable || !relToColumn) return;
    
    const descriptions: Record<string, string> = {
      'combine': `Combine ${relFromTable} with ${relToTable} where ${relFromColumn} matches ${relToColumn}`,
      'must-exist': `Only show ${relToTable} records that have matching ${relFromColumn} in ${relFromTable}`,
      'must-not-exist': `Exclude ${relToTable} records that have matching ${relFromColumn} in ${relFromTable}`,
    };

    setRelationships(prev => [...prev, {
      id: `rel-${Date.now()}`,
      type: relType,
      fromTable: relFromTable,
      fromColumn: relFromColumn,
      toTable: relToTable,
      toColumn: relToColumn,
      description: descriptions[relType],
    }]);
    setAddRelationshipOpen(false);
    resetRelationshipForm();
  };

  const resetRelationshipForm = () => {
    setRelType('combine');
    setRelFromTable('');
    setRelFromColumn('');
    setRelToTable('');
    setRelToColumn('');
  };

  const handleAddFilter = () => {
    if (!filterTable || !filterColumn) return;
    const table = selectedTables.find(t => t.id === filterTable);
    const column = table?.columns.find(c => c.name === filterColumn);
    
    setVisualFilters(prev => [...prev, {
      id: `filter-${Date.now()}`,
      tableId: filterTable,
      columnName: filterColumn,
      columnType: column?.type || 'text',
      operator: filterOperator,
      value: filterOperator === 'between' ? filterRangeValue : filterValue,
    }]);
    setAddFilterOpen(false);
    setFilterTable('');
    setFilterColumn('');
    setFilterOperator('equals');
    setFilterValue('');
  };

  const handleAddCalculation = () => {
    if (!calcTable || !calcColumn) return;
    
    const exists = selectedFields.find(f => f.tableId === calcTable && f.columnName === calcColumn);
    if (exists) {
      setSelectedFields(prev => prev.map(f => 
        f.tableId === calcTable && f.columnName === calcColumn 
          ? { ...f, aggregation: calcType as any }
          : f
      ));
    } else {
      setSelectedFields(prev => [...prev, {
        tableId: calcTable,
        columnName: calcColumn,
        aggregation: calcType as any,
      }]);
    }
    
    // Auto-add grouping for non-aggregated fields
    selectedFields.forEach(f => {
      if (!f.aggregation && !groupingRules.find(g => g.tableId === f.tableId && g.columnName === f.columnName)) {
        setGroupingRules(prev => [...prev, { tableId: f.tableId, columnName: f.columnName }]);
      }
    });
    
    setAddCalculationOpen(false);
    setCalcTable('');
    setCalcColumn('');
  };

  const toggleSort = (tableId: string, columnName: string, order: 'asc' | 'desc') => {
    setSelectedFields(prev => prev.map(f =>
      f.tableId === tableId && f.columnName === columnName
        ? { ...f, sortOrder: f.sortOrder === order ? null : order }
        : f
    ));
  };

  const refreshPreview = () => {
    setPreviewLoading(true);
    setTimeout(() => {
      const data = Array.from({ length: 5 }, (_, i) => {
        const row: Record<string, any> = {};
        selectedFields.forEach(f => {
          row[f.aggregation ? `${f.aggregation}(${f.columnName})` : f.columnName] = 
            f.aggregation ? Math.floor(Math.random() * 1000) : `Sample ${i + 1}`;
        });
        return row;
      });
      setPreviewData(data);
      setPreviewLoading(false);
    }, 500);
  };

  const handleSaveApi = async (name: string, desc: string) => {
    const config: QueryConfig = {
      tables: selectedTables.map(t => ({ name: t.name, alias: t.name })),
      tableConnections: relationships.filter(r => r.type === 'combine').map(r => ({
        id: r.id,
        sourceTableId: r.fromTable,
        targetTableId: r.toTable,
        sourceColumn: r.fromColumn,
        targetColumn: r.toColumn,
        connectionType: 'matches' as const,
      })),
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
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ display: 'flex', height: '100%', backgroundColor: '#f5f7fa', overflow: 'hidden' }}>
      {/* Main Content - Left Panel */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e0e0e0', 
          px: 3, py: 2,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Build Your Query</Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Follow the steps below to create your custom data query
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={() => setSaveDialogOpen(true)}
            disabled={selectedTables.length === 0}
          >
            Save as API
          </Button>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {/* STEP 1: Select Tables */}
          <StepCard
            title="Step 1: Choose Your Data"
            subtitle="Select which tables contain the data you need"
            icon={<TableIcon />}
            color="#2196F3"
            count={selectedTables.length}
            actionButton={
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAddTableOpen(true)}>
                Add Table
              </Button>
            }
          >
            {selectedTables.length === 0 ? (
              <Alert severity="info" sx={{ mt: 1 }}>
                Click "Add Table" to start selecting your data sources
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {selectedTables.map(table => (
                  <Chip
                    key={table.id}
                    icon={<StorageIcon />}
                    label={table.name}
                    onDelete={() => handleRemoveTable(table.id)}
                    sx={{ backgroundColor: '#e3f2fd' }}
                  />
                ))}
              </Box>
            )}
          </StepCard>

          {/* STEP 2: Select Columns */}
          {selectedTables.length > 0 && (
            <StepCard
              title="Step 2: Pick Your Columns"
              subtitle="Check the columns you want to include in your results"
              icon={<ColumnIcon />}
              color="#4CAF50"
              count={selectedFields.length}
            >
              <Box sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
                {selectedTables.map(table => (
                  <Box key={table.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                      📁 {table.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pl: 2 }}>
                      {table.columns.map(col => {
                        const isSelected = selectedFields.some(f => f.tableId === table.id && f.columnName === col.name);
                        const fieldData = selectedFields.find(f => f.tableId === table.id && f.columnName === col.name);
                        return (
                          <Chip
                            key={col.name}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {col.name}
                                {fieldData?.aggregation && (
                                  <Typography variant="caption" sx={{ color: '#9c27b0', fontWeight: 600 }}>
                                    ({fieldData.aggregation.toUpperCase()})
                                  </Typography>
                                )}
                              </Box>
                            }
                            size="small"
                            onClick={() => toggleField(table.id, col.name)}
                            icon={isSelected ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                            sx={{
                              backgroundColor: isSelected ? '#c8e6c9' : '#f5f5f5',
                              border: isSelected ? '1px solid #4CAF50' : '1px solid #e0e0e0',
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: isSelected ? '#a5d6a7' : '#eeeeee' },
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            </StepCard>
          )}

          {/* STEP 3: Connect Tables (only if multiple tables) */}
          {selectedTables.length > 1 && (
            <StepCard
              title="Step 3: Connect Your Tables"
              subtitle="Define how your tables relate to each other"
              icon={<MergeIcon />}
              color="#ff9800"
              count={relationships.length}
              actionButton={
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAddRelationshipOpen(true)}>
                  Add Connection
                </Button>
              }
            >
              {relationships.length === 0 ? (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  You have multiple tables! Click "Add Connection" to specify how they should be linked.
                </Alert>
              ) : (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {relationships.map(rel => (
                    <Paper 
                      key={rel.id} 
                      sx={{ 
                        p: 1.5, 
                        backgroundColor: rel.type === 'combine' ? '#fff3e0' : rel.type === 'must-exist' ? '#e8f5e9' : '#ffebee',
                        border: `1px solid ${rel.type === 'combine' ? '#ffb74d' : rel.type === 'must-exist' ? '#81c784' : '#e57373'}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Chip 
                            size="small" 
                            label={rel.type === 'combine' ? '🔗 COMBINE' : rel.type === 'must-exist' ? '✅ MUST EXIST' : '❌ MUST NOT EXIST'}
                            sx={{ 
                              mb: 0.5,
                              backgroundColor: rel.type === 'combine' ? '#ff9800' : rel.type === 'must-exist' ? '#4CAF50' : '#f44336',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                          <Typography variant="body2">{rel.description}</Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {rel.fromTable}.{rel.fromColumn} → {rel.toTable}.{rel.toColumn}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setRelationships(prev => prev.filter(r => r.id !== rel.id))}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </StepCard>
          )}

          {/* STEP 4: Add Filters */}
          {selectedTables.length > 0 && (
            <StepCard
              title="Step 4: Filter Your Results"
              subtitle="Optional: Narrow down to specific records"
              icon={<FilterAltIcon />}
              color="#9c27b0"
              count={visualFilters.length}
              actionButton={
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAddFilterOpen(true)}>
                  Add Filter
                </Button>
              }
            >
              {visualFilters.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  No filters applied - showing all records
                </Typography>
              ) : (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {visualFilters.map(f => (
                    <Chip
                      key={f.id}
                      label={`${f.columnName} ${getOperatorLabel(f.operator)} ${f.operator === 'is_null' || f.operator === 'is_not_null' ? '' : f.value}`}
                      onDelete={() => setVisualFilters(prev => prev.filter(x => x.id !== f.id))}
                      sx={{ alignSelf: 'flex-start', backgroundColor: '#f3e5f5' }}
                    />
                  ))}
                </Box>
              )}
            </StepCard>
          )}

          {/* STEP 5: Add Calculations */}
          {selectedFields.length > 0 && (
            <StepCard
              title="Step 5: Add Calculations"
              subtitle="Optional: Calculate totals, averages, counts, etc."
              icon={<CalculateIcon />}
              color="#00bcd4"
              actionButton={
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAddCalculationOpen(true)}>
                  Add Calculation
                </Button>
              }
            >
              <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                Add calculations like SUM, AVG, COUNT, MIN, MAX to aggregate your data
              </Typography>
            </StepCard>
          )}

          {/* STEP 6: Sort Results */}
          {selectedFields.length > 0 && (
            <StepCard
              title="Step 6: Sort Your Results"
              subtitle="Optional: Order your results"
              icon={<SortAscIcon />}
              color="#607d8b"
            >
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedFields.map(f => (
                  <Box key={`${f.tableId}-${f.columnName}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2">{f.columnName}</Typography>
                    <Tooltip title="Sort A→Z (ascending)">
                      <IconButton 
                        size="small" 
                        onClick={() => toggleSort(f.tableId, f.columnName, 'asc')}
                        sx={{ 
                          backgroundColor: f.sortOrder === 'asc' ? '#2196F3' : 'transparent',
                          color: f.sortOrder === 'asc' ? 'white' : '#999',
                          '&:hover': { backgroundColor: f.sortOrder === 'asc' ? '#1976d2' : '#f5f5f5' },
                        }}
                      >
                        <SortAscIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sort Z→A (descending)">
                      <IconButton 
                        size="small" 
                        onClick={() => toggleSort(f.tableId, f.columnName, 'desc')}
                        sx={{ 
                          backgroundColor: f.sortOrder === 'desc' ? '#2196F3' : 'transparent',
                          color: f.sortOrder === 'desc' ? 'white' : '#999',
                          '&:hover': { backgroundColor: f.sortOrder === 'desc' ? '#1976d2' : '#f5f5f5' },
                        }}
                      >
                        <SortDescIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            </StepCard>
          )}
        </Box>
      </Box>

      {/* Right Panel - Results Preview */}
      <Box sx={{
        width: { xs: 320, md: 400 },
        minWidth: { xs: 320, md: 400 },
        flexShrink: 0,
        backgroundColor: 'white',
        borderLeft: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <Tabs value={rightPanelTab} onChange={(_, v) => setRightPanelTab(v)} variant="fullWidth" sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <Tab icon={<CodeIcon sx={{ fontSize: 16 }} />} label="SQL" sx={{ fontSize: '0.75rem', minHeight: 44 }} />
          <Tab icon={<PlayIcon sx={{ fontSize: 16 }} />} label="Preview" sx={{ fontSize: '0.75rem', minHeight: 44 }} />
        </Tabs>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {/* SQL Tab */}
          {rightPanelTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Generated SQL</Typography>
                <Tooltip title="Copy SQL">
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(generatedSql)} disabled={!generatedSql}>
                    <CopyIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {!generatedSql ? (
                <Alert severity="info">Add tables and select columns to generate SQL</Alert>
              ) : (
                <Paper sx={{ p: 1.5, backgroundColor: '#1e1e1e', borderRadius: 1, overflow: 'auto', maxHeight: 350 }}>
                  <pre style={{ 
                    margin: 0, 
                    fontFamily: '"Fira Code", "Consolas", monospace',
                    fontSize: '0.75rem',
                    lineHeight: 1.6,
                    color: '#d4d4d4',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {generatedSql.split('\n').map((line, i) => {
                      const highlighted = line
                        .replace(/\b(SELECT|FROM|WHERE|AND|OR|INNER JOIN|LEFT JOIN|ON|GROUP BY|ORDER BY|DISTINCT|IN|NOT IN|LIKE|BETWEEN|IS NULL|IS NOT NULL|ASC|DESC|COUNT|SUM|AVG|MIN|MAX)\b/gi, 
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Chip label={`${selectedTables.length} table(s)`} size="small" variant="outlined" />
                <Chip label={`${selectedFields.length || 'All'} column(s)`} size="small" variant="outlined" />
                {relationships.length > 0 && <Chip label={`${relationships.length} connection(s)`} size="small" color="warning" />}
                {visualFilters.length > 0 && <Chip label={`${visualFilters.length} filter(s)`} size="small" color="secondary" />}
              </Box>
            </Box>
          )}

          {/* Preview Tab */}
          {rightPanelTab === 1 && (
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
                <Alert severity="info">Select columns and click Refresh to preview</Alert>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
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
            </Box>
          )}
        </Box>
      </Box>

      {/* ============ DIALOGS ============ */}

      {/* Add Table Dialog */}
      <Dialog open={addTableOpen} onClose={() => setAddTableOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon color="primary" />
            Select a Table
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Choose a table that contains the data you want to work with
          </Typography>
          {schemaLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <List>
              {tables.filter((t: any) => !selectedTables.find(s => s.id === t.id)).map((t: any) => (
                <ListItem key={t.id} disablePadding>
                  <ListItemButton onClick={() => handleAddTable(t)}>
                    <ListItemIcon><StorageIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary={t.name} 
                      secondary={`${t.columns?.length || 0} columns available`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {tables.filter((t: any) => !selectedTables.find(s => s.id === t.id)).length === 0 && (
                <Alert severity="info">All available tables have been added</Alert>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTableOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Add Relationship Dialog */}
      <Dialog open={addRelationshipOpen} onClose={() => { setAddRelationshipOpen(false); resetRelationshipForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MergeIcon color="warning" />
            Connect Tables
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
            Define how these tables are related to each other
          </Typography>

          {/* Relationship Type */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>What do you want to do?</Typography>
          <RadioGroup value={relType} onChange={(e) => setRelType(e.target.value as any)} sx={{ mb: 3 }}>
            <FormControlLabel 
              value="combine" 
              control={<Radio />} 
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>🔗 Combine data from both tables</Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Merge rows where values match (like looking up related info)
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel 
              value="must-exist" 
              control={<Radio />} 
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>✅ Only include if exists in another table</Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Filter to records that have matching data in another table
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel 
              value="must-not-exist" 
              control={<Radio />} 
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>❌ Exclude if exists in another table</Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Remove records that have matching data in another table
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>

          <Divider sx={{ my: 2 }} />

          {/* From Table */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {relType === 'combine' ? 'First table:' : 'Reference table (to check against):'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Table</InputLabel>
              <Select value={relFromTable} onChange={(e) => { setRelFromTable(e.target.value); setRelFromColumn(''); }} label="Table">
                {selectedTables.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Column</InputLabel>
              <Select value={relFromColumn} onChange={(e) => setRelFromColumn(e.target.value)} label="Column" disabled={!relFromTable}>
                {selectedTables.find(t => t.id === relFromTable)?.columns.map(c => (
                  <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* To Table */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {relType === 'combine' ? 'Second table:' : 'Target table (to filter):'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Table</InputLabel>
              <Select value={relToTable} onChange={(e) => { setRelToTable(e.target.value); setRelToColumn(''); }} label="Table">
                {selectedTables.filter(t => t.id !== relFromTable).map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Column</InputLabel>
              <Select value={relToColumn} onChange={(e) => setRelToColumn(e.target.value)} label="Column" disabled={!relToTable}>
                {selectedTables.find(t => t.id === relToTable)?.columns.map(c => (
                  <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddRelationshipOpen(false); resetRelationshipForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRelationship} disabled={!relFromTable || !relFromColumn || !relToTable || !relToColumn}>
            Add Connection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Filter Dialog */}
      <Dialog open={addFilterOpen} onClose={() => setAddFilterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterAltIcon color="secondary" />
            Add a Filter
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Filter your data to show only records that match specific criteria
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select column to filter</InputLabel>
            <Select 
              value={filterTable && filterColumn ? `${filterTable}.${filterColumn}` : ''} 
              onChange={(e) => {
                const [t, c] = e.target.value.split('.');
                setFilterTable(t);
                setFilterColumn(c);
              }}
              label="Select column to filter"
            >
              {selectedTables.flatMap(t => t.columns.map(c => (
                <MenuItem key={`${t.id}.${c.name}`} value={`${t.id}.${c.name}`}>
                  {t.name}.{c.name}
                </MenuItem>
              )))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Condition</InputLabel>
            <Select value={filterOperator} onChange={(e) => setFilterOperator(e.target.value)} label="Condition">
              <MenuItem value="equals">is exactly</MenuItem>
              <MenuItem value="not_equals">is not</MenuItem>
              <MenuItem value="contains">contains</MenuItem>
              <MenuItem value="starts_with">starts with</MenuItem>
              <MenuItem value="ends_with">ends with</MenuItem>
              <MenuItem value="gt">is more than</MenuItem>
              <MenuItem value="lt">is less than</MenuItem>
              <MenuItem value="gte">is at least</MenuItem>
              <MenuItem value="lte">is at most</MenuItem>
              <MenuItem value="between">is between</MenuItem>
              <MenuItem value="is_null">is empty</MenuItem>
              <MenuItem value="is_not_null">has a value</MenuItem>
            </Select>
          </FormControl>

          {filterOperator === 'between' ? (
            <Box sx={{ px: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Range: {filterRangeValue[0]} to {filterRangeValue[1]}</Typography>
              <Slider value={filterRangeValue} onChange={(_, v) => setFilterRangeValue(v as [number, number])} min={0} max={1000} />
            </Box>
          ) : !['is_null', 'is_not_null'].includes(filterOperator) && (
            <TextField fullWidth size="small" label="Value" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFilterOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddFilter} disabled={!filterTable || !filterColumn}>
            Add Filter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Calculation Dialog */}
      <Dialog open={addCalculationOpen} onClose={() => setAddCalculationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon sx={{ color: '#00bcd4' }} />
            Add a Calculation
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Calculate aggregated values like totals, averages, and counts
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select column</InputLabel>
            <Select 
              value={calcTable && calcColumn ? `${calcTable}.${calcColumn}` : ''} 
              onChange={(e) => {
                const [t, c] = e.target.value.split('.');
                setCalcTable(t);
                setCalcColumn(c);
              }}
              label="Select column"
            >
              {selectedTables.flatMap(t => t.columns.map(c => (
                <MenuItem key={`${t.id}.${c.name}`} value={`${t.id}.${c.name}`}>
                  {t.name}.{c.name}
                </MenuItem>
              )))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Calculation type</InputLabel>
            <Select value={calcType} onChange={(e) => setCalcType(e.target.value)} label="Calculation type">
              <MenuItem value="count">COUNT - How many records</MenuItem>
              <MenuItem value="sum">SUM - Add up all values</MenuItem>
              <MenuItem value="avg">AVERAGE - Mean value</MenuItem>
              <MenuItem value="min">MIN - Smallest value</MenuItem>
              <MenuItem value="max">MAX - Largest value</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCalculationOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCalculation} disabled={!calcTable || !calcColumn}>
            Add Calculation
          </Button>
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

export default QueryBuilderFriendly;
