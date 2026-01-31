import React, { useState, useRef } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  DragHandle as DragIcon,
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
  aggregation?: string | null;
  sortOrder?: 'asc' | 'desc' | null;
  distinct?: boolean;
}

interface VisualFilter {
  id: string;
  tableId: string;
  columnName: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
  value: string | string[];
  x: number;
  y: number;
}

function QueryBuilderPro({ connectedDatabase }: QueryBuilderProps) {
  const { data: schemaData } = useFullSchema(
    connectedDatabase?.id ? Number(connectedDatabase.id) : undefined,
  );

  const canvasRef = useRef<SVGSVGElement>(null);
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([]);
  const [tablePositions, setTablePositions] = useState<Record<string, TablePosition>>({});
  const [tableConnections, setTableConnections] = useState<TableConnection[]>([]);
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [visualFilters, setVisualFilters] = useState<VisualFilter[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [addTableDialogOpen, setAddTableDialogOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState(0);

  const connectionInitiatedRef = useRef(false);
  const [connectingFrom, setConnectingFrom] = useState<{ tableId: string; columnName: string } | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectingTo, setConnectingTo] = useState<{ tableId: string; columnName: string } | null>(null);

  const tables = schemaData?.tables?.map((table: any) => ({
    id: table.name,
    name: table.name,
    columns: table.columns || [],
  })) || [];

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

  const handleConnectionDragStart = (e: React.DragEvent<HTMLDivElement>, fromTableId: string, columnName: string) => {
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

  const handleSelectField = (field: SelectedField) => {
    if (!selectedFields.find((f) => f.tableId === field.tableId && f.columnName === field.columnName)) {
      setSelectedFields((prev) => [...prev, field]);
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
      grouping: [],
      having: [],
      apiName,
      description,
    };
    console.log('Query Config:', queryConfig);
    setSaveDialogOpen(false);
  };

  const drawConnectionLines = () => {
    return tableConnections
      .map((conn) => {
        const fromPos = tablePositions[conn.sourceTableId];
        const toPos = tablePositions[conn.targetTableId];
        if (!fromPos || !toPos) return null;

        return (
          <g key={`line-${conn.id}`}>
            <line
              x1={fromPos.x + 180}
              y1={fromPos.y + 100}
              x2={toPos.x}
              y2={toPos.y + 100}
              stroke="#2196F3"
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        );
      })
      .filter((line) => line !== null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', backgroundColor: '#fafafa' }}>
      {/* Main Canvas Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header>
          <Box>
            <Title>Visual Query Builder</Title>
            <Box sx={{ fontSize: '0.85rem', color: '#666', mt: 0.5 }}>
              🔗 Connect tables • 🔍 Add filters • 📊 Aggregate data • 💾 Generate API
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setAddTableDialogOpen(true)}>
              Add Table
            </Button>
            <SaveButton variant="contained" startIcon={<SaveIcon />} onClick={() => setSaveDialogOpen(true)} disabled={selectedTables.length === 0}>
              Save as API
            </SaveButton>
          </Box>
        </Header>

        {selectedTables.length === 0 ? (
          <EmptyStateMessage>
            <p>👋 Start building your query</p>
            <Box sx={{ fontSize: '0.95rem', color: '#666', mb: 2 }}>
              Click "Add Table" to select database tables
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddTableDialogOpen(true)}>
              Add Your First Table
            </Button>
          </EmptyStateMessage>
        ) : (
          <Canvas
            ref={canvasRef}
            width={1000}
            height={600}
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            style={{ border: '1px solid #e0e0e0' }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#2196F3" />
              </marker>
            </defs>

            {drawConnectionLines()}

            {selectedTables.map((table) => {
              const pos = tablePositions[table.id] || { x: 0, y: 0 };

              return (
                <foreignObject
                  key={`table-${table.id}`}
                  x={pos.x}
                  y={pos.y}
                  width="240"
                  height="380"
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
                        <Button
                          size="small"
                          onClick={() => handleRemoveTable(table.id)}
                          sx={{ minWidth: 'auto', p: 0.5, color: '#d32f2f' }}
                        >
                          ✕
                        </Button>
                      </Tooltip>
                    </Box>

                    <Divider sx={{ mb: 1 }} />

                    <TableCardFields>
                      {table.columns.slice(0, 8).map((field) => (
                        <Tooltip
                          key={`${table.id}-${field.name}`}
                          title="Drag: Connect tables | Click: Select field"
                          arrow
                        >
                          <FieldItem
                            draggable
                            onDragStart={(e) => handleConnectionDragStart(e, table.id, field.name)}
                            onDragOver={handleConnectionDragOver}
                            onDrop={(e) => handleConnectionDrop(e, table.id, field.name)}
                            onClick={() =>
                              handleSelectField({
                                tableId: table.id,
                                columnName: field.name,
                              })
                            }
                            sx={{
                              cursor: 'grab',
                              backgroundColor: selectedFields.some(
                                (f) => f.tableId === table.id && f.columnName === field.name
                              )
                                ? '#e3f2fd'
                                : '#f5f5f5',
                              border: selectedFields.some(
                                (f) => f.tableId === table.id && f.columnName === field.name
                              )
                                ? '1px solid #2196F3'
                                : '1px solid #ddd',
                            }}
                          >
                            <ConnectionPoint
                              isSelected={selectedFields.some(
                                (f) => f.tableId === table.id && f.columnName === field.name,
                              )}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                {field.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                {field.type}
                              </div>
                            </Box>
                          </FieldItem>
                        </Tooltip>
                      ))}
                      {table.columns.length > 8 && (
                        <Box sx={{ fontSize: '0.75rem', color: '#999', p: 1, textAlign: 'center' }}>
                          +{table.columns.length - 8} more fields
                        </Box>
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
            width: 380,
            backgroundColor: 'white',
            borderLeft: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
          }}
        >
          <Tabs value={rightPanelTab} onChange={(_, v) => setRightPanelTab(v)} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Tab label="📋 Results" />
            <Tab label="🔍 Filters" />
            <Tab label="📊 Details" />
          </Tabs>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {/* Results Tab */}
            {rightPanelTab === 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Selected Columns
                </Typography>
                {selectedFields.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                    Click column names on tables to select what to show
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedFields.map((field, idx) => (
                      <Paper key={`${field.tableId}-${field.columnName}`} sx={{ p: 1.5, backgroundColor: '#f5f5f5' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {field.columnName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#999' }}>
                              from {field.tableId}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            onClick={() => setSelectedFields((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            ✕
                          </Button>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                          <Tooltip title="Sort ascending">
                            <Button
                              size="small"
                              variant={field.sortOrder === 'asc' ? 'contained' : 'outlined'}
                              onClick={() => toggleFieldSort(field.tableId, field.columnName, 'asc')}
                              sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                            >
                              ↑ ASC
                            </Button>
                          </Tooltip>
                          <Tooltip title="Sort descending">
                            <Button
                              size="small"
                              variant={field.sortOrder === 'desc' ? 'contained' : 'outlined'}
                              onClick={() => toggleFieldSort(field.tableId, field.columnName, 'desc')}
                              sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                            >
                              ↓ DESC
                            </Button>
                          </Tooltip>
                          <Tooltip title="Only unique values">
                            <Button
                              size="small"
                              variant={field.distinct ? 'contained' : 'outlined'}
                              onClick={() => toggleFieldDistinct(field.tableId, field.columnName)}
                              sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                            >
                              ✓ DISTINCT
                            </Button>
                          </Tooltip>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Table Connections
                  </Typography>
                  {tableConnections.length === 0 ? (
                    <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                      Drag column names between tables to connect them
                    </Alert>
                  ) : (
                    tableConnections.map((conn) => (
                      <Paper key={conn.id} sx={{ p: 1.5, backgroundColor: '#f5f5f5', mb: 1 }}>
                        <Typography variant="body2">
                          {conn.sourceTableId} <strong>→</strong> {conn.targetTableId}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {conn.sourceColumn} = {conn.targetColumn}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() =>
                            setTableConnections((prev) => prev.filter((c) => c.id !== conn.id))
                          }
                          sx={{ mt: 0.5 }}
                        >
                          Remove
                        </Button>
                      </Paper>
                    ))
                  )}
                </Box>
              </Box>
            )}

            {/* Filters Tab */}
            {rightPanelTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Filter Results
                  </Typography>
                  <Tooltip title="Add a condition to narrow down results">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      disabled={selectedFields.length === 0}
                    >
                      Add
                    </Button>
                  </Tooltip>
                </Box>

                {visualFilters.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                    Filters help show only the data you want. Example: "Show orders where status = pending"
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {visualFilters.map((filter) => (
                      <Paper key={filter.id} sx={{ p: 1.5, backgroundColor: '#fff3e0' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {filter.columnName} {filter.operator}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#999' }}>
                              {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            onClick={() => setVisualFilters((prev) => prev.filter((f) => f.id !== filter.id))}
                          >
                            ✕
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Details Tab */}
            {rightPanelTab === 2 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Query Summary
                </Typography>

                <Paper sx={{ p: 1.5, backgroundColor: '#f5f5f5', mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Tables: {selectedTables.length}
                  </Typography>
                  <Box sx={{ fontSize: '0.9rem' }}>
                    {selectedTables.map((t) => (
                      <Chip key={t.id} label={t.name} size="small" sx={{ m: 0.5 }} />
                    ))}
                  </Box>
                </Paper>

                <Paper sx={{ p: 1.5, backgroundColor: '#f5f5f5', mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Columns: {selectedFields.length}
                  </Typography>
                  <Box sx={{ fontSize: '0.9rem' }}>
                    {selectedFields.map((f) => (
                      <Chip key={`${f.tableId}-${f.columnName}`} label={f.columnName} size="small" sx={{ m: 0.5 }} />
                    ))}
                  </Box>
                </Paper>

                <Paper sx={{ p: 1.5, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Filters: {visualFilters.length}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                    {visualFilters.length === 0
                      ? 'No filters applied. All data will be shown.'
                      : `${visualFilters.length} condition${visualFilters.length > 1 ? 's' : ''} applied`}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Add Table Dialog */}
      <Dialog open={addTableDialogOpen} onClose={() => setAddTableDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Table to Query</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                  <Box sx={{ textAlign: 'left', width: '100%' }}>
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
              <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                All tables are already added
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <SaveApiDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveApi}
        selectedTables={selectedTables.map((t) => ({ id: t.id, name: t.name }))}
        selectedFields={selectedFields}
      />

      {/* Connection Dialog */}
      <Dialog open={connectDialogOpen} onClose={handleCloseConnectionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Combine Tables</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            When columns are equal, rows from both tables will be combined
          </Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
              <Typography variant="caption" sx={{ color: '#999', fontWeight: 500 }}>
                From Table
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                {connectingFrom?.tableId} → {connectingFrom?.columnName}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, backgroundColor: '#f3e5f5' }}>
              <Typography variant="caption" sx={{ color: '#999', fontWeight: 500 }}>
                To Table
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                {connectingTo?.tableId} → {connectingTo?.columnName}
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
    </Box>
  );
}

export default QueryBuilderPro;
