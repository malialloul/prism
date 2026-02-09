import React, { useState, useCallback } from 'react';
import { MenuItem, Tooltip, FormControl, InputLabel, Box } from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Code as ParamIcon,
} from '@mui/icons-material';
import {
  FilterRow,
  FilterLogic,
  FilterSelect,
  FilterInput,
  ParameterCheckbox,
  RemoveFieldButton,
  AddButton,
  EmptySection,
  EmptySectionText,
} from '../QueryConfigPanel.styles';
import type { FilterCondition, FilterOperator, FiltersSectionProps, CanvasTable } from '../../types';
import { FILTER_OPERATORS, getOperatorsForType, generateId } from '../../types';

export default function FiltersSection({
  canvasTables,
  filters,
  onFilterAdd,
  onFilterUpdate,
  onFilterRemove,
}: FiltersSectionProps) {
  const [newFilter, setNewFilter] = useState<{
    tableId: string;
    columnName: string;
  } | null>(null);

  // Get all columns across all tables
  const allColumns = canvasTables.flatMap((table) =>
    table.columns.map((col) => ({
      tableId: table.id,
      tableName: table.name,
      columnName: col.name,
      columnType: col.type,
    }))
  );

  const handleAddFilter = useCallback(() => {
    if (allColumns.length === 0) return;

    const firstCol = allColumns[0];
    const operators = getOperatorsForType(firstCol.columnType);

    onFilterAdd({
      tableId: firstCol.tableId,
      tableName: firstCol.tableName,
      columnName: firstCol.columnName,
      columnType: firstCol.columnType,
      operator: operators[0] || 'EQUALS',
      value: '',
      logic: filters.length > 0 ? 'AND' : 'AND',
    });
  }, [allColumns, filters.length, onFilterAdd]);

  const handleColumnChange = useCallback(
    (filterId: string, columnKey: string) => {
      const [tableId, columnName] = columnKey.split('.');
      const column = allColumns.find(
        (c) => c.tableId === tableId && c.columnName === columnName
      );
      if (column) {
        const operators = getOperatorsForType(column.columnType);
        onFilterUpdate(filterId, {
          tableId: column.tableId,
          tableName: column.tableName,
          columnName: column.columnName,
          columnType: column.columnType,
          operator: operators[0] || 'EQUALS',
        });
      }
    },
    [allColumns, onFilterUpdate]
  );

  const toggleLogic = useCallback(
    (filterId: string, currentLogic: string) => {
      onFilterUpdate(filterId, {
        logic: currentLogic === 'AND' ? 'OR' : 'AND',
      });
    },
    [onFilterUpdate]
  );

  const toggleParameter = useCallback(
    (filterId: string, isParam: boolean, columnName: string) => {
      onFilterUpdate(filterId, {
        isParameter: !isParam,
        parameterName: !isParam ? columnName.toLowerCase().replace(/\s+/g, '_') : undefined,
      });
    },
    [onFilterUpdate]
  );

  if (canvasTables.length === 0) {
    return (
      <EmptySection>
        <EmptySectionText>
          Add tables to the canvas to create filters.
        </EmptySectionText>
      </EmptySection>
    );
  }

  return (
    <Box>
      {filters.map((filter, index) => {
        const operators = getOperatorsForType(filter.columnType);
        const operatorInfo = FILTER_OPERATORS.find((op) => op.value === filter.operator);
        const needsValue = !['IS_NULL', 'IS_NOT_NULL'].includes(filter.operator);

        return (
          <FilterRow key={filter.id}>
            {index > 0 && (
              <FilterLogic
                isActive={filter.logic === 'OR'}
                onClick={() => toggleLogic(filter.id, filter.logic)}
              >
                {filter.logic}
              </FilterLogic>
            )}

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <FilterSelect
                value={`${filter.tableId}.${filter.columnName}`}
                onChange={(e) => handleColumnChange(filter.id, e.target.value as string)}
                displayEmpty
              >
                {allColumns.map((col) => (
                  <MenuItem
                    key={`${col.tableId}.${col.columnName}`}
                    value={`${col.tableId}.${col.columnName}`}
                  >
                    {col.tableName}.{col.columnName}
                  </MenuItem>
                ))}
              </FilterSelect>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <FilterSelect
                value={filter.operator}
                onChange={(e) =>
                  onFilterUpdate(filter.id, { operator: e.target.value as FilterOperator })
                }
              >
                {operators.map((op) => {
                  const info = FILTER_OPERATORS.find((o) => o.value === op);
                  return (
                    <MenuItem key={op} value={op}>
                      {info?.label || op}
                    </MenuItem>
                  );
                })}
              </FilterSelect>
            </FormControl>

            {needsValue && (
              <FilterInput
                size="small"
                placeholder={filter.isParameter ? `@${filter.parameterName || 'param'}` : 'Value'}
                value={filter.isParameter ? '' : (filter.value as string) || ''}
                onChange={(e) => onFilterUpdate(filter.id, { value: e.target.value })}
                disabled={filter.isParameter}
              />
            )}

            <Tooltip title={filter.isParameter ? 'Remove API parameter' : 'Make API parameter'}>
              <ParameterCheckbox
                isChecked={filter.isParameter}
                onClick={() =>
                  toggleParameter(filter.id, filter.isParameter || false, filter.columnName)
                }
              >
                <ParamIcon sx={{ fontSize: 12 }} />
                {filter.isParameter ? 'Param' : ''}
              </ParameterCheckbox>
            </Tooltip>

            <Tooltip title="Remove">
              <RemoveFieldButton size="small" onClick={() => onFilterRemove(filter.id)}>
                <CloseIcon />
              </RemoveFieldButton>
            </Tooltip>
          </FilterRow>
        );
      })}

      <AddButton onClick={handleAddFilter}>
        <AddIcon />
        Add Filter
      </AddButton>
    </Box>
  );
}
