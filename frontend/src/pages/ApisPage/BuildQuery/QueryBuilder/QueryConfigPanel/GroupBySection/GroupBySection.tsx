import React, { useCallback, useMemo } from 'react';
import { Box, MenuItem, FormControl, Tooltip } from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Lightbulb as SuggestIcon,
} from '@mui/icons-material';
import {
  GroupByItem,
  GroupByText,
  GroupByRemove,
  SuggestedGroupBy,
  SuggestedText,
  FilterSelect,
  AddButton,
  EmptySection,
  EmptySectionText,
} from '../QueryConfigPanel.styles';
import type { GroupByField, GroupBySectionProps } from '../../types';

export default function GroupBySection({
  canvasTables,
  selectedFields,
  groupByFields,
  onGroupByAdd,
  onGroupByRemove,
  suggestedGroupBy,
}: GroupBySectionProps) {
  // Get all columns across all tables
  const allColumns = useMemo(() => 
    canvasTables.flatMap((table) =>
      table.columns.map((col) => ({
        tableId: table.id,
        tableName: table.name,
        columnName: col.name,
      }))
    ),
    [canvasTables]
  );

  // Check if a column is already in group by
  const isInGroupBy = useCallback(
    (tableId: string, columnName: string) => {
      return groupByFields.some(
        (g) => g.tableId === tableId && g.columnName === columnName
      );
    },
    [groupByFields]
  );

  // Available columns for group by (not already added)
  const availableColumns = useMemo(() =>
    allColumns.filter((col) => !isInGroupBy(col.tableId, col.columnName)),
    [allColumns, isInGroupBy]
  );

  const handleAddGroupBy = useCallback(
    (columnKey?: string) => {
      let col;
      if (columnKey) {
        const [tableId, columnName] = columnKey.split('.');
        col = allColumns.find(
          (c) => c.tableId === tableId && c.columnName === columnName
        );
      } else if (availableColumns.length > 0) {
        col = availableColumns[0];
      }

      if (col) {
        onGroupByAdd({
          tableId: col.tableId,
          tableName: col.tableName,
          columnName: col.columnName,
        });
      }
    },
    [allColumns, availableColumns, onGroupByAdd]
  );

  const handleAddSuggested = useCallback(
    (suggested: GroupByField) => {
      if (!isInGroupBy(suggested.tableId, suggested.columnName)) {
        onGroupByAdd({
          tableId: suggested.tableId,
          tableName: suggested.tableName,
          columnName: suggested.columnName,
        });
      }
    },
    [isInGroupBy, onGroupByAdd]
  );

  // Check if there are aggregations
  const hasAggregations = selectedFields.some((f) => f.aggregation);

  if (canvasTables.length === 0) {
    return (
      <EmptySection>
        <EmptySectionText>
          Add tables to the canvas to create group by clauses.
        </EmptySectionText>
      </EmptySection>
    );
  }

  return (
    <Box>
      {/* Current group by fields */}
      <Box sx={{ mb: groupByFields.length > 0 ? 2 : 0 }}>
        {groupByFields.map((field) => (
          <GroupByItem key={field.id}>
            <GroupByText>
              {field.tableName}.{field.columnName}
            </GroupByText>
            <Tooltip title="Remove">
              <GroupByRemove size="small" onClick={() => onGroupByRemove(field.id)}>
                <CloseIcon />
              </GroupByRemove>
            </Tooltip>
          </GroupByItem>
        ))}
      </Box>

      {/* Suggested group by (when aggregations exist) */}
      {hasAggregations && suggestedGroupBy.length > 0 && (
        <SuggestedGroupBy>
          <SuggestedText>
            <SuggestIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            Suggested GROUP BY (non-aggregated fields):
          </SuggestedText>
          <Box>
            {suggestedGroupBy
              .filter((s) => !isInGroupBy(s.tableId, s.columnName))
              .map((suggested, idx) => (
                <GroupByItem
                  key={`${suggested.tableId}.${suggested.columnName}`}
                  sx={{ cursor: 'pointer', opacity: 0.7, '&:hover': { opacity: 1 } }}
                  onClick={() => handleAddSuggested(suggested)}
                >
                  <GroupByText>
                    + {suggested.tableName}.{suggested.columnName}
                  </GroupByText>
                </GroupByItem>
              ))}
          </Box>
        </SuggestedGroupBy>
      )}

      {/* Add new group by */}
      {availableColumns.length > 0 && (
        <AddButton onClick={() => handleAddGroupBy()}>
          <AddIcon />
          Add Group By
        </AddButton>
      )}
    </Box>
  );
}
