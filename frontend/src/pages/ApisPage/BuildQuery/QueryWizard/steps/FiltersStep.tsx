import React, { useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TuneIcon from '@mui/icons-material/Tune';
import CodeIcon from '@mui/icons-material/Code';

import {
  SchemaTable,
  SelectedTable,
  TableJoin,
  SelectedField,
  FilterCondition,
  FilterOperator,
  FilterValueType,
  getJoinedTables,
  generateId,
  getOperatorsForType,
  operatorNeedsNoValue,
  operatorNeedsMultipleValues,
  operatorNeedsTwoValues,
  generateParameterName,
} from '../types';
import {
  StepContent,
  StepHeader,
  StepTitle,
  StepDescription,
  StepInstructions,
  ListContainer,
  RemoveButton,
  StyledSelect,
  FormField,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText,
  Badge,
} from '../QueryWizard.styles';
import { alpha, styled } from '@mui/material/styles';

// Additional styles for this step
const FilterCard = styled(Box)({
  padding: '16px',
  backgroundColor: '#12121a',
  borderRadius: '10px',
  border: '1px solid #2a2a3a',
});

const FilterRow = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  flexWrap: 'wrap',
});

const FilterField = styled(FormControl)({
  minWidth: '180px',
  flex: 1,
});

const LogicToggle = styled(ToggleButtonGroup)({
  '& .MuiToggleButton-root': {
    padding: '6px 16px',
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'none',
    color: '#71717a',
    borderColor: '#2a2a3a',
    '&.Mui-selected': {
      backgroundColor: alpha('#667eea', 0.2),
      color: '#a5b4fc',
      borderColor: '#667eea',
      '&:hover': {
        backgroundColor: alpha('#667eea', 0.3),
      },
    },
    '&:hover': {
      backgroundColor: alpha('#ffffff', 0.05),
    },
  },
});

const ValueTypeToggle = styled(ToggleButtonGroup)({
  '& .MuiToggleButton-root': {
    padding: '4px 10px',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'none',
    color: '#71717a',
    borderColor: '#2a2a3a',
    '&.Mui-selected': {
      backgroundColor: alpha('#22c55e', 0.2),
      color: '#86efac',
      borderColor: '#22c55e',
      '&:hover': {
        backgroundColor: alpha('#22c55e', 0.3),
      },
    },
    '&:hover': {
      backgroundColor: alpha('#ffffff', 0.05),
    },
  },
});

const AddFilterRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  backgroundColor: '#0a0a0f',
  borderRadius: '10px',
  border: '1px dashed #2a2a3a',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: '#71717a',
  '&:hover': {
    borderColor: '#667eea',
    backgroundColor: alpha('#667eea', 0.05),
    color: '#a5b4fc',
  },
});

const MultiValueContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flex: 1,
  minWidth: '200px',
});

const MultiValueChips = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  padding: '8px',
  backgroundColor: '#0a0a0f',
  borderRadius: '6px',
  minHeight: '36px',
});

const BetweenContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: 1,
  minWidth: '200px',
});

