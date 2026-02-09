import React, { useState, useMemo } from 'react';
import { InputAdornment, Tooltip, Skeleton } from '@mui/material';
import {
  Search as SearchIcon,
  Storage as TableIconMui,
  KeyboardArrowDown as ExpandIconMui,
  Add as AddIcon,
  VpnKey as KeyIcon,
  Link as ForeignKeyIcon,
  ViewColumn as ColumnIconMui,
  TableChart as NoTablesIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import {
  PanelContainer,
  PanelHeader,
  PanelTitle,
  TableCount,
  SearchContainer,
  SearchField,
  TableList,
  TableItem,
  TableHeader,
  TableIcon,
  TableName,
  ColumnCount,
  ExpandIcon,
  AddButton,
  ColumnList,
  ColumnItem,
  ColumnIcon,
  ColumnName,
  ColumnType,
  KeyBadge,
  EmptyState,
  EmptyIcon,
  EmptyText,
} from './TablesPanel.styles';
import type { SchemaTable, SchemaColumn, TablesPanelProps } from '../types';

interface TablesPanelInternalProps extends TablesPanelProps {
  tablesOnCanvas: string[]; // Table names that are already on canvas
}

export default function TablesPanel({
  tables,
  isLoading,
  onTableDragStart,
  onTableAdd,
  searchQuery,
  onSearchChange,
  tablesOnCanvas,
}: TablesPanelInternalProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  // Filter tables based on search query
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    const query = searchQuery.toLowerCase();
    return tables.filter(
      (table) =>
        table.name.toLowerCase().includes(query) ||
        table.columns.some((col) => col.name.toLowerCase().includes(query))
    );
  }, [tables, searchQuery]);

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, table: SchemaTable) => {
    e.dataTransfer.setData('application/json', JSON.stringify(table));
    e.dataTransfer.effectAllowed = 'copy';
    onTableDragStart(table);
  };

  const handleAddTable = (e: React.MouseEvent, table: SchemaTable) => {
    e.stopPropagation();
    onTableAdd(table);
  };

  const isTableOnCanvas = (tableName: string) => tablesOnCanvas.includes(tableName);

  // Loading skeleton
  if (isLoading) {
    return (
      <PanelContainer elevation={0}>
        <PanelHeader>
          <PanelTitle>Tables</PanelTitle>
        </PanelHeader>
        <SearchContainer>
          <Skeleton variant="rounded" height={40} />
        </SearchContainer>
        <TableList>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={44}
              sx={{ mb: 1, borderRadius: '8px' }}
            />
          ))}
        </TableList>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer elevation={0}>
      <PanelHeader>
        <PanelTitle>Tables</PanelTitle>
        <TableCount>{filteredTables.length} tables</TableCount>
      </PanelHeader>

      <SearchContainer>
        <SearchField
          fullWidth
          size="small"
          placeholder="Search tables or columns..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </SearchContainer>

      <TableList>
        {filteredTables.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <NoTablesIcon />
            </EmptyIcon>
            <EmptyText>
              {searchQuery
                ? 'No tables match your search'
                : 'No tables available'}
            </EmptyText>
          </EmptyState>
        ) : (
          filteredTables.map((table) => {
            const isExpanded = expandedTables.has(table.name);
            const onCanvas = isTableOnCanvas(table.name);

            return (
              <TableItem
                key={table.name}
                isExpanded={isExpanded}
                isOnCanvas={onCanvas}
                draggable={!onCanvas}
                onDragStart={(e) => !onCanvas && handleDragStart(e, table)}
              >
                <TableHeader onClick={() => toggleTable(table.name)}>
                  <TableIcon>
                    <TableIconMui />
                  </TableIcon>
                  <TableName>{table.name}</TableName>
                  <ColumnCount>{table.columns.length} cols</ColumnCount>
                  {!onCanvas && (
                    <Tooltip title="Add to canvas" arrow placement="top">
                      <AddButton
                        size="small"
                        onClick={(e) => handleAddTable(e, table)}
                      >
                        <AddIcon fontSize="small" />
                      </AddButton>
                    </Tooltip>
                  )}
                  <ExpandIcon isExpanded={isExpanded}>
                    <ExpandIconMui />
                  </ExpandIcon>
                </TableHeader>

                <ColumnList in={isExpanded}>
                  <div>
                    {table.columns.map((column) => (
                      <ColumnItem
                        key={column.name}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify({ table, column })
                          );
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                      >
                        <ColumnIcon
                          isPrimaryKey={column.isPrimaryKey}
                          isForeignKey={column.isForeignKey}
                        >
                          {column.isPrimaryKey ? (
                            <KeyIcon />
                          ) : column.isForeignKey ? (
                            <ForeignKeyIcon />
                          ) : (
                            <ColumnIconMui />
                          )}
                        </ColumnIcon>
                        <ColumnName>{column.name}</ColumnName>
                        {column.isPrimaryKey && <KeyBadge keyType="pk">PK</KeyBadge>}
                        {column.isForeignKey && <KeyBadge keyType="fk">FK</KeyBadge>}
                        <ColumnType>{column.type}</ColumnType>
                      </ColumnItem>
                    ))}
                  </div>
                </ColumnList>
              </TableItem>
            );
          })
        )}
      </TableList>
    </PanelContainer>
  );
}
