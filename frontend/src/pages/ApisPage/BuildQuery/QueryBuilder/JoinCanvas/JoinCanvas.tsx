import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import {
  Storage as TableIcon,
  Close as CloseIcon,
  VpnKey as KeyIcon,
  Link as ForeignKeyIcon,
  ViewColumn as ColumnIcon,
  Check as CheckIcon,
  DragHandle as DragIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  CallMerge as JoinIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import {
  CanvasContainer,
  CanvasHeader,
  CanvasTitle,
  CanvasControls,
  ControlButton,
  CanvasViewport,
  CanvasInner,
  DropZone,
  DropZoneText,
  TableCard,
  TableCardHeader,
  TableCardIcon,
  TableCardName,
  TableCardActions,
  TableCardButton,
  RemoveButton,
  TableCardColumns,
  ColumnRow,
  ColumnCheckbox,
  ColumnRowIcon,
  ColumnRowName,
  ColumnRowType,
  JoinLinesSvg,
  JoinLine,
  JoinBadge,
  JoinBadgeText,
  JoinBadgeDelete,
  JoinDialog,
  JoinDialogHeader,
  JoinDialogTitle,
  JoinDialogContent,
  JoinTypeSelect,
  JoinColumnSelector,
  JoinColumnSelect,
  JoinEqualsIcon,
  JoinDialogActions,
  EmptyCanvasState,
  EmptyCanvasIcon,
  EmptyCanvasTitle,
  EmptyCanvasText,
  ZoomIndicator,
  ZoomText,
} from './JoinCanvas.styles';
import type {
  CanvasTable,
  TableJoin,
  JoinType,
  SchemaTable,
  SchemaColumn,
  TablePosition,
  SelectedField,
  JoinCanvasProps,
  JOIN_TYPES,
} from '../types';
import { generateId } from '../types';

const JOIN_TYPE_OPTIONS: { value: JoinType; label: string; description: string }[] = [
  { value: 'INNER', label: 'Matching Only', description: 'Only matching rows from both tables' },
  { value: 'LEFT', label: 'Include All Left', description: 'All rows from first table + matching from second' },
  { value: 'RIGHT', label: 'Include All Right', description: 'All rows from second table + matching from first' },
  { value: 'FULL', label: 'Include All', description: 'All rows from both tables' },
];

interface JoinCanvasInternalProps extends JoinCanvasProps {
  canvasWidth?: number;
  canvasHeight?: number;
}

export default function JoinCanvas({
  canvasTables,
  joins,
  onTableMove,
  onTableRemove,
  onJoinAdd,
  onJoinUpdate,
  onJoinRemove,
  onTableDrop,
  selectedFields,
  onFieldToggle,
  canvasWidth = 3000,
  canvasHeight = 2000,
}: JoinCanvasInternalProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedJoin, setSelectedJoin] = useState<string | null>(null);
  const [joinDialogState, setJoinDialogState] = useState<{
    open: boolean;
    sourceTableId: string;
    targetTableId: string;
    type: JoinType;
    sourceColumn: string;
    targetColumn: string;
    isEdit: boolean;
    editJoinId?: string;
  } | null>(null);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.1, 0.3));
  }, []);

  const handleCenterView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Table drag handling
  const handleTableMouseDown = useCallback(
    (e: React.MouseEvent, tableId: string) => {
      if ((e.target as HTMLElement).closest('button')) return;
      
      const table = canvasTables.find((t) => t.id === tableId);
      if (!table) return;

      e.preventDefault();
      setDraggingTable(tableId);
      setDragOffset({
        x: e.clientX / zoom - table.position.x,
        y: e.clientY / zoom - table.position.y,
      });
    },
    [canvasTables, zoom]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingTable) return;

      const newX = e.clientX / zoom - dragOffset.x;
      const newY = e.clientY / zoom - dragOffset.y;

      // Snap to grid
      const snappedX = Math.round(newX / 20) * 20;
      const snappedY = Math.round(newY / 20) * 20;

      onTableMove(draggingTable, {
        x: Math.max(0, Math.min(canvasWidth - 260, snappedX)),
        y: Math.max(0, Math.min(canvasHeight - 300, snappedY)),
      });
    },
    [draggingTable, dragOffset, zoom, onTableMove, canvasWidth, canvasHeight]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingTable(null);
  }, []);

  // Drop handling
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        
        // Check if it's a table (not a column)
        if (data.columns) {
          const table = data as SchemaTable;
          
          // Calculate drop position relative to canvas
          const rect = viewportRef.current?.getBoundingClientRect();
          if (rect) {
            const x = (e.clientX - rect.left) / zoom - pan.x;
            const y = (e.clientY - rect.top) / zoom - pan.y;
            
            // Snap to grid
            const snappedX = Math.round(x / 20) * 20;
            const snappedY = Math.round(y / 20) * 20;
            
            onTableDrop(table, {
              x: Math.max(20, Math.min(canvasWidth - 280, snappedX)),
              y: Math.max(20, Math.min(canvasHeight - 320, snappedY)),
            });
          }
        }
      } catch {
        // Invalid data
      }
    },
    [zoom, pan, onTableDrop, canvasWidth, canvasHeight]
  );

  // Check if a field is selected
  const isFieldSelected = useCallback(
    (tableId: string, columnName: string) => {
      return selectedFields.some(
        (f) => f.tableId === tableId && f.columnName === columnName
      );
    },
    [selectedFields]
  );

  // Check if a column is used in a join
  const isJoinColumn = useCallback(
    (tableId: string, columnName: string) => {
      return joins.some(
        (j) =>
          (j.sourceTableId === tableId && j.sourceColumn === columnName) ||
          (j.targetTableId === tableId && j.targetColumn === columnName)
      );
    },
    [joins]
  );

  // Open join dialog
  const handleCreateJoin = useCallback(
    (sourceTableId: string, targetTableId: string) => {
      const sourceTable = canvasTables.find((t) => t.id === sourceTableId);
      const targetTable = canvasTables.find((t) => t.id === targetTableId);
      
      if (!sourceTable || !targetTable) return;

      // Try to find matching columns (FK relationship)
      let defaultSourceCol = sourceTable.columns[0]?.name || '';
      let defaultTargetCol = targetTable.columns[0]?.name || '';

      for (const col of sourceTable.columns) {
        if (col.isForeignKey && col.foreignKeyRef?.table === targetTable.name) {
          defaultSourceCol = col.name;
          defaultTargetCol = col.foreignKeyRef.column;
          break;
        }
      }

      for (const col of targetTable.columns) {
        if (col.isForeignKey && col.foreignKeyRef?.table === sourceTable.name) {
          defaultTargetCol = col.name;
          defaultSourceCol = col.foreignKeyRef.column;
          break;
        }
      }

      setJoinDialogState({
        open: true,
        sourceTableId,
        targetTableId,
        type: 'INNER',
        sourceColumn: defaultSourceCol,
        targetColumn: defaultTargetCol,
        isEdit: false,
      });
    },
    [canvasTables]
  );

  // Edit existing join
  const handleEditJoin = useCallback(
    (joinId: string) => {
      const join = joins.find((j) => j.id === joinId);
      if (!join) return;

      setJoinDialogState({
        open: true,
        sourceTableId: join.sourceTableId,
        targetTableId: join.targetTableId,
        type: join.type,
        sourceColumn: join.sourceColumn,
        targetColumn: join.targetColumn,
        isEdit: true,
        editJoinId: joinId,
      });
    },
    [joins]
  );

  // Save join
  const handleSaveJoin = useCallback(() => {
    if (!joinDialogState) return;

    const { sourceTableId, targetTableId, type, sourceColumn, targetColumn, isEdit, editJoinId } =
      joinDialogState;

    if (!sourceColumn || !targetColumn) return;

    if (isEdit && editJoinId) {
      onJoinUpdate(editJoinId, { type, sourceColumn, targetColumn });
    } else {
      onJoinAdd({
        type,
        sourceTableId,
        targetTableId,
        sourceColumn,
        targetColumn,
      });
    }

    setJoinDialogState(null);
  }, [joinDialogState, onJoinAdd, onJoinUpdate]);

  // Calculate join line path
  const getJoinLinePath = useCallback(
    (join: TableJoin): { path: string; midPoint: { x: number; y: number } } => {
      const sourceTable = canvasTables.find((t) => t.id === join.sourceTableId);
      const targetTable = canvasTables.find((t) => t.id === join.targetTableId);

      if (!sourceTable || !targetTable) {
        return { path: '', midPoint: { x: 0, y: 0 } };
      }

      const sourceX = sourceTable.position.x + 260;
      const sourceY = sourceTable.position.y + 60;
      const targetX = targetTable.position.x;
      const targetY = targetTable.position.y + 60;

      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2;

      // Curved path
      const controlOffset = Math.abs(targetX - sourceX) / 3;
      const path = `M ${sourceX} ${sourceY} C ${sourceX + controlOffset} ${sourceY}, ${targetX - controlOffset} ${targetY}, ${targetX} ${targetY}`;

      return { path, midPoint: { x: midX, y: midY } };
    },
    [canvasTables]
  );

  // Wheel zoom
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((z) => Math.max(0.3, Math.min(2, z + delta)));
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <CanvasContainer elevation={0}>
      <CanvasHeader>
        <CanvasTitle>Join Canvas</CanvasTitle>
        <CanvasControls>
          <Tooltip title="Zoom In">
            <ControlButton onClick={handleZoomIn}>
              <ZoomInIcon />
            </ControlButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <ControlButton onClick={handleZoomOut}>
              <ZoomOutIcon />
            </ControlButton>
          </Tooltip>
          <Tooltip title="Reset View">
            <ControlButton onClick={handleCenterView}>
              <CenterIcon />
            </ControlButton>
          </Tooltip>
        </CanvasControls>
      </CanvasHeader>

      <CanvasViewport
        ref={viewportRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <CanvasInner
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          {/* Join Lines SVG */}
          <JoinLinesSvg width={canvasWidth} height={canvasHeight}>
            {joins.map((join) => {
              const { path } = getJoinLinePath(join);
              return (
                <JoinLine
                  key={join.id}
                  d={path}
                  isSelected={selectedJoin === join.id}
                  onClick={() => setSelectedJoin(join.id)}
                />
              );
            })}
          </JoinLinesSvg>

          {/* Join Badges */}
          {joins.map((join) => {
            const { midPoint } = getJoinLinePath(join);
            return (
              <JoinBadge
                key={`badge-${join.id}`}
                style={{
                  left: midPoint.x - 40,
                  top: midPoint.y - 12,
                }}
                onClick={() => handleEditJoin(join.id)}
              >
                <JoinBadgeText>{join.type}</JoinBadgeText>
                <JoinBadgeDelete
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoinRemove(join.id);
                  }}
                >
                  <CloseIcon />
                </JoinBadgeDelete>
              </JoinBadge>
            );
          })}

          {/* Table Cards */}
          {canvasTables.map((table) => (
            <TableCard
              key={table.id}
              elevation={0}
              style={{
                left: table.position.x,
                top: table.position.y,
              }}
              onMouseDown={(e) => handleTableMouseDown(e, table.id)}
            >
              <TableCardHeader>
                <TableCardIcon>
                  <TableIcon />
                </TableCardIcon>
                <TableCardName>{table.name}</TableCardName>
                <TableCardActions>
                  {canvasTables.length > 1 && (
                    <Tooltip title="Link Tables">
                      <TableCardButton
                        size="small"
                        onClick={() => {
                          const otherTable = canvasTables.find((t) => t.id !== table.id);
                          if (otherTable) {
                            handleCreateJoin(table.id, otherTable.id);
                          }
                        }}
                      >
                        <JoinIcon />
                      </TableCardButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Remove">
                    <RemoveButton size="small" onClick={() => onTableRemove(table.id)}>
                      <CloseIcon />
                    </RemoveButton>
                  </Tooltip>
                </TableCardActions>
              </TableCardHeader>

              <TableCardColumns>
                {table.columns.map((column) => (
                  <ColumnRow
                    key={column.name}
                    isSelected={isFieldSelected(table.id, column.name)}
                    isJoinColumn={isJoinColumn(table.id, column.name)}
                    onClick={() => onFieldToggle(table.id, column)}
                  >
                    <ColumnCheckbox isChecked={isFieldSelected(table.id, column.name)}>
                      {isFieldSelected(table.id, column.name) && <CheckIcon />}
                    </ColumnCheckbox>
                    <ColumnRowIcon
                      isPrimaryKey={column.isPrimaryKey}
                      isForeignKey={column.isForeignKey}
                    >
                      {column.isPrimaryKey ? (
                        <KeyIcon />
                      ) : column.isForeignKey ? (
                        <ForeignKeyIcon />
                      ) : (
                        <ColumnIcon />
                      )}
                    </ColumnRowIcon>
                    <ColumnRowName>{column.name}</ColumnRowName>
                    <ColumnRowType>{column.type}</ColumnRowType>
                  </ColumnRow>
                ))}
              </TableCardColumns>
            </TableCard>
          ))}

          {/* Empty State */}
          {canvasTables.length === 0 && (
            <EmptyCanvasState>
              <EmptyCanvasIcon>
                <DragIndicatorIcon />
              </EmptyCanvasIcon>
              <EmptyCanvasTitle>Start Building Your Query</EmptyCanvasTitle>
              <EmptyCanvasText>
                Drag tables from the left panel onto this canvas to begin.
                Click columns to select them for your query.
              </EmptyCanvasText>
            </EmptyCanvasState>
          )}
        </CanvasInner>

        {/* Drop Zone Overlay */}
        <DropZone isDragOver={isDragOver}>
          <DropZoneText>Drop table here</DropZoneText>
        </DropZone>

        {/* Zoom Indicator */}
        <ZoomIndicator>
          <ControlButton size="small" onClick={handleZoomOut}>
            <ZoomOutIcon />
          </ControlButton>
          <ZoomText>{Math.round(zoom * 100)}%</ZoomText>
          <ControlButton size="small" onClick={handleZoomIn}>
            <ZoomInIcon />
          </ControlButton>
        </ZoomIndicator>
      </CanvasViewport>

      {/* Join Dialog */}
      {joinDialogState && (
        <JoinDialog
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <JoinDialogHeader>
            <JoinDialogTitle>
              {joinDialogState.isEdit ? 'Edit Link' : 'Link Tables'}
            </JoinDialogTitle>
            <ControlButton size="small" onClick={() => setJoinDialogState(null)}>
              <CloseIcon />
            </ControlButton>
          </JoinDialogHeader>

          <JoinDialogContent>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#71717a' }}>Link Type</InputLabel>
              <JoinTypeSelect
                value={joinDialogState.type}
                label="Link Type"
                onChange={(e) =>
                  setJoinDialogState((s) =>
                    s ? { ...s, type: e.target.value as JoinType } : null
                  )
                }
              >
                {JOIN_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </JoinTypeSelect>
            </FormControl>

            <JoinColumnSelector>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: '#71717a', fontSize: '12px' }}>
                  {canvasTables.find((t) => t.id === joinDialogState.sourceTableId)?.name}
                </InputLabel>
                <JoinColumnSelect
                  value={joinDialogState.sourceColumn}
                  label={canvasTables.find((t) => t.id === joinDialogState.sourceTableId)?.name}
                  onChange={(e) =>
                    setJoinDialogState((s) =>
                      s ? { ...s, sourceColumn: e.target.value as string } : null
                    )
                  }
                >
                  {canvasTables
                    .find((t) => t.id === joinDialogState.sourceTableId)
                    ?.columns.map((col) => (
                      <MenuItem key={col.name} value={col.name}>
                        {col.name}
                      </MenuItem>
                    ))}
                </JoinColumnSelect>
              </FormControl>

              <JoinEqualsIcon>=</JoinEqualsIcon>

              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: '#71717a', fontSize: '12px' }}>
                  {canvasTables.find((t) => t.id === joinDialogState.targetTableId)?.name}
                </InputLabel>
                <JoinColumnSelect
                  value={joinDialogState.targetColumn}
                  label={canvasTables.find((t) => t.id === joinDialogState.targetTableId)?.name}
                  onChange={(e) =>
                    setJoinDialogState((s) =>
                      s ? { ...s, targetColumn: e.target.value as string } : null
                    )
                  }
                >
                  {canvasTables
                    .find((t) => t.id === joinDialogState.targetTableId)
                    ?.columns.map((col) => (
                      <MenuItem key={col.name} value={col.name}>
                        {col.name}
                      </MenuItem>
                    ))}
                </JoinColumnSelect>
              </FormControl>
            </JoinColumnSelector>
          </JoinDialogContent>

          <JoinDialogActions>
            <Button
              size="small"
              onClick={() => setJoinDialogState(null)}
              sx={{ color: '#71717a' }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSaveJoin}
              disabled={!joinDialogState.sourceColumn || !joinDialogState.targetColumn}
              sx={{
                backgroundColor: '#667eea',
                '&:hover': { backgroundColor: '#5a6fd6' },
              }}
            >
              {joinDialogState.isEdit ? 'Update' : 'Create'} Link
            </Button>
          </JoinDialogActions>
        </JoinDialog>
      )}
    </CanvasContainer>
  );
}