const ParameterHint = styled(Box)({
  fontSize: '0.7rem',
  color: '#667eea',
  padding: '4px 8px',
  backgroundColor: alpha('#667eea', 0.1),
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

interface FiltersStepProps {
  tables: SchemaTable[];
  baseTable: SelectedTable;
  joins: TableJoin[];
  selectedFields: SelectedField[];
  filters: FilterCondition[];
  filterLogic: 'AND' | 'OR';
  onFiltersChange: (filters: FilterCondition[]) => void;
  onFilterLogicChange: (logic: 'AND' | 'OR') => void;
}

export const FiltersStep: React.FC<FiltersStepProps> = ({
  tables,
  baseTable,
  joins,
  filters,
  filterLogic,
  onFiltersChange,
  onFilterLogicChange,
}) => {
  // Get all available columns for filtering
  const availableColumns = useMemo(() => {
    const tableNames = getJoinedTables(baseTable, joins, tables);
    const columns: Array<{ table: string; column: string; type: string }> = [];

    tableNames.forEach((tableName) => {
      const table = tables.find((t) => t.name === tableName);
      if (table) {
        table.columns.forEach((col) => {
          columns.push({
            table: tableName,
            column: col.name,
            type: col.type,
          });
        });
      }
    });

    return columns;
  }, [tables, baseTable, joins]);

  // Get columns that are not already used in filters (for adding new filters)
  const unusedColumns = useMemo(() => {
    const usedKeys = new Set(filters.map((f) => `${f.table}.${f.column}`));
    return availableColumns.filter((col) => !usedKeys.has(`${col.table}.${col.column}`));
  }, [availableColumns, filters]);

  const getColumnType = (tableName: string, columnName: string): string => {
    const col = availableColumns.find(
      (c) => c.table === tableName && c.column === columnName
    );
    return col?.type || 'text';
  };

  const handleAddFilter = () => {
    // Use first unused column, or first available if all are used
    const firstCol = unusedColumns[0] || availableColumns[0];
    if (!firstCol) return;

    const colType = getColumnType(firstCol.table, firstCol.column);
    const operators = getOperatorsForType(colType);

    const newFilter: FilterCondition = {
      id: generateId(),
      table: firstCol.table,
      column: firstCol.column,
      columnType: colType,
      operator: operators[0]?.value || '=',
      valueType: 'fixed',
      value: '',
      values: [],
      value2: '',
      parameterName: generateParameterName(firstCol.table, firstCol.column),
    };
    onFiltersChange([...filters, newFilter]);
  };

  const handleRemoveFilter = (filterId: string) => {
    onFiltersChange(filters.filter((f) => f.id !== filterId));
  };

  const handleFilterChange = (
    filterId: string,
    updates: Partial<FilterCondition>
  ) => {
    onFiltersChange(
      filters.map((f) => {
        if (f.id !== filterId) return f;

        // Special handling for column change
        if ('column' in updates && updates.column) {
          const [table, column] = (updates.column as string).split('.');
          const colType = getColumnType(table, column);
          const validOperators = getOperatorsForType(colType);
          const currentOpValid = validOperators.some((op) => op.value === f.operator);
          
          return {
            ...f,
            table,
            column,
            columnType: colType,
            operator: currentOpValid ? f.operator : validOperators[0].value,
            value: '',
            values: [],
            value2: '',
            parameterName: generateParameterName(table, column),
          };
        }

        // When operator changes, reset value fields if incompatible
        if ('operator' in updates) {
          const newOp = updates.operator as FilterOperator;
          return {
            ...f,
            operator: newOp,
            value: operatorNeedsNoValue(newOp) ? '' : f.value,
            values: operatorNeedsMultipleValues(newOp) ? f.values : [],
            value2: operatorNeedsTwoValues(newOp) ? f.value2 : '',
          };
        }

        return { ...f, ...updates };
      })
    );
  };

  const handleAddMultiValue = (filterId: string, newValue: string) => {
    if (!newValue.trim()) return;
    
    onFiltersChange(
      filters.map((f) => {
        if (f.id !== filterId) return f;
        if (f.values.includes(newValue.trim())) return f;
        return { ...f, values: [...f.values, newValue.trim()] };
      })
    );
  };

  const handleRemoveMultiValue = (filterId: string, valueToRemove: string) => {
    onFiltersChange(
      filters.map((f) => {
        if (f.id !== filterId) return f;
        return { ...f, values: f.values.filter((v) => v !== valueToRemove) };
      })
    );
  };

  // Get available columns for a specific filter (current + unused)
  const getAvailableColumnsForFilter = (filter: FilterCondition) => {
    const currentKey = `${filter.table}.${filter.column}`;
    const usedKeys = new Set(
      filters
        .filter((f) => f.id !== filter.id)
        .map((f) => `${f.table}.${f.column}`)
    );
    return availableColumns.filter(
      (col) => !usedKeys.has(`${col.table}.${col.column}`) || `${col.table}.${col.column}` === currentKey
    );
  };

  const renderValueInput = (filter: FilterCondition, colType: string) => {
    const isParameter = filter.valueType === 'parameter';
    const needsMultiple = operatorNeedsMultipleValues(filter.operator);
    const needsTwo = operatorNeedsTwoValues(filter.operator);
    const needsNone = operatorNeedsNoValue(filter.operator);

    if (needsNone) {
      return null;
    }

    // Show parameter name input for parameter mode - no default values needed
    if (isParameter) {
      return (
        <Box sx={{ flex: 1, minWidth: '200px' }}>
          <FormField
            size="small"
            label="Parameter Name"
            value={filter.parameterName || ''}
            onChange={(e) => handleFilterChange(filter.id, { parameterName: e.target.value })}
            placeholder="Enter parameter name..."
            sx={{ flex: 1 }}
          />
          <ParameterHint>
            <CodeIcon sx={{ fontSize: '0.8rem' }} />
            {needsTwo ? (
              <span>Runtime params: {filter.parameterName || 'param'}_from, {filter.parameterName || 'param'}_to</span>
            ) : needsMultiple ? (
              <span>Provide comma-separated values at runtime</span>
            ) : (
              <span>Value will be provided at runtime in the Review step</span>
            )}
          </ParameterHint>
        </Box>
      );
    }

    // BETWEEN - two values
    if (needsTwo) {
      return (
        <BetweenContainer>
          <FormField
            size="small"
            label="From"
            value={filter.value}
            onChange={(e) => handleFilterChange(filter.id, { value: e.target.value })}
            placeholder="Start..."
            sx={{ flex: 1 }}
          />
          <Box sx={{ color: '#71717a', fontSize: '0.8rem' }}>and</Box>
          <FormField
            size="small"
            label="To"
            value={filter.value2}
            onChange={(e) => handleFilterChange(filter.id, { value2: e.target.value })}
            placeholder="End..."
            sx={{ flex: 1 }}
          />
        </BetweenContainer>
      );
    }

    // IN / NOT IN - multiple values
    if (needsMultiple) {
      return (
        <MultiValueContainer>
          <Box sx={{ display: 'flex', gap: '8px' }}>
            <FormField
              size="small"
              label="Add value"
              value={filter.value}
              onChange={(e) => handleFilterChange(filter.id, { value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMultiValue(filter.id, filter.value);
                  handleFilterChange(filter.id, { value: '' });
                }
              }}
              placeholder="Type and press Enter..."
              sx={{ flex: 1 }}
            />
            <IconButton
              size="small"
              onClick={() => {
                handleAddMultiValue(filter.id, filter.value);
                handleFilterChange(filter.id, { value: '' });
              }}
              sx={{ 
                color: '#667eea',
                border: '1px solid #2a2a3a',
                borderRadius: '6px',
                '&:hover': { backgroundColor: alpha('#667eea', 0.1) },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
          {filter.values.length > 0 && (
            <MultiValueChips>
              {filter.values.map((val, idx) => (
                <Chip
                  key={idx}
                  label={val}
                  size="small"
                  onDelete={() => handleRemoveMultiValue(filter.id, val)}
                  sx={{
                    backgroundColor: alpha('#667eea', 0.2),
                    color: '#a5b4fc',
                    '& .MuiChip-deleteIcon': {
                      color: '#a5b4fc',
                      '&:hover': { color: '#ef4444' },
                    },
                  }}
                />
              ))}
            </MultiValueChips>
          )}
          {filter.values.length === 0 && (
            <Box sx={{ fontSize: '0.75rem', color: '#71717a' }}>
              No values added. Type a value and press Enter or click +
            </Box>
          )}
        </MultiValueContainer>
      );
    }

    // Single value input
    return (
      <FormField
        size="small"
        label="Value"
        value={filter.value}
        onChange={(e) => handleFilterChange(filter.id, { value: e.target.value })}
        placeholder="Enter value..."
        sx={{ flex: 1, minWidth: '150px' }}
      />
    );
  };

  return (
    <StepContent>
      <StepHeader>
        <StepTitle>Filter Results</StepTitle>
        <StepDescription>
          Add conditions to narrow down your results. Only rows matching your filters will be returned.
        </StepDescription>
      </StepHeader>

      <StepInstructions>
        <LightbulbIcon fontSize="small" />
        <span>
          <strong>Tip:</strong> Use <strong>Fixed Value</strong> for static filters or{' '}
          <strong>Parameter</strong> to make the filter dynamic when executing the query.
        </span>
      </StepInstructions>

      {filters.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#a1a1aa' }}>
              Conditions ({filters.length})
            </Box>
            {filters.length > 1 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ fontSize: '0.8rem', color: '#71717a' }}>Match:</Box>
                <LogicToggle
                  value={filterLogic}
                  exclusive
                  onChange={(_, val) => val && onFilterLogicChange(val)}
                  size="small"
                >
                  <ToggleButton value="AND">All conditions</ToggleButton>
                  <ToggleButton value="OR">Any condition</ToggleButton>
                </LogicToggle>
              </Box>
            )}
          </Box>

          <ListContainer sx={{ gap: '12px' }}>
            {filters.map((filter, index) => {
              const colType = getColumnType(filter.table, filter.column);
              const operators = getOperatorsForType(colType);
              const availableCols = getAvailableColumnsForFilter(filter);

              return (
                <FilterCard key={filter.id}>
                  {index > 0 && (
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                      <Badge
                        colorVariant={filterLogic === 'AND' ? 'primary' : 'warning'}
                        label={filterLogic}
                      />
                    </Box>
                  )}
                  
                  {/* Value Type Toggle */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mb: 2 }}>
                    {filter.valueType === 'parameter' && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filter.isRequired ?? true}
                            onChange={(e) => handleFilterChange(filter.id, { isRequired: e.target.checked })}
                            size="small"
                            sx={{
                              color: '#667eea',
                              '&.Mui-checked': { color: '#667eea' },
                            }}
                          />
                        }
                        label="Required"
                        sx={{ 
                          color: '#a1a1aa', 
                          '& .MuiTypography-root': { fontSize: '0.8rem' },
                          mr: 0,
                        }}
                      />
                    )}
                    <ValueTypeToggle
                      value={filter.valueType}
                      exclusive
                      onChange={(_, val) => val && handleFilterChange(filter.id, { valueType: val as FilterValueType })}
                      size="small"
                    >
                      <ToggleButton value="fixed">
                        <TuneIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                        Fixed Value
                      </ToggleButton>
                      <ToggleButton value="parameter">
                        <CodeIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                        Parameter
                      </ToggleButton>
                    </ValueTypeToggle>
                  </Box>

                  <FilterRow>
                    <FilterField size="small">
                      <InputLabel sx={{ color: '#71717a' }}>Column</InputLabel>
                      <StyledSelect
                        value={`${filter.table}.${filter.column}`}
                        onChange={(e) =>
                          handleFilterChange(filter.id, { column: e.target.value as string })
                        }
                        label="Column"
                      >
                        {availableCols.map((col) => (
                          <MenuItem key={`${col.table}.${col.column}`} value={`${col.table}.${col.column}`}>
                            {col.table}.{col.column}
                            <Box component="span" sx={{ ml: 1, color: '#71717a', fontSize: '0.7rem' }}>
                              ({col.type})
                            </Box>
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FilterField>

                    <FilterField size="small" sx={{ minWidth: '150px', flex: 'none' }}>
                      <InputLabel sx={{ color: '#71717a' }}>Condition</InputLabel>
                      <StyledSelect
                        value={filter.operator}
                        onChange={(e) =>
                          handleFilterChange(filter.id, { operator: e.target.value as FilterOperator })
                        }
                        label="Condition"
                      >
                        {operators.map((op) => (
                          <MenuItem key={op.value} value={op.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ color: '#667eea', fontWeight: 600, minWidth: '20px' }}>{op.symbol}</Box>
                              {op.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FilterField>

                    {renderValueInput(filter, colType)}

                    <RemoveButton
                      onClick={() => handleRemoveFilter(filter.id)}
                      sx={{ mt: '8px' }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </RemoveButton>
                  </FilterRow>
                </FilterCard>
              );
            })}
          </ListContainer>
        </Box>
      )}

      {unusedColumns.length > 0 && (
        <AddFilterRow onClick={handleAddFilter}>
          <AddIcon sx={{ mr: 1 }} />
          <span>Add a filter condition</span>
        </AddFilterRow>
      )}

      {unusedColumns.length === 0 && filters.length > 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          padding: '16px', 
          color: '#71717a',
          fontSize: '0.85rem',
          backgroundColor: alpha('#667eea', 0.05),
          borderRadius: '8px',
        }}>
          All columns have been used in filters.
        </Box>
      )}

      {filters.length === 0 && (
        <EmptyState sx={{ mt: 4 }}>
          <EmptyIcon>
            <FilterAltIcon />
          </EmptyIcon>
          <EmptyTitle>No Filters Added</EmptyTitle>
          <EmptyText>
            Without filters, your query will return all rows from the selected tables.
            Add filters above to narrow down your results.
          </EmptyText>
        </EmptyState>
      )}
    </StepContent>
  );
};

export default FiltersStep;
