import React, { useCallback } from 'react';
import { Box, Tooltip } from '@mui/material';
import {
  ArrowUpward as AscIcon,
  ArrowDownward as DescIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  SortItem,
  SortDirection,
  LimitOffsetRow,
  LimitLabel,
  LimitInput,
  RemoveFieldButton,
  EmptySection,
  EmptySectionText,
  FieldInfo,
  FieldName,
  FieldTable,
} from '../QueryConfigPanel.styles';
import type { SortDirection as SortDir, SortingLimitSectionProps } from '../../types';

export default function SortingLimitSection({
  selectedFields,
  onFieldUpdate,
  limit,
  offset,
  onLimitChange,
  onOffsetChange,
}: SortingLimitSectionProps) {
  // Get fields that have sorting applied
  const sortedFields = selectedFields.filter((f) => f.sortOrder);

  const handleToggleSort = useCallback(
    (fieldId: string, currentSort: SortDir) => {
      let newSort: SortDir;
      if (!currentSort) {
        newSort = 'ASC';
      } else if (currentSort === 'ASC') {
        newSort = 'DESC';
      } else {
        newSort = null;
      }
      onFieldUpdate(fieldId, { sortOrder: newSort });
    },
    [onFieldUpdate]
  );

  const handleRemoveSort = useCallback(
    (fieldId: string) => {
      onFieldUpdate(fieldId, { sortOrder: null });
    },
    [onFieldUpdate]
  );

  return (
    <Box>
      {/* Sorting */}
      <Box sx={{ mb: 2 }}>
        {selectedFields.length === 0 ? (
          <EmptySection>
            <EmptySectionText>
              Select fields first to add sorting.
            </EmptySectionText>
          </EmptySection>
        ) : (
          <>
            {selectedFields.map((field) => (
              <SortItem key={field.id}>
                <FieldInfo sx={{ flex: 1 }}>
                  <FieldName>
                    {field.columnName}
                  </FieldName>
                  <FieldTable>{field.tableName}</FieldTable>
                </FieldInfo>

                <Tooltip title={field.sortOrder === 'ASC' ? 'Sorted A→Z' : field.sortOrder === 'DESC' ? 'Sorted Z→A' : 'Click to sort'}>
                  <SortDirection
                    isAsc={field.sortOrder === 'ASC'}
                    onClick={() => handleToggleSort(field.id, field.sortOrder)}
                    sx={{
                      opacity: field.sortOrder ? 1 : 0.4,
                      backgroundColor: field.sortOrder ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                    }}
                  >
                    {field.sortOrder === 'DESC' ? <DescIcon /> : <AscIcon />}
                  </SortDirection>
                </Tooltip>

                {field.sortOrder && (
                  <Tooltip title="Remove sort">
                    <RemoveFieldButton size="small" onClick={() => handleRemoveSort(field.id)}>
                      <CloseIcon />
                    </RemoveFieldButton>
                  </Tooltip>
                )}
              </SortItem>
            ))}
          </>
        )}
      </Box>

      {/* Limit & Offset */}
      <LimitOffsetRow>
        <LimitLabel>Max Results</LimitLabel>
        <LimitInput
          type="number"
          size="small"
          placeholder="All"
          value={limit !== null ? limit : ''}
          onChange={(e) => {
            const val = e.target.value;
            onLimitChange(val ? parseInt(val, 10) : null);
          }}
          inputProps={{ min: 0 }}
        />

        <LimitLabel>Skip First</LimitLabel>
        <LimitInput
          type="number"
          size="small"
          placeholder="0"
          value={offset !== null ? offset : ''}
          onChange={(e) => {
            const val = e.target.value;
            onOffsetChange(val ? parseInt(val, 10) : null);
          }}
          inputProps={{ min: 0 }}
        />
      </LimitOffsetRow>
    </Box>
  );
}
