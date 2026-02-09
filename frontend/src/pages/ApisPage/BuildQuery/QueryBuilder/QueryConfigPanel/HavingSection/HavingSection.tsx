import React, { useCallback } from 'react';
import { Box, MenuItem, FormControl, Tooltip } from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  FilterRow,
  FilterSelect,
  FilterInput,
  RemoveFieldButton,
  AddButton,
  EmptySection,
  EmptySectionText,
  DisabledOverlay,
  DisabledText,
} from '../QueryConfigPanel.styles';
import type { HavingCondition, FilterOperator, HavingSectionProps, AggregationType } from '../../types';
import { FILTER_OPERATORS, AGGREGATION_TYPES, generateId } from '../../types';

export default function HavingSection({
  selectedFields,
  havingConditions,
  onHavingAdd,
  onHavingUpdate,
  onHavingRemove,
  disabled,
}: HavingSectionProps) {
  // Get fields with aggregations
  const aggregatedFields = selectedFields.filter((f) => f.aggregation);

  const handleAddHaving = useCallback(() => {
    if (aggregatedFields.length === 0) return;

    const firstField = aggregatedFields[0];
    onHavingAdd({
      aggregation: firstField.aggregation as Exclude<AggregationType, null>,
      tableId: firstField.tableId,
      tableName: firstField.tableName,
      columnName: firstField.columnName,
      operator: 'GREATER_THAN',
      value: 0,
    });
  }, [aggregatedFields, onHavingAdd]);

  const handleFieldChange = useCallback(
    (conditionId: string, fieldId: string) => {
      const field = aggregatedFields.find((f) => f.id === fieldId);
      if (field) {
        onHavingUpdate(conditionId, {
          aggregation: field.aggregation as Exclude<AggregationType, null>,
          tableId: field.tableId,
          tableName: field.tableName,
          columnName: field.columnName,
        });
      }
    },
    [aggregatedFields, onHavingUpdate]
  );

  // Content when disabled
  if (disabled) {
    return (
      <Box sx={{ position: 'relative', minHeight: 60 }}>
        <DisabledOverlay>
          <DisabledText>
            Add aggregations to enable HAVING clause
          </DisabledText>
        </DisabledOverlay>
      </Box>
    );
  }

  if (aggregatedFields.length === 0) {
    return (
      <EmptySection>
        <EmptySectionText>
          Apply aggregations to fields first to use HAVING.
        </EmptySectionText>
      </EmptySection>
    );
  }

  return (
    <Box>
      {havingConditions.map((condition) => (
        <FilterRow key={condition.id}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <FilterSelect
              value={aggregatedFields.find(
                (f) =>
                  f.aggregation === condition.aggregation &&
                  f.tableId === condition.tableId &&
                  f.columnName === condition.columnName
              )?.id || ''}
              onChange={(e) => handleFieldChange(condition.id, e.target.value as string)}
            >
              {aggregatedFields.map((field) => (
                <MenuItem key={field.id} value={field.id}>
                  {field.aggregation}({field.tableName}.{field.columnName})
                </MenuItem>
              ))}
            </FilterSelect>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <FilterSelect
              value={condition.operator}
              onChange={(e) =>
                onHavingUpdate(condition.id, { operator: e.target.value as FilterOperator })
              }
            >
              {FILTER_OPERATORS
                .filter((op) => ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_OR_EQUAL', 'LESS_OR_EQUAL'].includes(op.value))
                .map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
            </FilterSelect>
          </FormControl>

          <FilterInput
            size="small"
            type="number"
            placeholder="Value"
            value={condition.value}
            onChange={(e) =>
              onHavingUpdate(condition.id, { value: parseFloat(e.target.value) || 0 })
            }
          />

          <Tooltip title="Remove">
            <RemoveFieldButton size="small" onClick={() => onHavingRemove(condition.id)}>
              <CloseIcon />
            </RemoveFieldButton>
          </Tooltip>
        </FilterRow>
      ))}

      <AddButton onClick={handleAddHaving}>
        <AddIcon />
        Add HAVING Condition
      </AddButton>
    </Box>
  );
}
