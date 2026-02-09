import React, { useCallback } from 'react';
import { Tooltip } from '@mui/material';
import {
  DragIndicator as DragIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  FieldList,
  FieldItem,
  FieldDragHandle,
  FieldInfo,
  FieldName,
  FieldTable,
  FieldAlias,
  FieldActions,
  RemoveFieldButton,
  EmptySection,
  EmptySectionText,
} from '../QueryConfigPanel.styles';
import type { SelectedField, SelectFieldsProps } from '../../types';

export default function SelectFields({
  canvasTables,
  selectedFields,
  onFieldUpdate,
  onFieldRemove,
}: SelectFieldsProps) {
  const handleAliasChange = useCallback(
    (fieldId: string, alias: string) => {
      onFieldUpdate(fieldId, { alias: alias || undefined });
    },
    [onFieldUpdate]
  );

  if (selectedFields.length === 0) {
    return (
      <EmptySection>
        <EmptySectionText>
          Click on columns in the canvas to select them for your query.
        </EmptySectionText>
      </EmptySection>
    );
  }

  return (
    <FieldList>
      {selectedFields.map((field) => (
        <FieldItem key={field.id}>
          <FieldDragHandle>
            <DragIcon />
          </FieldDragHandle>

          <FieldInfo>
            <FieldName>
              {field.aggregation
                ? `${field.aggregation}(${field.columnName})`
                : field.columnName}
            </FieldName>
            <FieldTable>{field.tableName}</FieldTable>
          </FieldInfo>

          <FieldAlias
            size="small"
            placeholder="Alias"
            value={field.alias || ''}
            onChange={(e) => handleAliasChange(field.id, e.target.value)}
          />

          <FieldActions>
            <Tooltip title="Remove">
              <RemoveFieldButton size="small" onClick={() => onFieldRemove(field.id)}>
                <CloseIcon />
              </RemoveFieldButton>
            </Tooltip>
          </FieldActions>
        </FieldItem>
      ))}
    </FieldList>
  );
}
