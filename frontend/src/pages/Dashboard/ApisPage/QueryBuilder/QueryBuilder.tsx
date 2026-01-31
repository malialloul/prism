import React, { useState, useRef } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, useTheme } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';
import { useFullSchema } from '../../../../api/entities/schema/useFullSchema';
import { SaveApiDialog } from './components/SaveApiDialog';
import {
  QueryBuilderWrapper,
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
}

interface VisualElement {
  id: string;
  type: 'filter' | 'grouping' | 'aggregation' | 'subquery';
  x: number;
  y: number;
  data: any;
}

export default function QueryBuilder({ connectedDatabase }: QueryBuilderProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const { data: schemaData } = useFullSchema(
    connectedDatabase?.id ? Number(connectedDatabase.id) : undefined,
  );

  const canvasRef = useRef<SVGSVGElement>(null);
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([]);
  const [tablePositions, setTablePositions] = useState<Record<string, TablePosition>>({});
  const [tableConnections, setTableConnections] = useState<TableConnection[]>([]);
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [visualElements, setVisualElements] = useState<VisualElement[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [addTableDialogOpen, setAddTableDialogOpen] = useState(false);
  const [draggedField, setDraggedField] = useState<{ tableId: string; columnName: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
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
    console.log('Adding table:', table);
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
    setTablePositions((prev) => {
      const newPos = { ...prev };
      delete newPos[tableId];
      return newPos;
    });
    setTableConnections((prev) =>
      prev.filter((c) => c.sourceTableId !== tableId && c.targetTableId !== tableId),
    );
    setSelectedFields((prev) => prev.filter((f) => f.tableId !== tableId));
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

  const handleFieldDragStart = (e: React.DragEvent<HTMLDivElement>, tableId: string, columnName: string, dragType: string) => {
    e.dataTransfer!.effectAllowed = 'copy';
    e.dataTransfer!.setData('sourceTableId', tableId);
    e.dataTransfer!.setData('sourceColumnName', columnName);
    e.dataTransfer!.setData('dragType', dragType);
    setDraggedField({ tableId, columnName });
  };

  const handleFieldDragEnd = () => {
    setDraggedField(null);
  };

  const handleCanvasFieldDrop = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    const sourceTableId = e.dataTransfer!.getData('sourceTableId');
    const sourceColumnName = e.dataTransfer!.getData('sourceColumnName');
    const dragType = e.dataTransfer!.getData('dragType');

    if (!sourceTableId || !sourceColumnName || !canvasRef.current) return;

    const svgRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    const newElement: VisualElement = {
      id: `${dragType}-${Date.now()}`,
      type: dragType as any,
      x,
      y,
      data: {
        tableId: sourceTableId,
        columnName: sourceColumnName,
        ...(dragType === 'filter' && { operator: 'equals', value: '' }),
        ...(dragType === 'aggregation' && { functionType: 'COUNT' }),
      },
    };

    setVisualElements((prev) => [...prev, newElement]);
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

  const handleSaveApi = async (apiName: string, description: string) => {
    const queryConfig: QueryConfig = {
      tables: selectedTables.map((t) => ({ name: t.name, alias: t.name })),
      tableConnections,
      selectedFields,
      filters: visualElements.filter(el => el.type === 'filter').map(el => ({
        id: el.id,
        tableName: el.data.tableId,
        fieldName: el.data.columnName,
        operator: el.data.operator,
        value: el.data.value,
      })) as FilterCondition[],
      grouping: visualElements.filter(el => el.type === 'grouping').map(el => ({
        tableName: el.data.tableId,
        fieldName: el.data.columnName,
      })),
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
          <line
            key={`line-${conn.id}`}
            x1={fromPos.x + 180}
            y1={fromPos.y + 100}
            x2={toPos.x}
            y2={toPos.y + 100}
            stroke="#1976d2"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            style={{ pointerEvents: 'none' }}
          />
        );
      })
      .filter((line) => line !== null);
  };

  return (
    <QueryBuilderWrapper>
      <Header>
        <Box>
          <Title>Design Your Data View</Title>
          <Box sx={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#666', mt: 0.5 }}>
            💡 Drag tables, connect them, drag fields down for filters/aggregations
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
          <p>👋 Start by adding a table from your database</p>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddTableDialogOpen(true)}>
            Add Your First Table
          </Button>
        </EmptyStateMessage>
      ) : (
        <Canvas
          ref={canvasRef}
          width={1400}
          height={800}
          onDragOver={handleCanvasDragOver}
          onDrop={(e) => {
            e.preventDefault();
            const dragType = e.dataTransfer?.getData('dragType');
            if (dragType) {
              handleCanvasFieldDrop(e);
            } else {
              handleCanvasDrop(e);
            }
          }}
          style={{ border: `1px solid ${isDark ? '#334155' : '#ddd'}` }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#1976d2" />
            </marker>
          </defs>

          {drawConnectionLines()}

          {/* Render table cards */}
          {selectedTables.map((table) => {
            const pos = tablePositions[table.id] || { x: 0, y: 0 };

            return (
              <foreignObject
                key={`table-${table.id}`}
                x={pos.x}
                y={pos.y}
                width="220"
                height="350"
                style={{ overflow: 'visible' }}
              >
                <TableCard
                  draggable
                  onDragStart={(e) => handleTableDragStart(e, table.id)}
                  sx={{
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <TableCardTitle>{table.name}</TableCardTitle>
                    <Button
                      size="small"
                      onClick={() => handleRemoveTable(table.id)}
                      sx={{ minWidth: 'auto', p: 0.5, color: '#999' }}
                    >
                      ✕
                    </Button>
                  </Box>

                  <TableCardFields>
                    {table.columns.slice(0, 6).map((field) => (
                      <FieldItem
                        key={`${table.id}-${field.name}`}
                        draggable
                        onDragStart={(e) => {
                          if (e.ctrlKey || e.metaKey) {
                            handleFieldDragStart(e, table.id, field.name, 'filter');
                          } else if (e.shiftKey) {
                            handleFieldDragStart(e, table.id, field.name, 'aggregation');
                          } else {
                            handleConnectionDragStart(e, table.id, field.name);
                          }
                        }}
                        onDragEnd={handleFieldDragEnd}
                        onDragOver={handleConnectionDragOver}
                        onDrop={(e) => handleConnectionDrop(e, table.id, field.name)}
                        sx={{
                          cursor: draggedField?.tableId === table.id ? 'grabbing' : 'grab',
                          position: 'relative',
                        } as any}
                      >
                        <Tooltip title="Drag: Connect | Ctrl+Drag: Filter | Shift+Drag: Aggregate">
                          <ConnectionPoint
                            isSelected={selectedFields.some(
                              (f) => f.tableId === table.id && f.columnName === field.name,
                            )}
                            onClick={() =>
                              handleSelectField({
                                tableId: table.id,
                                columnName: field.name,
                                aggregation: null,
                              })
                            }
                          />
                        </Tooltip>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', color: isDark ? '#f1f5f9' : '#1a1a1a' }}>
                            {field.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: isDark ? '#64748b' : '#999' }}>
                            {field.type}
                          </div>
                        </Box>
                      </FieldItem>
                    ))}
                    {table.columns.length > 6 && (
                      <Box sx={{ fontSize: '0.75rem', color: isDark ? '#64748b' : '#999', p: 0.75, textAlign: 'center' }}>
                        +{table.columns.length - 6} more
                      </Box>
                    )}
                  </TableCardFields>
                </TableCard>
              </foreignObject>
            );
          })}

          {/* Render visual elements (filters, grouping, aggregations) */}
          {visualElements.map((element) => {
            const iconMap = {
              filter: '🔍',
              grouping: '🎯',
              aggregation: '📈',
              subquery: '🔗',
            };

            return (
              <foreignObject
                key={element.id}
                x={element.x}
                y={element.y}
                width="160"
                height="60"
                style={{ overflow: 'visible' }}
              >
                <Box
                  onClick={() => setVisualElements(prev => prev.filter(el => el.id !== element.id))}
                  sx={{
                    p: 1,
                    backgroundColor: isDark ? {
                      filter: 'rgba(255, 183, 77, 0.15)',
                      grouping: 'rgba(206, 147, 216, 0.15)',
                      aggregation: 'rgba(100, 181, 246, 0.15)',
                      subquery: 'rgba(255, 183, 77, 0.15)',
                    }[element.type] : {
                      filter: '#fff3e0',
                      grouping: '#f3e5f5',
                      aggregation: '#e3f2fd',
                      subquery: '#fff8e1',
                    }[element.type],
                    border: `2px solid ${
                      {
                        filter: '#ffb74d',
                        grouping: '#ce93d8',
                        aggregation: '#64b5f6',
                        subquery: '#ffb74d',
                      }[element.type]
                    }`,
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.15)',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Tooltip title={`Click to remove`}>
                    <Box sx={{ fontSize: '0.8rem', fontWeight: 500, color: isDark ? '#f1f5f9' : 'inherit' }}>
                      <Box sx={{ fontSize: '1.2rem', mb: 0.5 }}>{iconMap[element.type]}</Box>
                      <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {element.data.columnName}
                      </Box>
                      <Box sx={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#666', mt: 0.25 }}>
                        {element.type === 'filter' && `${element.data.operator}`}
                        {element.type === 'aggregation' && `${element.data.functionType}`}
                        {element.type === 'grouping' && 'Group by'}
                      </Box>
                    </Box>
                  </Tooltip>
                </Box>
              </foreignObject>
            );
          })}
        </Canvas>
      )}

      {/* Add Table Dialog */}
      <Dialog open={addTableDialogOpen} onClose={() => setAddTableDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Table</DialogTitle>
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
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  {table.name}
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

      {/* Connection Confirmation Dialog */}
      <Dialog open={connectDialogOpen} onClose={handleCloseConnectionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Connect Tables</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Box sx={{ fontWeight: 500, mb: 1 }}>From:</Box>
              <Box sx={{ p: 1.5, backgroundColor: isDark ? '#1a1f35' : '#f5f5f5', borderRadius: 1 }}>
                {connectingFrom?.tableId} → {connectingFrom?.columnName}
              </Box>
            </Box>
            <Box>
              <Box sx={{ fontWeight: 500, mb: 1 }}>To:</Box>
              <Box sx={{ p: 1.5, backgroundColor: isDark ? '#1a1f35' : '#f5f5f5', borderRadius: 1 }}>
                {connectingTo?.tableId} → {connectingTo?.columnName}
              </Box>
            </Box>
            <Box sx={{ p: 1, backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)', borderRadius: 1, fontSize: '0.9rem' }}>
              ✓ Tables will be connected where these columns match
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConnectionDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmConnection}>
            Connect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Button */}
      {selectedTables.length > 0 && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 100 }}>
          <Button
            variant="contained"
            onClick={() => setShowPreview(!showPreview)}
            sx={{ borderRadius: '50px', px: 3 }}
          >
            {showPreview ? '📋 Hide Preview' : '📋 Show Preview'}
          </Button>
        </Box>
      )}

      {/* Preview Panel */}
      {showPreview && (
        <Box
          sx={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: '350px',
            backgroundColor: isDark ? '#141825' : 'white',
            borderLeft: `1px solid ${isDark ? '#334155' : '#ddd'}`,
            overflowY: 'auto',
            p: 2,
            zIndex: 99,
            boxShadow: isDark ? '-2px 0 8px rgba(0,0,0,0.3)' : '-2px 0 8px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>📋 Your Query</Box>

          <Box sx={{ fontSize: '0.85rem', mb: 2 }}>
            <Box sx={{ fontWeight: 500, mb: 1 }}>📊 Selected Fields:</Box>
            {selectedFields.length === 0 ? (
              <Box sx={{ color: isDark ? '#64748b' : '#999', fontSize: '0.8rem' }}>Click dots on tables to select</Box>
            ) : (
              selectedFields.map(f => (
                <Box key={`${f.tableId}-${f.columnName}`} sx={{ color: isDark ? '#94a3b8' : '#666', fontSize: '0.8rem', mb: 0.5 }}>
                  • {f.columnName}
                </Box>
              ))
            )}
          </Box>

          <Box sx={{ fontSize: '0.85rem', mb: 2 }}>
            <Box sx={{ fontWeight: 500, mb: 1 }}>🔗 Connections:</Box>
            {tableConnections.length === 0 ? (
              <Box sx={{ color: isDark ? '#64748b' : '#999', fontSize: '0.8rem' }}>Drag fields between tables</Box>
            ) : (
              tableConnections.map(c => (
                <Box key={c.id} sx={{ color: isDark ? '#94a3b8' : '#666', fontSize: '0.8rem', mb: 0.5 }}>
                  • {c.sourceTableId} → {c.targetTableId}
                </Box>
              ))
            )}
          </Box>

          <Box sx={{ fontSize: '0.85rem' }}>
            <Box sx={{ fontWeight: 500, mb: 1 }}>⚙️ Operations:</Box>
            {visualElements.length === 0 ? (
              <Box sx={{ color: isDark ? '#64748b' : '#999', fontSize: '0.8rem' }}>Ctrl+Drag for filters, Shift+Drag for aggregations</Box>
            ) : (
              visualElements.map(el => (
                <Box key={el.id} sx={{ color: isDark ? '#94a3b8' : '#666', fontSize: '0.8rem', mb: 0.5 }}>
                  • {el.type === 'filter' ? '🔍' : el.type === 'aggregation' ? '📈' : '🎯'} {el.data.columnName}
                </Box>
              ))
            )}
          </Box>
        </Box>
      )}
    </QueryBuilderWrapper>
  );
}

// Also export as named export for compatibility
export { QueryBuilder };
