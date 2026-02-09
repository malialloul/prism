import React, { useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Switch,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TuneIcon from '@mui/icons-material/Tune';

import {
  SchemaTable,
  SelectedTable,
  TableJoin,
  SelectedField,
  AggregateField,
  GroupByField,
  SortField,
  SortDirection,
  PaginationSettings,
  getJoinedTables,
  generateId,
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

// Additional styles
const SortCard = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  backgroundColor: '#12121a',
  borderRadius: '10px',
  border: '1px solid #2a2a3a',
});

const SortHandle = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  color: '#52525b',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
});

const SortNumber = styled(Box)({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: '#2a2a3a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#a1a1aa',
});

const DirectionToggle = styled(ToggleButtonGroup)({
  '& .MuiToggleButton-root': {
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontWeight: 500,
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

const AddSortButton = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
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

const LimitSection = styled(Box)({
  marginTop: '32px',
  padding: '16px',
  backgroundColor: '#12121a',
  borderRadius: '10px',
  border: '1px solid #2a2a3a',
});

interface SortingStepProps {
  tables: SchemaTable[];
  baseTable: SelectedTable;
  joins: TableJoin[];
  selectedFields: SelectedField[];
  groupByFields: GroupByField[];
  aggregates: AggregateField[];
  sortFields: SortField[];
  limit: number | null;
  offset: number | null;
  pagination: PaginationSettings;
  onSortFieldsChange: (fields: SortField[]) => void;
  onLimitChange: (limit: number | null) => void;
  onOffsetChange: (offset: number | null) => void;
  onPaginationChange: (pagination: PaginationSettings) => void;
}

export const SortingStep: React.FC<SortingStepProps> = ({
  tables,
  baseTable,
  joins,
  selectedFields,
  groupByFields,
  aggregates,
  sortFields,
  limit,
  offset,
  pagination,
  onSortFieldsChange,
  onLimitChange,
  onOffsetChange,
  onPaginationChange,
}) => {
  // Get currently selected sort keys to prevent duplicates
  const selectedSortKeys = useMemo(() => {
    return new Set(
      sortFields.map((s) =>
        s.aggregateId ? `agg:${s.aggregateId}` : `${s.table}.${s.column}`
      )
    );
  }, [sortFields]);

  // Check if aggregation is active
  const aggregationActive = groupByFields.length > 0 || aggregates.length > 0;

  // Get all available columns for sorting
  // When aggregation is active, only GROUP BY columns and aggregates are valid
  const availableColumns = useMemo(() => {
    const columns: Array<{ value: string; label: string; type: 'column' | 'aggregate' }> = [];

    if (aggregationActive) {
      // When aggregation is active, only allow:
      // 1. Columns in GROUP BY
      // 2. Aggregate expressions
      groupByFields.forEach((g) => {
        columns.push({
          value: `${g.table}.${g.column}`,
          label: `${g.table}.${g.column}`,
          type: 'column',
        });
      });
    } else {
      // No aggregation - allow all columns from joined tables
      const tableNames = getJoinedTables(baseTable, joins, tables);
      tableNames.forEach((tableName) => {
        const table = tables.find((t) => t.name === tableName);
        if (table) {
          table.columns.forEach((col) => {
            columns.push({
              value: `${tableName}.${col.name}`,
              label: `${tableName}.${col.name}`,
              type: 'column',
            });
          });
        }
      });
    }

    // Aggregate fields are always valid when they exist
    aggregates.forEach((agg) => {
      columns.push({
        value: `agg:${agg.id}`,
        label: agg.alias || `${agg.function}(${agg.column})`,
        type: 'aggregate',
      });
    });

    return columns;
  }, [tables, baseTable, joins, groupByFields, aggregates, aggregationActive]);

  // Filter out already selected columns for adding new sorts
  const availableForNewSort = useMemo(() => {
    return availableColumns.filter((col) => !selectedSortKeys.has(col.value));
  }, [availableColumns, selectedSortKeys]);

  const handleAddSort = () => {
    const firstAvailable = availableForNewSort[0];
    if (!firstAvailable) return;

    let newSort: SortField;
    if (firstAvailable.type === 'aggregate') {
      const aggId = firstAvailable.value.replace('agg:', '');
      newSort = {
        id: generateId(),
        aggregateId: aggId,
        direction: 'ASC',
      };
    } else {
      const [table, column] = firstAvailable.value.split('.');
      newSort = {
        id: generateId(),
        table,
        column,
        direction: 'ASC',
      };
    }
    onSortFieldsChange([...sortFields, newSort]);
  };

  const handleRemoveSort = (sortId: string) => {
    onSortFieldsChange(sortFields.filter((s) => s.id !== sortId));
  };

  const handleUpdateSort = (sortId: string, value: string) => {
    onSortFieldsChange(
      sortFields.map((s) => {
        if (s.id !== sortId) return s;

        if (value.startsWith('agg:')) {
          return {
            id: s.id,
            aggregateId: value.replace('agg:', ''),
            direction: s.direction,
          };
        } else {
          const [table, column] = value.split('.');
          return {
            id: s.id,
            table,
            column,
            direction: s.direction,
          };
        }
      })
    );
  };

  const handleDirectionChange = (sortId: string, direction: SortDirection) => {
    onSortFieldsChange(
      sortFields.map((s) => (s.id === sortId ? { ...s, direction } : s))
    );
  };

  const getSortValue = (sort: SortField): string => {
    if ('aggregateId' in sort && sort.aggregateId) {
      return `agg:${sort.aggregateId}`;
    }
    return `${sort.table}.${sort.column}`;
  };

  const getSortLabel = (sort: SortField): string => {
    if ('aggregateId' in sort && sort.aggregateId) {
      const agg = aggregates.find((a) => a.id === sort.aggregateId);
      return agg ? (agg.alias || `${agg.function}(${agg.column})`) : 'Unknown';
    }
    return `${sort.table}.${sort.column}`;
  };

  // Get options for a specific sort dropdown (current value + unselected options)
  const getOptionsForSort = (currentSortId: string) => {
    const currentSort = sortFields.find((s) => s.id === currentSortId);
    const currentValue = currentSort
      ? currentSort.aggregateId
        ? `agg:${currentSort.aggregateId}`
        : `${currentSort.table}.${currentSort.column}`
      : null;

    return availableColumns.filter(
      (col) => col.value === currentValue || !selectedSortKeys.has(col.value)
    );
  };

  const moveSort = (fromIndex: number, toIndex: number) => {
    const newFields = [...sortFields];
    const [removed] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, removed);
    onSortFieldsChange(newFields);
  };

  return (
    <StepContent>
      <StepHeader>
        <StepTitle>Sort & Limit Results</StepTitle>
        <StepDescription>
          Define how your results should be ordered and optionally limit the number of rows returned.
        </StepDescription>
      </StepHeader>

      <StepInstructions>
        <LightbulbIcon fontSize="small" />
        <span>
          <strong>Optional step:</strong> Without sorting, results are returned in an undefined order.
          Add sorts to organize your data predictably.
        </span>
      </StepInstructions>

      {sortFields.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#a1a1aa', mb: 2 }}>
            Sort Order ({sortFields.length})
          </Box>
          <ListContainer sx={{ gap: '8px' }}>
            {sortFields.map((sort, index) => (
              <SortCard key={sort.id}>
                <SortHandle>
                  <DragIndicatorIcon fontSize="small" />
                </SortHandle>
                
                <SortNumber>{index + 1}</SortNumber>

                <FormControl size="small" sx={{ flex: 1, minWidth: '200px' }}>
                  <InputLabel sx={{ color: '#71717a' }}>Sort by</InputLabel>
                  <StyledSelect
                    value={getSortValue(sort)}
                    onChange={(e) => handleUpdateSort(sort.id, e.target.value as string)}
                    label="Sort by"
                  >
                    {getOptionsForSort(sort.id).map((col) => (
                      <MenuItem key={col.value} value={col.value}>
                        {col.type === 'aggregate' && '📊 '}
                        {col.label}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>

                <DirectionToggle
                  value={sort.direction}
                  exclusive
                  onChange={(_, dir) => dir && handleDirectionChange(sort.id, dir)}
                  size="small"
                >
                  <ToggleButton value="ASC">
                    <ArrowUpwardIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                    Low to High
                  </ToggleButton>
                  <ToggleButton value="DESC">
                    <ArrowDownwardIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                    High to Low
                  </ToggleButton>
                </DirectionToggle>

                <RemoveButton onClick={() => handleRemoveSort(sort.id)}>
                  <DeleteOutlineIcon fontSize="small" />
                </RemoveButton>
              </SortCard>
            ))}
          </ListContainer>
        </Box>
      )}

      {availableForNewSort.length > 0 ? (
        <AddSortButton onClick={handleAddSort}>
          <AddIcon />
          <span>Add sort order</span>
        </AddSortButton>
      ) : sortFields.length > 0 ? (
        <Box sx={{ textAlign: 'center', py: 2, color: '#52525b', fontSize: '0.85rem' }}>
          All available columns are already in the sort order
        </Box>
      ) : (
        <AddSortButton onClick={handleAddSort}>
          <AddIcon />
          <span>Add sort order</span>
        </AddSortButton>
      )}

      {sortFields.length === 0 && (
        <EmptyState sx={{ mt: 2 }}>
          <EmptyIcon>
            <SortIcon />
          </EmptyIcon>
          <EmptyTitle>No Sorting Applied</EmptyTitle>
          <EmptyText>
            Results will be returned in the database's default order.
            Add sorting above to organize your results.
          </EmptyText>
        </EmptyState>
      )}

      {/* Limit & Offset / Pagination */}
      <LimitSection>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#a1a1aa' }}>
            Limit Results
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={pagination.enabled}
                onChange={(e) => onPaginationChange({ ...pagination, enabled: e.target.checked })}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#667eea' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#667eea' },
                }}
              />
            }
            label={
              <Box sx={{ fontSize: '0.8rem', color: '#a5b4fc' }}>
                <TuneIcon sx={{ fontSize: '0.9rem', mr: 0.5, verticalAlign: 'middle' }} />
                Enable pagination parameters
              </Box>
            }
          />
        </Box>

        {!pagination.enabled ? (
          <>
            <Box sx={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <FormField
                  fullWidth
                  size="small"
                  label="Maximum rows"
                  type="number"
                  value={limit ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onLimitChange(val ? parseInt(val, 10) : null);
                  }}
                  placeholder="No limit"
                  helperText="Leave empty to return all rows"
                  InputProps={{
                    inputProps: { min: 1 },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormField
                  fullWidth
                  size="small"
                  label="Skip first rows"
                  type="number"
                  value={offset ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onOffsetChange(val ? parseInt(val, 10) : null);
                  }}
                  placeholder="0"
                  helperText="Used for pagination"
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
                />
              </Box>
            </Box>
            {limit && (
              <Box sx={{ mt: 2, fontSize: '0.8rem', color: '#71717a' }}>
                {offset ? (
                  <>Will return rows {offset + 1} through {offset + limit}</>
                ) : (
                  <>Will return up to {limit} row{limit > 1 ? 's' : ''}</>
                )}
              </Box>
            )}
          </>
        ) : (
          <>
            <StepInstructions sx={{ mt: 0, mb: 2 }}>
              <LightbulbIcon fontSize="small" />
              <span>
                Pagination parameters <code>pagesize</code> and <code>pagecount</code> will be available when calling the API.
                The query will use <code>LIMIT pagesize OFFSET (pagecount - 1) * pagesize</code>.
              </span>
            </StepInstructions>
            
            <Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, p: 2, backgroundColor: '#12121a', borderRadius: '8px', border: '1px solid #2a2a3a' }}>
                <Box sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#e4e4e7', mb: 1 }}>
                  pagesize
                </Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pagination.pageSizeRequired}
                      onChange={(e) => onPaginationChange({ ...pagination, pageSizeRequired: e.target.checked })}
                      size="small"
                      sx={{
                        color: '#667eea',
                        '&.Mui-checked': { color: '#667eea' },
                      }}
                    />
                  }
                  label={<Box sx={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Required</Box>}
                />
                <FormField
                  fullWidth
                  size="small"
                  label="Default page size"
                  type="number"
                  value={pagination.defaultPageSize}
                  onChange={(e) => {
                    const val = e.target.value;
                    onPaginationChange({ ...pagination, defaultPageSize: val ? parseInt(val, 10) : 100 });
                  }}
                  helperText={pagination.pageSizeRequired ? 'Used when not provided' : 'Used when not provided'}
                  InputProps={{
                    inputProps: { min: 1 },
                  }}
                  sx={{ mt: 1 }}
                />
              </Box>
              <Box sx={{ flex: 1, p: 2, backgroundColor: '#12121a', borderRadius: '8px', border: '1px solid #2a2a3a' }}>
                <Box sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#e4e4e7', mb: 1 }}>
                  pagecount
                </Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pagination.pageCountRequired}
                      onChange={(e) => onPaginationChange({ ...pagination, pageCountRequired: e.target.checked })}
                      size="small"
                      sx={{
                        color: '#667eea',
                        '&.Mui-checked': { color: '#667eea' },
                      }}
                    />
                  }
                  label={<Box sx={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Required</Box>}
                />
                <Box sx={{ mt: 1, fontSize: '0.75rem', color: '#71717a' }}>
                  Page number (1-indexed). Defaults to 1 if not required.
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mt: 2, fontSize: '0.8rem', color: '#71717a' }}>
              Example: <code>?pagesize=50&pagecount=2</code> returns rows 51-100
            </Box>
          </>
        )}
      </LimitSection>
    </StepContent>
  );
};

export default SortingStep;
