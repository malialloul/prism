import React, { useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  AggregationChip,
  EmptySection,
  EmptySectionText,
} from '../QueryConfigPanel.styles';
import type { AggregationType, AggregationsSectionProps } from '../../types';
import { AGGREGATION_TYPES, getAggregationsForType } from '../../types';

// Get label for aggregation type
const getAggLabel = (agg: Exclude<AggregationType, null>): string => {
  return AGGREGATION_TYPES.find(a => a.value === agg)?.label || agg;
};

const FieldRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 10px',
  backgroundColor: '#0a0a0f',
  borderRadius: '6px',
  border: '1px solid #2a2a3a',
  marginBottom: '6px',
});

const FieldInfo = styled(Box)({
  minWidth: '120px',
});

const FieldName = styled(Typography)({
  fontSize: '12px',
  fontWeight: 500,
  color: '#e4e4e7',
});

const FieldTable = styled(Typography)({
  fontSize: '10px',
  color: '#52525b',
});

const AggregationChips = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  flex: 1,
});

export default function AggregationsSection({
  selectedFields,
  onFieldUpdate,
}: AggregationsSectionProps) {
  const handleAggregationToggle = useCallback(
    (fieldId: string, currentAgg: AggregationType, newAgg: AggregationType) => {
      onFieldUpdate(fieldId, {
        aggregation: currentAgg === newAgg ? null : newAgg,
      });
    },
    [onFieldUpdate]
  );

  if (selectedFields.length === 0) {
    return (
      <EmptySection>
        <EmptySectionText>
          Select fields first to apply calculations.
        </EmptySectionText>
      </EmptySection>
    );
  }

  return (
    <Box>
      {selectedFields.map((field) => {
        const availableAggs = getAggregationsForType(field.columnType);

        return (
          <FieldRow key={field.id}>
            <FieldInfo>
              <FieldName>{field.columnName}</FieldName>
              <FieldTable>{field.tableName}</FieldTable>
            </FieldInfo>

            <AggregationChips>
              {availableAggs.map((agg) => (
                <AggregationChip
                  key={agg}
                  label={getAggLabel(agg)}
                  size="small"
                  isSelected={field.aggregation === agg}
                  onClick={() => handleAggregationToggle(field.id, field.aggregation, agg)}
                />
              ))}
            </AggregationChips>
          </FieldRow>
        );
      })}
    </Box>
  );
}
